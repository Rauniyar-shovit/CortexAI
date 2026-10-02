import { cleanEnv, str } from "envalid";
import type { Request, Response } from "express";
import axios from "axios";
import { graph } from "../graph/graph";
import { addMessage } from "../config/memory";
const env = cleanEnv(process.env, {
  CHAT_SERVICE: str(),
});

export const agent = async (req: Request, res: Response) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    await axios.post(`${env.CHAT_SERVICE}/save-message`, {
      content: prompt,
      conversationId,
      role: "user",
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
    });

    const response = result.aiResponse;

    console.log("ai response:", response);
    await addMessage(conversationId, "user", prompt);

    await addMessage(conversationId, "assistant", response);

    await axios.post(`${env.CHAT_SERVICE}/save-message`, {
      content: response,
      conversationId,
      role: "assistant",
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};
