import type { AgentId, Artifact } from "../types/types";
import api from "../utils/axios";

type Payload = {
  prompt: string;
  conversationId: string | undefined;
  agent: AgentId;
};

export type AgentResponse = {
  answer: string;
  images: string[];
  artifacts: Artifact[];
};
const sendMessage = async (payload: Payload) => {
  try {
    const { data } = await api.post<AgentResponse>("/api/agent/chat", payload);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendMessage;
