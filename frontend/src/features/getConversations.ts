import api from "../utils/axios";
import type { Conversation } from "../types/conversation";

const getConversations = async (): Promise<Conversation[] | null> => {
  try {
    const { data } = await api.get<Conversation[]>(
      "/api/chat/get-conversation",
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getConversations;
