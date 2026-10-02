import { searchTool } from "../config/tavily";
import type { AgentState, SearchResponse } from "../graph/state";

export const searchAgent = async (state: AgentState): Promise<AgentState> => {
  try {
    const results: SearchResponse = await searchTool.invoke({
      query: state.prompt,
    });

    console.log(results);

    return {
      ...state,
      searchResults: results,
      images: results.images ?? [],
    };
  } catch (error) {
    console.error("Search agent error:", error);

    return {
      ...state,
      searchResults: null,
      images: [],
    };
  }
};
