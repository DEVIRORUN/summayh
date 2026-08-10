import { Server, Socket } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken"
import { PresenceService } from "../services/presence.service";

interface AuthedSocket extends Socket {
    data: { userId: string };
}

interface CustomJwtPayload extends jwt.JwtPayload {
    userId: string;
}

export function initSocket(io: Server) {
    io.use((socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie ?? "";
            if (!rawCookie) return next(new Error("No cookie"));

            const parsed = cookie.parseCookie(rawCookie);
            const token = parsed.token;

            if (!token) return next(new Error("No token"));

            const decoded = jwt.verify(
                token, 
                process.env.JWT_SECRET!
            ) as CustomJwtPayload;
            socket.data.userId =  decoded.userId
            next();
        } catch (err) {
            next(new Error('Unauthorized'))
        }
    });

    io.on("connection", (socket: AuthedSocket) => {
        const { userId } = socket.data;
        PresenceService.markUserOnline(userId);

        const heartbeat = setInterval(() => PresenceService.markUserOnline(userId), 30_000);

        socket.on("disconnect", () => {
            clearInterval(heartbeat);
            PresenceService.markUserOffline(userId);
        })
    })
} 