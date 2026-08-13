import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class NotificationController {
    static async list(req: Request, res: Response) {
        console.log("[NOTIFICATION]: HIT!!!");
        const userId = (req as any).userId; // however you attach auth'd user elsewhere
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
            prisma.notification.count({ where: { userId, read: false } }),
        ]);

        console.log("[NOTIFICATION]: SUCCESSFUL!!!");
        return res.json({ notifications, unreadCount });
    }

    static async markRead(req: Request, res: Response) {
        console.log("[NOTIFICATION MARK ONE READ]: HIT!!!");
        const userId = (req as any).userId;
        const id = req.params.id as string;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });

        console.log("[NOTIFICATION MARK ONE READ]: SUCCESSFUL!!!");
        return res.json({ success: true });
    }

    static async markAllRead(req: Request, res: Response) {
        console.log("[NOTIFICATION MARK ALLREAD]: HIT!!!");
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        console.log("[NOTIFICATION MARK ALLREAD]: SUCCESSFUL!!!");
        return res.json({ success: true });
    }
}