export type PlanKey = "free" | "starter" | "pro";

export type Plan = {
  id: PlanKey;
  name: string;
  amount: number;
  totalCredits: number;
  validity: number;
  // Lookup key set on the recurring Price in the Stripe Dashboard
  lookupKey?: string;
};

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    id: "free",
    name: "Free",
    amount: 0,
    totalCredits: 100,
    validity: 30,
  },
  starter: {
    id: "starter",
    name: "Starter",
    amount: 10,
    totalCredits: 500,
    validity: 30,
    lookupKey: "onyx_starter_monthly",
  },
  pro: {
    id: "pro",
    name: "Pro",
    amount: 30,
    totalCredits: 1000,
    validity: 30,
    lookupKey: "onyx_pro_monthly",
  },
};

export const getPlanByLookupKey = (lookupKey?: string | null) =>
  Object.values(PLANS).find((plan) => plan.lookupKey === lookupKey);
