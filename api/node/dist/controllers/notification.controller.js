"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_1 = require("../utils/prisma");
class NotificationController {
    static async list(req, res) {
        console.log("[NOTIFICATION]: HIT!!!");
        const userId = req.userId; // however you attach auth'd user elsewhere
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const [notifications, unreadCount] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
            prisma_1.prisma.notification.count({ where: { userId, read: false } }),
        ]);
        console.log("[NOTIFICATION]: SUCCESSFUL!!!");
        return res.json({ notifications, unreadCount });
    }
    static async markRead(req, res) {
        console.log("[NOTIFICATION MARK ONE READ]: HIT!!!");
        const userId = req.userId;
        const id = req.params.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        await prisma_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
        console.log("[NOTIFICATION MARK ONE READ]: SUCCESSFUL!!!");
        return res.json({ success: true });
    }
    static async markAllRead(req, res) {
        console.log("[NOTIFICATION MARK ALLREAD]: HIT!!!");
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        await prisma_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        console.log("[NOTIFICATION MARK ALLREAD]: SUCCESSFUL!!!");
        return res.json({ success: true });
    }
}
exports.NotificationController = NotificationController;
