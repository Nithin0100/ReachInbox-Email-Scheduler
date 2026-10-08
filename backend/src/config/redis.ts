import IORedis from "ioredis";
import { env } from "./env";

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});

redisConnection.on("connect", () => console.log("✅ Redis connected"));
redisConnection.on("error", (error) => console.error("❌ Redis error", error));
