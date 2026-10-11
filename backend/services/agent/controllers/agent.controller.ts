import { cleanEnv, str } from "envalid";
import type { Request, Response } from "express";
import axios from "axios";
import { graph } from "../graph/graph";
import { router } from "../graph/router";
import type { AgentName } from "../graph/state.ts";
import { addMessage } from "../config/memory";
import { deductCredit } from "../utils/deductCredit.ts";
const env = cleanEnv(process.env, {
  CHAT_SERVICE: str(),
});

type RunnableAgent = Exclude<AgentName, "auto">;

const AGENTS: RunnableAgent[] = [
  "chat",
  "search",
  "coding",
  "pdf",
  "ppt",
  "vision",
];

const isRunnableAgent = (name: string): name is RunnableAgent =>
  (AGENTS as string[]).includes(name);

export const agent = async (req: Request, res: Response) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const userId = req.headers["x-user-id"];

    if (typeof userId !== "string") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Pick the agent up front (the router skips its LLM call when one is
    // given) so we know what to charge; unknown answers fall back to chat
    const routed = (
      await router({ prompt, agent } as Parameters<typeof router>[0])
    ).agent;
    const resolvedAgent = isRunnableAgent(routed) ? routed : "chat";

    const credit = await deductCredit(userId, resolvedAgent);

    if (!credit.ok) {
      return credit.reason === "insufficient"
        ? res.status(402).json({
            message: "Not enough credits",
            cost: credit.cost,
            remainingCredits: credit.remainingCredits,
          })
        : res.status(502).json({ message: "Couldn't check your credits" });
    }

    await axios.post(`${env.CHAT_SERVICE}/save-message`, {
      content: prompt,
      conversationId,
      role: "user",
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent: resolvedAgent,
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
      artifacts: result?.artifacts,
    });

    return res.status(200).json({
      answer: response,
      images,
      artifacts: result.artifacts,
      remainingCredits: credit.remainingCredits,
    });
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};
