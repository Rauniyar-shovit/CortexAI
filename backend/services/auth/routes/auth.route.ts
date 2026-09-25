import express from "express";
import {
  getCurrentUser,
  login,
  logOut,
} from "../controllers/auth.controller.ts";
import protect from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logOut);
router.get("/getCurrentUser", protect, getCurrentUser);
export default router;
