import redis from "../../../shared/redis/redis.ts";
import { getMessages } from "../utils/getMessages.ts";
import type { Message, MessageRole } from "../types/types.ts";

export const getMemory = async (conversationId: string) => {
  const key = `messages-${conversationId}`;
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached) as Message[];
  }

  const messages = await getMessages(conversationId);
  await redis.set(key, JSON.stringify(messages), "EX", 24 * 60 * 60);
};

export const addMessage = async (
  conversationId: string,
  role: MessageRole,
  content: string,
) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  const messages: Message[] = rawMessages ? JSON.parse(rawMessages) : [];

  messages.push({ role, content });

  if (messages.length > 20) {
    messages.shift();
  }

  await redis.set(key, JSON.stringify(messages));
};
