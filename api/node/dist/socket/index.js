"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const cookie = require("cookie");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const presence_service_1 = require("../services/presence.service");
function initSocket(io) {
    io.use((socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie ?? "";
            if (!rawCookie)
                return next(new Error("No cookie"));
            const parsed = cookie.parseCookie(rawCookie);
            const token = parsed.token;
            if (!token)
                return next(new Error("No token"));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.userId;
            next();
        }
        catch (err) {
            next(new Error('Unauthorized'));
        }
    });
    io.on("connection", (socket) => {
        const { userId } = socket.data;
        socket.join(`user:${userId}`);
        presence_service_1.PresenceService.markUserOnline(userId);
        const heartbeat = setInterval(() => presence_service_1.PresenceService.markUserOnline(userId), 30_000);
        socket.on("disconnect", () => {
            clearInterval(heartbeat);
            presence_service_1.PresenceService.markUserOffline(userId);
        });
    });
}
