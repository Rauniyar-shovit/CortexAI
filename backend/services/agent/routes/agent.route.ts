import express from "express";
import { agent } from "../controllers/agent.controller.ts";
import multer from "../config/multer.ts";

const router = express.Router();

router.post("/chat", multer.single("file"), agent);

export default router;
