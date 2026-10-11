import express from "express";
import {
  createCheckoutSession,
  createPortalSession,
  deductCredit,
  getSubscription,
} from "../controllers/billing.controller.ts";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/create-portal-session", createPortalSession);
router.get("/subscription", getSubscription);
router.post("/deduct-credit", deductCredit);

export default router;
