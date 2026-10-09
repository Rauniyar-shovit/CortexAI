import Stripe from "stripe";
import { cleanEnv, str } from "envalid";

export const stripeEnv = cleanEnv(process.env, {
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),
  FRONTEND_URL: str({ default: "http://localhost:5173" }),
});

export const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY);
