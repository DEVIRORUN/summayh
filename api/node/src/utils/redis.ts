import Redis from "ioredis";

export function createBullMQConnection() {
    const redis = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
    });
    
    redis.on("connect", () => console.log("Redis connected"))
    redis.on("error", (err) => console.error("Redis error:", err));

    return redis;
}


export const redis = new Redis(process.env.REDIS_URL!);
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));
