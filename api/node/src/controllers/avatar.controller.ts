import { Request, Response } from "express";
import { AvatarService } from "../services/avatar.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";



export class AvatarController {
    static async getUploadUrl(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { fileType } = req.body;

            if (!fileType) {
                return res.status(400).json({ message: "fileType is required." });
            }

            const result = await AvatarService.getAvatarUploadUrl(userId, fileType);
            return res.status(200).json({ message: "Upload URL generated", data: result });
        } catch (error: any) {
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get avatar upload URL." });
        }
    }

    static async saveAvatar(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const role = (req as any).role; // confirm this is set by protectRoute — if not, fetch it
            const { avatarUrl } = req.body;

            if (!avatarUrl || typeof avatarUrl !== "string") {
                return res.status(400).json({ message: "avatarUrl is required." });
            }

            const result = await AvatarService.saveAvatar(userId, avatarUrl, role);
            return res.status(200).json({ message: "Avatar updated", data: result });
        } catch (error: any) {
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to save avatar." });
        }
    }
}