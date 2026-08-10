"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceService = void 0;
const redis_1 = require("../utils/redis");
const PRESENSE_TTL = 60; // seconds
class PresenceService {
    static async markUserOnline(userId) {
        await redis_1.redis.set(`presence:${userId}`, '1', 'EX', PRESENSE_TTL); // auto disconnectr after 60 even without clean disconnect
    }
    static async markUserOffline(userId) {
        await redis_1.redis.del(`presence:${userId}`);
    }
    static async isUserOnline(userId) {
        const val = await redis_1.redis.get(`presence:${userId}`);
        return val !== null;
    }
}
exports.PresenceService = PresenceService;
