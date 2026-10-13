import redis from "../../../shared/redis/redis.ts";
import type { AgentName } from "../graph/state.ts";

const Limits: Record<string, number> = {
  chat: 20,
  coding: 5,
  pdf: 5,
  ppt: 5,
  vision: 3,
  pdfRag: 5,
  imageAnalyzer: 5,
  search: 5,
};

export const checkAgentLimit = async (userId: string, agent: AgentName) => {
  const max = Limits[agent] ?? Limits["chat"];
  const key = `rate:${userId}:${agent}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60);
  }

  const ttl = await redis.ttl(key);

  if (count > max) {
    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    const time = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const error = new Error(`Rate limit exceed for ${agent}`) as Error & {
      status: number;
      data: Record<string, unknown>;
    };
    error.status = 429;
    error.data = {
      success: false,
      agent,
      limit: max,
      remainingTime: ttl,
      retryAfter: time,
      message: `You have reached the ${agent} limit (${max} requests/minutes). Try again in ${time}`,
    };

    throw error;
  }

  return {
    remaining: max - count,
    limit: max,
  };
};
