import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmModels";
import { getMemory } from "../config/memory";
import { AgentState } from "../graph/state";
import type { Message } from "../types/types";

export const chatAgent = async (state: AgentState) => {
  const llm = await getModel("chat");

  const history = await getMemory(state.conversationId);

  const systemPrompt = `Your are OnyxAI, an intelligent AI assistant 

  Rules:
- For simple questions, greetings, and short queries, respond naturally in plain
- For technical, educational, coding, or detailed topics, use clean Markdown.
 
  Formatting
- Use # for titles and it for sections.
- Leave a blank Line after headings.
- Use bullet points for lists.
- Use numbered Lists for steps•
- Use fenced code blocks with Language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate Large walls of text.
`;

  const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];

  history?.forEach((msg: Message) => {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    }
    if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  });

  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);

  return {
    ...state,
    aiResponse: response.content,
  };
};
