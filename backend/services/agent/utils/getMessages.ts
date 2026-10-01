import { cleanEnv, str } from "envalid";
import axios from "axios";
import type { Message } from "../types/types.ts";
const env = cleanEnv(process.env, {
  CHAT_SERVICE: str(),
});

export const getMessages = async (
  conversationId: string,
): Promise<Message[] | null> => {
  try {
    const { data } = await axios.get<Message[]>(
      `${env.CHAT_SERVICE}/get-messages/${conversationId}`,
    );

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
