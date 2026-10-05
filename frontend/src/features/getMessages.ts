import api from "../utils/axios";
import type { Message } from "../types/types";

const getMessages = async (id: string | undefined): Promise<Message[]> => {
  if (!id) return [];

  try {
    const { data } = await api.get<Message[]>(`/api/chat/get-messages/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getMessages;
