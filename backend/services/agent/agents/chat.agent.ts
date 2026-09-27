import { getModel } from "../config/llmModels";
import { AgentState } from "../graph/state";

export const chatAgent = async (state: AgentState) => {
  const llm = await getModel("chat");

  const systemPrompt = "Your are OnyxAI, an intelligent AI assistant ";
  const response = await llm.invoke([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "human",
      content: state.prompt,
    },
  ]);

  return {
    ...state,
    aiResponse: response.content,
  };
};
