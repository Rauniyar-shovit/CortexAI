import express from "express";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "../controllers/billing.controller.ts";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/create-portal-session", createPortalSession);
router.get("/subscription", getSubscription);

export default router;
