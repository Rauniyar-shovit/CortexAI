import type { Request, Response } from "express";
import Conversation from "../models/conversation.model.ts";
import Message from "../models/message.model.ts";

export const createConverstion = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);

    const conversation = await Conversation.create({
      userId: userId as string,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `create conversation error ${error}` });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);

    const conversation = await Conversation.find({
      userId: userId as string,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `get conversation error ${error}` });
  }
};

export const saveMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, role, content } = req.body;

    const message = await Message.create({
      conversationId,
      role,
      content,
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: `save message error ${error}` });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `get message error ${error}` });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(id, { title });

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update conversation error ${error}` });
  }
};
