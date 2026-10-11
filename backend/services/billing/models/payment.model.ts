import mongoose, { InferSchemaType, model } from "mongoose";

// One document per payment: the first checkout or a renewal invoice.
// A user's current plan is their latest paid payment.
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // Only set for payments that started from a Checkout session
    stripeSessionId: String,
    // Stripe invoice ID, unique so retried webhooks don't duplicate payments
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: {
      type: String,
      index: true,
    },
    amount: Number,
    currency: {
      type: String,
      default: "AUD",
    },
    // Credits spent this period; a renewal or plan change is a new
    // document, so the count starts again from 0
    usedCredits: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 100,
    },
    plan: {
      type: String,
    },
    status: {
      type: String,
      // "free" is the credit allowance for users without a paid plan
      enum: ["created", "paid", "failed", "cancelled", "free"],
    },
    // Mirrors Stripe's subscription status (active, past_due, canceled, ...)
    subscriptionStatus: String,
    currentPeriodEnd: Date,
    // When a scheduled cancellation takes effect; null if it will renew
    cancelAt: Date,
  },
  { timestamps: true },
);

// One free credit allowance per user; getCreditAccount relies on this to
// stop its upsert from creating duplicates
paymentSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "free" } },
);

export type Payment = InferSchemaType<typeof paymentSchema>;

const Payment = model("Payment", paymentSchema);
export default Payment;
