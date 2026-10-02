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

    if (typeof response !== "string" || !response) {
      return res
        .status(501)
        .json({ message: `agent "${result.agent}" did not return a response` });
    }
    await addMessage(conversationId, "user", prompt);

    await addMessage(conversationId, "assistant", response);

    const images = result.images?.map((image) => image.url) ?? [];

    await axios.post(`${env.CHAT_SERVICE}/save-message`, {
      content: response,
      conversationId,
      role: "assistant",
      images,
    });

    return res.status(200).json({ answer: response, images });
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};
