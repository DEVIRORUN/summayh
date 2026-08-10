"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const prisma_1 = require("../utils/prisma");
class MessageService {
    static async getOrCreateconversation(userId, otherUserId) {
        try {
            if (userId === otherUserId)
                throw new Error("Cannot start a conversation with yourself.");
            const [userAId, userBId] = [userId, otherUserId].sort();
            let conversation = await prisma_1.prisma.conversation.findUnique({
                where: { userAId_userBId: { userAId, userBId } }
            });
            if (!conversation) {
                try {
                    conversation = await prisma_1.prisma.conversation.create({
                        data: { userAId, userBId }
                    });
                }
                catch (err) {
                    if (err.code === "P2002") {
                        conversation = await prisma_1.prisma.conversation.findUnique({
                            where: { userAId_userBId: { userAId, userBId } }
                        });
                    }
                    else {
                        throw err;
                    }
                }
            }
            return conversation;
        }
        catch (error) {
            console.error("ERROR GETTING OR CREATING CONVERSATION", error);
            throw error;
        }
    }
    static async getConversations(userId) {
        try {
            const conversations = await prisma_1.prisma.conversation.findMany({
                where: { OR: [{ userAId: userId }, { userBId: userId }] },
                orderBy: { lastMessageAt: 'desc' },
                include: {
                    userA: { select: { id: true, name: true, avatar: true } },
                    userB: { select: { id: true, name: true, avatar: true } },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1
                    }
                }
            });
            return conversations;
        }
        catch (error) {
            console.error("ERROR GETTING CONVERSATIONS", error);
            throw error;
        }
    }
    static async getMessages(conversationId, userId, page = 1, limit = 30) {
        try {
            console.log("[GET MESSAGES]: HIT!!!");
            const skip = (page - 1) * limit;
            const conversation = await prisma_1.prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation)
                throw new Error("Conversation not found.");
            if (conversation.userAId !== userId && conversation.userBId !== userId) {
                throw new Error("You do not have permission to modify this conversation.");
            }
            const messages = await prisma_1.prisma.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            });
            const total = await prisma_1.prisma.message.count({ where: { conversationId } });
            console.log("[GET MESSAGES]: SUCCESSFUL");
            return {
                data: messages,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
            };
        }
        catch (error) {
            console.error('ERROR GETTING MESSAGE', error);
            throw error;
        }
    }
    static async sendMessage(conversationId, senderId, content) {
        try {
            const conversation = await prisma_1.prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation)
                throw new Error("Conversation not found.");
            if (conversation.userAId !== senderId && conversation.userBId !== senderId) {
                throw new Error("You do not have permission to modify this conversation.");
            }
            if (!content || content.trim() === "")
                throw new Error("Message content cannot be empty.");
            const [message] = await prisma_1.prisma.$transaction([
                prisma_1.prisma.message.create({
                    data: { conversationId, senderId, content }
                }),
                prisma_1.prisma.conversation.update({
                    where: { id: conversationId },
                    data: { lastMessageAt: new Date() }
                })
            ]);
            console.log("[SEND MESSAGES]: SENT!!!");
            return message;
        }
        catch (error) {
            console.error('ERROR SENDING MESSAGE', error);
            throw error;
        }
    }
    static async markAsSeen(conversationId, userId) {
        try {
            const conversation = await prisma_1.prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation)
                throw new Error("Conversation not found.");
            if (conversation.userAId !== userId && conversation.userBId !== userId) {
                throw new Error("You do not have permission to modify this conversation.");
            }
            // We mark - gon be autonomous on call thuough use the wriet to storage hetre too
            return await prisma_1.prisma.message.updateMany({
                where: { conversationId, senderId: { not: userId }, seenAt: null },
                data: { seenAt: new Date() }
            });
        }
        catch (error) {
            console.error('ERROR MARKING MESSAGES AS SEEN', error);
            throw error;
        }
    }
}
exports.MessageService = MessageService;
