import Redis from "ioredis";

// Determine Redis host and port safely
const DEFAULT_REDIS_URL = process.env.REDIS_URL || "redis://host.docker.internal:6379";

export function createBullMQConnection() {
  const redisInstance = new Redis(DEFAULT_REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    keepAlive: 10000,
    retryStrategy(times) {
      if (times > 5) {
        console.error("Redis: giving up after 5 retries");
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisInstance.on("connect", () => console.log("BullMQ Redis connected"));
  redisInstance.on("error", (err) => console.error("BullMQ Redis error:", err.message));

  return redisInstance;
}

// Ensure standalone client also falls back to host.docker.internal
export const redis = new Redis(DEFAULT_REDIS_URL);

redis.on("connect", () => console.log("Global Redis connected"));
redis.on("error", (err) => console.error("Global Redis error:", err.message));