import { Request, Response } from "express";
import Stripe from "stripe";
import { PLANS, Plan, PlanKey, getPlanByLookupKey } from "../config/Plans.ts";
import { stripe, stripeEnv } from "../config/stripe.ts";
import Payment from "../models/payment.model.ts";

const getUserId = (req: Request) => {
  const userId = req.headers["x-user-id"];
  return typeof userId === "string" ? userId : null;
};

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

// The user's current plan is their most recent paid (or cancelled) payment
const getLatestPayment = (userId: string) =>
  Payment.findOne({ userId, status: { $in: ["paid", "cancelled"] } }).sort({
    createdAt: -1,
  });

// Any payment (even created/failed) may hold the user's Stripe customer
const getStripeCustomerId = async (userId: string) => {
  const payment = await Payment.findOne({
    userId,
    stripeCustomerId: { $exists: true, $ne: null },
  }).sort({ createdAt: -1 });

  return payment?.stripeCustomerId ?? undefined;
};

// Step 1: send the user to a Stripe-hosted Checkout page for the chosen plan
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan: PlanKey };
    const selectedPlan: Plan | undefined = PLANS[plan];
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!selectedPlan) {
      return res.status(400).json({ message: "Plan not found" });
    }

    // Free plan doesn't need Stripe
    if (selectedPlan.id === "free") {
      return res.status(200).json({
        message: "Free plan selected",
        plan: selectedPlan,
      });
    }

    const latest = await getLatestPayment(userId);

    // Plan changes for paying users go through the customer portal
    if (
      latest?.status === "paid" &&
      ACTIVE_STATUSES.includes(latest.subscriptionStatus ?? "")
    ) {
      return res.status(409).json({
        message: "Already subscribed, use the billing portal to change plan",
      });
    }

    const stripeCustomerId = await getStripeCustomerId(userId);
    const priceId = await getPriceId(selectedPlan);

    if (!priceId) {
      return res.status(500).json({
        message: "Stripe price is not configured for this plan",
      });
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      client_reference_id: userId,
      // Reuse the Stripe customer if this user has subscribed before
      ...(stripeCustomerId && { customer: stripeCustomerId }),
      metadata: { userId, plan: selectedPlan.id },
      subscription_data: {
        metadata: { userId, plan: selectedPlan.id },
      },
      success_url: `${stripeEnv.FRONTEND_URL}/home?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${stripeEnv.FRONTEND_URL}/home?cancelled=true`,
    });

    await Payment.create({
      userId,
      stripeSessionId: session.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: "AUD",
      status: "created",
    });

    return res.status(201).json({
      message: "Checkout session created",
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return res
      .status(500)
      .json({ message: "Failed to create checkout session" });
  }
};

// Step 2: let a subscribed user manage/cancel their plan in the Stripe portal
export const createPortalSession = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const stripeCustomerId = await getStripeCustomerId(userId);

    if (!stripeCustomerId) {
      return res.status(404).json({ message: "No billing account found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${stripeEnv.FRONTEND_URL}/home`,
    });

    return res.status(200).json({ portalUrl: portalSession.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return res.status(500).json({ message: "Failed to create portal session" });
  }
};

export const getSubscription = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const latest = await getLatestPayment(userId);

    if (!latest || latest.status === "cancelled") {
      return res.status(200).json({
        plan: PLANS.free.id,
        status: "active",
        credits: PLANS.free.credits,
        currentPeriodEnd: null,
      });
    }

    return res.status(200).json({
      plan: latest.plan,
      status: latest.subscriptionStatus,
      credits: latest.credits,
      currentPeriodEnd: latest.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return res.status(500).json({ message: "Failed to fetch subscription" });
  }
};

// Step 3: Stripe tells us what actually happened. This is the source of truth
// for granting credits; the success_url redirect alone proves nothing.
export const handleWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"] as string,
      stripeEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.sendStatus(400);
  }

  console.log("==================+WEBHOOOK=============");
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    // Non-2xx makes Stripe retry the event later
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
};

const getPriceId = async (plan: Plan) => {
  if (!plan.lookupKey) return null;

  const prices = await stripe.prices.list({
    lookup_keys: [plan.lookupKey],
    active: true,
  });

  return prices.data[0]?.id ?? null;
};

const getId = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : value?.id;

// Link the Checkout payment to the Stripe customer and subscription.
// Marking it paid is left to invoice.paid.
const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  await Payment.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      stripeCustomerId: getId(session.customer),
      stripeSubscriptionId: getId(session.subscription),
    },
  );
};

// Fires for the first payment and every renewal or plan change
const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  const subscriptionId = getId(
    invoice.parent?.subscription_details?.subscription,
  );

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  const item = subscription.items.data[0];
  const plan = getPlanByLookupKey(item?.price.lookup_key) || PLANS.free;

  // The first invoice belongs to the Payment created at checkout; it can
  // arrive before checkout.session.completed, so look the session up here
  let stripeSessionId: string | undefined;
  if (invoice.billing_reason === "subscription_create") {
    const sessions = await stripe.checkout.sessions.list({
      subscription: subscriptionId,
      limit: 1,
    });
    stripeSessionId = sessions.data[0]?.id;
  }

  await Payment.findOneAndUpdate(
    stripeSessionId ? { stripeSessionId } : { paymentId: invoice.id },
    {
      userId,
      paymentId: invoice.id,
      stripeCustomerId: getId(subscription.customer),
      stripeSubscriptionId: subscriptionId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      credits: plan.credits,
      plan: plan.id,
      status: "paid",
      subscriptionStatus: subscription.status,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    },
    { upsert: true },
  );
};

// Stripe retries the charge automatically; the subscription moves to
// past_due and customer.subscription.updated keeps the latest payment in sync
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const details = invoice.parent?.subscription_details;
  const subscriptionId = getId(details?.subscription);

  if (!subscriptionId) return;

  // The invoice's metadata snapshot can be empty, so fall back to the
  // subscription, which always carries the userId set at checkout
  let metadata = details?.metadata;
  if (!metadata?.userId) {
    metadata = (await stripe.subscriptions.retrieve(subscriptionId)).metadata;
  }

  const userId = metadata?.userId;

  if (!userId) return;

  await Payment.findOneAndUpdate(
    { paymentId: invoice.id },
    {
      userId,
      paymentId: invoice.id,
      stripeCustomerId: getId(invoice.customer),
      stripeSubscriptionId: subscriptionId,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      plan: metadata?.plan,
      status: "failed",
    },
    { upsert: true },
  );
};

// Copy status/plan/period from Stripe onto the latest paid payment for this
// subscription. A cancelled subscription marks it "cancelled" (back to free).
const syncSubscription = async (subscription: Stripe.Subscription) => {
  const item = subscription.items.data[0];
  const isEnded = subscription.status === "canceled";
  const plan = getPlanByLookupKey(item?.price.lookup_key);

  await Payment.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id, status: "paid" },
    {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      ...(plan && { plan: plan.id }),
      ...(isEnded && { status: "cancelled" }),
    },
    { sort: { createdAt: -1 } },
  );
};
