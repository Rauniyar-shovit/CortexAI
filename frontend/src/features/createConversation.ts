import api from "../utils/axios";
import type { Conversation } from "../types/types";

const createConversation = async (): Promise<Conversation | null> => {
  try {
    const { data } = await api.get<Conversation>(
      "/api/chat/create-conversation",
    );

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default createConversation;
