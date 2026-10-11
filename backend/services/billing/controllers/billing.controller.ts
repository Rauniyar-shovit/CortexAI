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

    let stripeCustomerId = await getStripeCustomerId(userId);

    if (stripeCustomerId) {
      // Ask Stripe rather than our DB, which lags behind (or misses) webhooks
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 10,
      });

      // Plan changes for paying users go through the customer portal
      if (subscriptions.data.some((s) => ACTIVE_STATUSES.includes(s.status))) {
        return res.status(409).json({
          message: "Already subscribed, use the billing portal to change plan",
        });
      }
    } else {
      // Create the customer up front and save it on the Payment below, so
      // repeat checkouts reuse it instead of Stripe making a new one each time
      const customer = await stripe.customers.create({ metadata: { userId } });
      stripeCustomerId = customer.id;
    }

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
      customer: stripeCustomerId,
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
      stripeCustomerId,
      amount: selectedPlan.amount,
      totalCredits: selectedPlan.totalCredits,
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

    const { plan } = (req.body ?? {}) as { plan?: PlanKey };
    const stripeCustomerId = await getStripeCustomerId(userId);

    if (!stripeCustomerId) {
      return res.status(404).json({ message: "No billing account found" });
    }

    const returnUrl = `${stripeEnv.FRONTEND_URL}/home`;
    const params: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: returnUrl,
    };

    // Switching paid plans: skip the portal homepage and open Stripe's
    // confirm page for the new price, which shows the prorated charge
    const selectedPlan = plan ? PLANS[plan] : undefined;
    if (selectedPlan?.lookupKey) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 10,
      });
      const subscription = subscriptions.data.find((s) =>
        ACTIVE_STATUSES.includes(s.status),
      );
      const item = subscription?.items.data[0];
      const priceId = await getPriceId(selectedPlan);

      if (subscription && item && priceId && item.price.id !== priceId) {
        params.configuration = await getPlanChangePortalConfig();
        params.flow_data = {
          type: "subscription_update_confirm",
          subscription_update_confirm: {
            subscription: subscription.id,
            items: [{ id: item.id, price: priceId, quantity: 1 }],
          },
          after_completion: {
            type: "redirect",
            redirect: { return_url: returnUrl },
          },
        };
      }
    }

    const portalSession = await stripe.billingPortal.sessions.create(params);

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

    const account = await getCreditAccount(userId);
    const isFree = account.status === "free";

    return res.status(200).json({
      plan: account.plan,
      status: isFree ? "active" : account.subscriptionStatus,
      totalCredits: account.totalCredits,
      usedCredits: account.usedCredits,
      // Free credits reset at period end, but there's nothing to renew
      currentPeriodEnd: isFree ? null : account.currentPeriodEnd,
      cancelAt: account.cancelAt ?? null,
      // Paid credits reset on renewal, free ones when the free period ends
      creditsResetAt: account.currentPeriodEnd ?? null,
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

// The default portal (Dashboard settings) may not allow plan changes, so
// plan switches use our own configuration. Found by metadata so restarts
// reuse it instead of creating a new one each time.
let planChangePortalConfig: Promise<string> | null = null;

const getPlanChangePortalConfig = () => {
  planChangePortalConfig ??= (async () => {
    const existing = await stripe.billingPortal.configurations.list({
      active: true,
      limit: 100,
    });
    const found = existing.data.find(
      (c) => c.metadata?.purpose === "plan_change",
    );
    if (found) return found.id;

    const lookupKeys = Object.values(PLANS).flatMap((p) =>
      p.lookupKey ? [p.lookupKey] : [],
    );
    const prices = await stripe.prices.list({
      lookup_keys: lookupKeys,
      active: true,
    });

    // Group the plan prices under their products
    const products = new Map<string, string[]>();
    for (const price of prices.data) {
      const product = getId(price.product)!;
      products.set(product, [...(products.get(product) ?? []), price.id]);
    }

    const config = await stripe.billingPortal.configurations.create({
      metadata: { purpose: "plan_change" },
      features: {
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          // Charge the difference now so invoice.paid grants the new credits
          proration_behavior: "always_invoice",
          products: [...products].map(([product, prices]) => ({
            product,
            prices,
          })),
        },
      },
    });
    return config.id;
  })().catch((error) => {
    // Don't cache a failure; try again on the next request
    planChangePortalConfig = null;
    throw error;
  });

  return planChangePortalConfig;
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
      totalCredits: plan.totalCredits,
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
// subscription. Cancelling in the portal only schedules it (cancel_at); the
// deleted event at period end marks it "cancelled" (back to free).
const syncSubscription = async (subscription: Stripe.Subscription) => {
  const item = subscription.items.data[0];
  const isEnded = subscription.status === "canceled";
  const plan = getPlanByLookupKey(item?.price.lookup_key);

  const data = await Payment.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id, status: "paid" },
    {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
      ...(plan && { plan: plan.id }),
      ...(isEnded && { status: "cancelled" }),
    },
    { sort: { createdAt: -1 } },
  );
  console.log(data);
};

// Credits each agent costs per request
const AGENT_COSTS = {
  chat: 1,
  search: 5,
  coding: 10,
  pdf: 10,
  ppt: 10,
  vision: 10,
} as const;

type Agent = keyof typeof AGENT_COSTS;

// The Payment whose credits the user is spending: their active paid plan,
// or else a free allowance that resets every PLANS.free.validity days
const getCreditAccount = async (userId: string) => {
  const latest = await getLatestPayment(userId);

  if (
    latest?.status === "paid" &&
    ACTIVE_STATUSES.includes(latest.subscriptionStatus ?? "")
  ) {
    return latest;
  }

  const now = new Date();
  const nextPeriodEnd = new Date(
    now.getTime() + PLANS.free.validity * 24 * 60 * 60 * 1000,
  );

  // Start a fresh free period if there's none yet or the last one ended.
  // The filter only matches a missing or expired period, so concurrent
  // requests can't reset credits twice
  try {
    await Payment.findOneAndUpdate(
      {
        userId,
        status: "free",
        $or: [{ currentPeriodEnd: { $lte: now } }, { currentPeriodEnd: null }],
      },
      {
        plan: PLANS.free.id,
        usedCredits: 0,
        totalCredits: PLANS.free.totalCredits,
        currentPeriodEnd: nextPeriodEnd,
      },
      { upsert: true },
    );
  } catch (error) {
    // A live free period exists, so the upsert collided; nothing to reset
    if ((error as { code?: number }).code !== 11000) throw error;
  }

  const free = await Payment.findOne({ userId, status: "free" });
  if (!free) throw new Error(`Free credit account missing for ${userId}`);
  return free;
};

// Called before running an agent: spends its cost, or 402 if the user
// doesn't have enough credits left this period
export const deductCredit = async (req: Request, res: Response) => {
  try {
    const { agent } = req.body as { agent?: Agent };
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!agent || !(agent in AGENT_COSTS)) {
      return res.status(400).json({ message: "Unknown agent" });
    }

    const cost = AGENT_COSTS[agent];
    const account = await getCreditAccount(userId);

    // Check and spend in one atomic update so parallel requests can't
    // overspend between reading the balance and writing it
    const updated = await Payment.findOneAndUpdate(
      {
        _id: account._id,
        $expr: {
          $lte: [{ $add: ["$usedCredits", cost] }, "$totalCredits"],
        },
      },
      { $inc: { usedCredits: cost } },
      { new: true },
    );

    if (!updated) {
      return res.status(402).json({
        message: "Not enough credits",
        cost,
        remainingCredits: account.totalCredits - account.usedCredits,
      });
    }

    return res.status(200).json({
      cost,
      usedCredits: updated.usedCredits,
      totalCredits: updated.totalCredits,
      remainingCredits: updated.totalCredits - updated.usedCredits,
    });
  } catch (error) {
    console.error("Deduct credit error:", error);
    return res.status(500).json({ message: "Failed to deduct credits" });
  }
};
