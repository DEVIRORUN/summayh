import { redis } from "../utils/redis";

const PRESENSE_TTL = 60; // seconds

export class PresenceService {
    static async markUserOnline(userId: string) {
        await redis.set(`presence:${userId}`, '1', 'EX', PRESENSE_TTL);// auto disconnectr after 60 even without clean disconnect
    }
    static async markUserOffline(userId: string) {
        await redis.del(`presence:${userId}`)
    }
    static async isUserOnline(userId: string): Promise<boolean> {
        const val = await redis.get(`presence:${userId}`)
        return val !== null;
    }
}