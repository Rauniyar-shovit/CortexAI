import { useEffect, useState } from "react";
import { X } from "lucide-react";
import createOrder from "../features/createOrder";
import createPortalSession from "../features/createPortalSession";
import getSubscription from "../features/getSubscription";
import type { PlanId, Subscription } from "../types/types";

const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

const DAY_MS = 24 * 60 * 60 * 1000;

const getRenewalText = (subscription: Subscription) => {
  if (subscription.status === "past_due") {
    return "Payment failed, update your card to keep your plan";
  }
  if (!subscription.currentPeriodEnd) {
    return "Upgrade for more monthly credits";
  }

  const days = Math.max(
    0,
    Math.ceil(
      (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / DAY_MS,
    ),
  );
  const verb = subscription.status === "canceled" ? "Ends" : "Renews";

  return `${verb} in ${days} ${days === 1 ? "day" : "days"}`;
};

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "A$10",
    credits: "500 credits / mo",
    cta: "Choose Starter",
    dot: "bg-ac2",
    popular: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "A$30",
    credits: "1,000 credits / mo",
    cta: "Upgrade to Pro",
    dot: "bg-ac",
    popular: true,
  },
];

type BillingDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const BillingDrawer = ({ open, onClose }: BillingDrawerProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(subscription);

  // Which button is waiting on Stripe: a plan id, or "portal"
  const [redirecting, setRedirecting] = useState<PlanId | "portal" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const isPaid = !!subscription && subscription.plan !== "free";

  // Refetch on every open so the drawer reflects a just-finished checkout
  useEffect(() => {
    if (!open) return;
    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);
      const data = await getSubscription();
      setSubscription(data);
      setLoading(false);
    };
    fetchSubscription();
  }, [open]);

  const openPortal = async () => {
    setRedirecting("portal");
    const portalUrl = await createPortalSession();
    if (portalUrl) {
      window.location.href = portalUrl;
      return;
    }
    setError("Couldn't open the billing portal, please try again");
    setRedirecting(null);
  };

  const handleChoosePlan = async (plan: PlanId) => {
    setError(null);

    if (isPaid) {
      await openPortal();
      return;
    }

    setRedirecting(plan);
    const order = await createOrder(plan);

    if (order?.checkoutUrl) {
      window.location.href = order.checkoutUrl;
      return;
    }
    if (order?.alreadySubscribed) {
      await openPortal();
      return;
    }

    setError("Couldn't start checkout, please try again");
    setRedirecting(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-[rgba(30,20,60,0.18)] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Billing"
        className={`fixed inset-y-3.5 right-3.5 z-21 flex w-[360px] max-w-[calc(100vw-28px)] flex-col gap-3.5 overflow-y-auto rounded-[22px] bg-sb p-5 shadow-[0_20px_50px_rgba(30,20,60,0.18)] transition-transform duration-500 ease-[cubic-bezier(.3,.7,.2,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-[calc(100%+30px)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="text-[22px] font-extrabold text-ink">Billing</div>
            <div className="text-sm text-mu">Plans &amp; credits</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close billing"
            className="ml-auto flex size-[34px] cursor-pointer items-center justify-center rounded-full bg-sf2 text-mu transition-colors hover:text-ink"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Current plan */}
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-sf p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-bold text-mu">Current plan</div>
            {subscription && (
              <div className="ml-auto rounded-full bg-ac px-[9px] py-[3px] text-xs font-bold text-aci">
                {PLAN_NAMES[subscription.plan]}
              </div>
            )}
          </div>
          {subscription ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <div className="text-[28px] font-extrabold text-ink">
                  {subscription.credits.toLocaleString()}
                </div>
                <div className="text-sm font-bold text-mu">credits / month</div>
              </div>
              <div
                className={`text-xs ${
                  subscription.status === "past_due"
                    ? "font-bold text-ink"
                    : "text-mu"
                }`}
              >
                {getRenewalText(subscription)}
              </div>
              {isPaid && (
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={!!redirecting}
                  className="flex h-9 cursor-pointer items-center justify-center rounded-xl bg-sf2 text-[13px] font-extrabold text-ink transition-opacity hover:opacity-85 disabled:cursor-default disabled:opacity-50"
                >
                  {redirecting === "portal" ? "Opening…" : "Manage billing"}
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-mu">
              {loading ? "Loading…" : "Couldn't load your plan"}
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="text-center text-xs font-bold text-ink">
            {error}
          </div>
        )}

        {/* Plans */}
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col gap-2.5 rounded-[20px] bg-sf p-4 ${
              plan.popular ? "shadow-[0_0_0_2px_var(--ac)]" : "shadow-soft"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`size-2.5 rounded-full ${plan.dot}`} />
              <div className="text-base font-extrabold text-ink">
                {plan.name}
              </div>
              {plan.popular && (
                <div className="rounded-full bg-ac px-2 py-0.5 text-[11px] font-extrabold text-aci">
                  Popular
                </div>
              )}
              <div className="ml-auto text-[13px] font-bold text-mu">
                {plan.credits}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-[30px] font-extrabold text-ink">
                {plan.price}
              </div>
              <div className="text-[13px] text-mu">/ month</div>
            </div>
            <button
              type="button"
              onClick={() => handleChoosePlan(plan.id)}
              disabled={subscription?.plan === plan.id || !!redirecting}
              className={`flex h-[42px] cursor-pointer items-center justify-center rounded-[14px] text-sm font-extrabold transition-opacity hover:opacity-85 disabled:cursor-default disabled:opacity-50 ${
                plan.popular ? "bg-ink text-bg" : "bg-sf2 text-ink"
              }`}
            >
              {subscription?.plan === plan.id
                ? "Current plan"
                : redirecting === plan.id
                  ? "Redirecting…"
                  : plan.cta}
            </button>
          </div>
        ))}

        <div className="mt-auto text-center text-xs text-mu">
          Cancel anytime. Unused credits don't roll over.
        </div>
      </aside>
    </>
  );
};

export default BillingDrawer;
