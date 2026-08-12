import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export class NotificationController {
    static async list(req: Request, res: Response) {
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

        return res.json({ notifications, unreadCount });
    }

    static async markRead(req: Request, res: Response) {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
    });

    return res.json({ success: true });
}

    static async markAllRead(req: Request, res: Response) {
        const userId = (req as any).userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        return res.json({ success: true });
    }
}