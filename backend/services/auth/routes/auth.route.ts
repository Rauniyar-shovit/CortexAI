import express from "express";
import { login } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/login", login);

export default router;
