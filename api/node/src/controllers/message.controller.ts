import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class MessageController {
    static async getOrCreateConversation(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { otherUserId } = req.body;

            if (!otherUserId) return res.status(400).json({ message: "otherUserId is required." });

            const conversation = await MessageService.getOrCreateconversation(userId, otherUserId);

            return res.status(200).json({ message: "Conversation ready", data: conversation })
        } catch (error: any) {
            console.error("ERROR IN GETTING OR CREATING CONVERSATION", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong starting convo." });
        }
    }
    static async getConversations(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const conversation = await MessageService.getConversations(userId);

            return res.status(200).json({ message: "Conversation retrieved", data: conversation })
        } catch (error: any) {
            console.error("ERROR IN GETTING CONVERSATION", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting convo." });
        }
    }
    static async getMessages(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { conversationId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 30;

            if (!conversationId) return res.status(400).json({ message: "otherUserId is required." });

            const messages = await MessageService.getMessages(conversationId as string,  userId, page, limit);

            return res.status(200).json({ message: "Messages retrieevd", data: messages })
        } catch (error: any) {
            console.error("ERROR IN GETTING MESSAGES", error);

            if(error.message.includes("not found") || error.message.includes("permission")) {
                return res.status(error.message.includes("permission") ? 403 : 400).json({ message: error.message })
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting messages." });
        }
    }
    static async sendMessage(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { conversationId } = req.params;
            const { content } = req.body;

            if (!content) return res.status(400).json({ message: "Message content is required." });

            const message = await MessageService.sendMessage(conversationId as string, userId, content);

            return res.status(200).json({ message: "Message sent", data: message })
        } catch (error: any) {
            console.error("ERROR IN SENDING MESSAGE", error);

            if (error.message.includes("not found") || error.message.includes("participant") || error.message.includes("empty")) {
                return res.status(400).json({ message: error.message });
            }

            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong sending message." });
        }
    }
    static async markAsSeen(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { conversationId } = req.params;

            const message = await MessageService.markAsSeen(conversationId as string, userId);

            return res.status(200).json({ message: "Marked as seen", data: message })
        } catch (error: any) {
            console.error("ERROR MARKING AS SEEN", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong marking as seen." });
        }
    }
}