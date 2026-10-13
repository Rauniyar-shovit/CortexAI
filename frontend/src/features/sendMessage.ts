import type { Artifact } from "../types/types";
import axios from "axios";
import api from "../utils/axios";

export type AgentResponse = {
  answer: string;
  images: string[];
  artifacts: Artifact[];
  remainingCredits: number;
};

export type NoCreditsResponse = {
  noCredits: true;
  cost: number;
  remainingCredits: number;
};

const sendMessage = async (
  payload: FormData,
): Promise<AgentResponse | NoCreditsResponse | null> => {
  try {
    const { data } = await api.post<AgentResponse>("/api/agent/chat", payload);
    return data;
  } catch (error) {
    // 402: the agent didn't run because the user can't afford it
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      const { cost, remainingCredits } = error.response.data;
      return { noCredits: true, cost, remainingCredits };
    }
    console.log(error);
    return null;
  }
};

export default sendMessage;
