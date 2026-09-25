import { Redis } from "ioredis";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  REDIS_URL: str(),
});

const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  console.log("redis connected");
});

export default redis;
