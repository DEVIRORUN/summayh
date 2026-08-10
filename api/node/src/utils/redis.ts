import Redis from "ioredis";

export function createBullMQConnection() {
    const redis = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        connectTimeout: 10000,
        retryStrategy(times) {
            if (times > 5) {
                console.error("Redis: giving up after 5 retries");
                return null;
            }
            return Math.min(times * 200, 2000)
        }
    });
    
    redis.on("connect", () => console.log("Redis connected"))
    redis.on("error", (err) => console.error("Redis error:", err));

    return redis;
}


export const redis = new Redis(process.env.REDIS_URL!);
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));
