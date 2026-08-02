import { prisma } from "../utils/prisma";


export class MessageService {
    static async getOrCreateconversation(userId: string, otherUserId: string): Promise<any> {
        try {
            if (userId === otherUserId) throw new Error("Cannot start a conversation with yourself.");

            const [userAId, userBId] = [userId, otherUserId].sort();

            let conversation = await prisma.conversation.findUnique({
                where: { userAId_userBId: { userAId, userBId } }
            });

            if(!conversation) {
                try {  
                    conversation = await prisma.conversation.create({
                        data: { userAId, userBId }
                    })
                } catch (err: any) {
                    if (err.code === "P2002") {
                        conversation = await prisma.conversation.findUnique({
                            where: { userAId_userBId: { userAId, userBId } }
                        })
                    } else {
                        throw err;
                    }
                }
            }

            return conversation;
        } catch (error: any) {
            console.error("ERROR GETTING OR CREATING CONVERSATION", error);
            throw error;
        }
    }
    static async getConversations(userId: string): Promise<any> {
        try {
            const conversations = await prisma.conversation.findMany({
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
        } catch (error: any) {
            console.error("ERROR GETTING CONVERSATIONS", error);
            throw error;
        }
    }
    static async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 30): Promise<any> {
        try {
            console.log("[GET MESSAGES]: HIT!!!");
            const skip = (page - 1) * limit;

            const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation) throw new Error("Conversation not found.");
            if (conversation.userAId !== userId && conversation.userBId !== userId) {
                throw new Error("You do not have permission to modify this conversation.");
            }
 
            const messages = await prisma.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            });

            const total = await prisma.message.count({ where: { conversationId } });
            console.log("[GET MESSAGES]: SUCCESSFUL");
            return {
                data: messages,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
            };
        } catch (error: any) {
            console.error('ERROR GETTING MESSAGE', error)
            throw error;
        }
    }
    static async sendMessage(conversationId: string, senderId: string, content: string): Promise<any> {
        try {
            const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation) throw new Error("Conversation not found.");
            if (conversation.userAId !== senderId && conversation.userBId !== senderId) {
                throw new Error("You do not have permission to modify this conversation.");
            }
            if (!content || content.trim() === "") throw new Error("Message content cannot be empty.");

            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: { conversationId, senderId, content }
                }),
                prisma.conversation.update({
                    where: { id: conversationId },
                    data: { lastMessageAt: new Date() }
                })
            ]);

            console.log("[SEND MESSAGES]: SENT!!!");
            return message;
        } catch (error: any) {
            console.error('ERROR SENDING MESSAGE', error)
            throw error;
        }
    }
    static async markAsSeen(conversationId: string, userId: string): Promise<any> {
        try {
            const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation) throw new Error("Conversation not found.");
            if (conversation.userAId !== userId && conversation.userBId !== userId) {
                throw new Error("You do not have permission to modify this conversation.");
            }

            // We mark - gon be autonomous on call thuough use the wriet to storage hetre too
            return await prisma.message.updateMany({
                where: { conversationId, senderId: { not: userId }, seenAt: null },
                data: { seenAt: new Date() }
            });
        } catch (error: any) {
            console.error('ERROR MARKING MESSAGES AS SEEN', error);
            throw error;
        }
    }
}