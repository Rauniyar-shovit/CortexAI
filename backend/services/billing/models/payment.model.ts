import mongoose, { InferSchemaType, model } from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },

  paymentId: String,
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
    enum: ["created", "paid", "failed"],
  },
});

export type Payment = InferSchemaType<typeof paymentSchema>;

const Payment = model("Payment", paymentSchema);
export default Payment;
