import { Annotation } from "@langchain/langgraph";
import type { TavilySearchResponseWithImageDescriptions } from "@langchain/tavily";

export type AgentName =
  | "search"
  | "chat"
  | "coding"
  | "vision"
  | "pdf"
  | "ppt"
  | "auto";

export type SearchResponse = TavilySearchResponseWithImageDescriptions;
export type SearchImage = NonNullable<SearchResponse["images"]>[number];

export const agentState = Annotation.Root({
  prompt: Annotation<string>(),
  aiResponse: Annotation<string>(),
  agent: Annotation<AgentName>(),
  conversationId: Annotation<string>(),
  searchResults: Annotation<SearchResponse | null>(),
  images: Annotation<SearchImage[]>(),
  artifacts: Annotation(),
});

// Shape of the state values passed to each node
export type AgentState = typeof agentState.State;
