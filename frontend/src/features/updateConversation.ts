import api from "../utils/axios";
import type { Conversation } from "../types/types";

const updateConversation = async (payload: {
  id: string;
  title: string;
}): Promise<Conversation | null> => {
  try {
    const { data } = await api.post<Conversation>(
      "/api/chat/update-conversation",
      payload,
    );

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default updateConversation;
