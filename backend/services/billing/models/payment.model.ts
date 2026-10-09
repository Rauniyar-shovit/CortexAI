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
    credits: {
      type: Number,
    },
    plan: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cancelled"],
    },
    // Mirrors Stripe's subscription status (active, past_due, canceled, ...)
    subscriptionStatus: String,
    currentPeriodEnd: Date,
  },
  { timestamps: true },
);

export type Payment = InferSchemaType<typeof paymentSchema>;

const Payment = model("Payment", paymentSchema);
export default Payment;
