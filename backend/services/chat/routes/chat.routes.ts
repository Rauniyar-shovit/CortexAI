import express from "express";
import {
  createConverstion,
  getConversations,
  getMessages,
  saveMessage,
  updateConversation,
} from "../controllers/chat.controllers.ts";

const router = express.Router();

router.get("/create-conversation", createConverstion);
router.get("/get-conversation", getConversations);
router.post("/update-conversation", updateConversation);
router.post("/save-message", saveMessage);
router.post("/get-message/:conversationId", getMessages);

export default router;
