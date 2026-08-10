"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class MessageController {
    static async getOrCreateConversation(req, res) {
        try {
            const userId = req.userId;
            const { otherUserId } = req.body;
            if (!otherUserId)
                return res.status(400).json({ message: "otherUserId is required." });
            const conversation = await message_service_1.MessageService.getOrCreateconversation(userId, otherUserId);
            return res.status(200).json({ message: "Conversation ready", data: conversation });
        }
        catch (error) {
            console.error("ERROR IN GETTING OR CREATING CONVERSATION", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong starting convo." });
        }
    }
    static async getConversations(req, res) {
        try {
            const userId = req.userId;
            const conversation = await message_service_1.MessageService.getConversations(userId);
            return res.status(200).json({ message: "Conversation retrieved", data: conversation });
        }
        catch (error) {
            console.error("ERROR IN GETTING CONVERSATION", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong getting convo." });
        }
    }
    static async getMessages(req, res) {
        try {
            const userId = req.userId;
            const { conversationId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            if (!conversationId)
                return res.status(400).json({ message: "otherUserId is required." });
            const messages = await message_service_1.MessageService.getMessages(conversationId, userId, page, limit);
            return res.status(200).json({ message: "Messages retrieevd", data: messages });
        }
        catch (error) {
            console.error("ERROR IN GETTING MESSAGES", error);
            if (error.message.includes("not found") || error.message.includes("permission")) {
                return res.status(error.message.includes("permission") ? 403 : 400).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong getting messages." });
        }
    }
    static async sendMessage(req, res) {
        try {
            const userId = req.userId;
            const { conversationId } = req.params;
            const { content } = req.body;
            if (!content)
                return res.status(400).json({ message: "Message content is required." });
            const message = await message_service_1.MessageService.sendMessage(conversationId, userId, content);
            return res.status(200).json({ message: "Message sent", data: message });
        }
        catch (error) {
            console.error("ERROR IN SENDING MESSAGE", error);
            if (error.message.includes("not found") || error.message.includes("participant") || error.message.includes("empty")) {
                return res.status(400).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong sending message." });
        }
    }
    static async markAsSeen(req, res) {
        try {
            const userId = req.userId;
            const { conversationId } = req.params;
            const message = await message_service_1.MessageService.markAsSeen(conversationId, userId);
            return res.status(200).json({ message: "Marked as seen", data: message });
        }
        catch (error) {
            console.error("ERROR MARKING AS SEEN", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong marking as seen." });
        }
    }
}
exports.MessageController = MessageController;
