import { searchTool } from "../config/tavily.ts";
import type { AgentState, SearchResponse } from "../graph/state.ts";
import { checkAgentLimit } from "../config/agentLimit.ts";

export const searchAgent = async (state: AgentState): Promise<AgentState> => {
  try {
    await checkAgentLimit(state.userId, "search");
    const results: SearchResponse = await searchTool.invoke({
      query: state.prompt,
    });

    console.log(results);

    return {
      ...state,
      searchResults: results,
      images: results.images ?? [],
    };
  } catch (error: any) {
    if (error.status === 429) {
      return {
        ...state,
        aiResponse: error?.data.message,
      };
    }
    console.error("Search agent error:", error);

    return {
      ...state,
      searchResults: null,
      images: [],
    };
  }
};
