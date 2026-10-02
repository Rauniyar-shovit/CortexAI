import { Annotation } from "@langchain/langgraph";

export type AgentName =
  | "search"
  | "chat"
  | "coding"
  | "vision"
  | "pdf"
  | "ppt"
  | "auto";

export const agentState = Annotation.Root({
  prompt: Annotation<string>(),
  aiResponse: Annotation<string>(),
  agent: Annotation<AgentName>(),
  conversationId: Annotation<string>(),
});

// Shape of the state values passed to each node
export type AgentState = typeof agentState.State;
