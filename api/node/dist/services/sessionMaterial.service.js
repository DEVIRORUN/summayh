"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMaterialService = void 0;
const prisma_1 = require("../utils/prisma");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const r2Client_1 = require("../utils/r2Client");
const crypto_1 = require("crypto");
class SessionMaterialService {
    static async assertParticipant(callSessionId, userId) {
        const callSession = await prisma_1.prisma.callSession.findFirstOrThrow({
            where: { id: callSessionId },
            include: {
                sessionBooking: {
                    include: {
                        package: { include: { order: { include: { seller: true } } } },
                        enrollment: { include: { order: { include: { seller: true } } } },
                    }
                }
            }
        });
        const order = callSession.sessionBooking?.package?.order ?? callSession.sessionBooking?.enrollment?.order;
        if (!order) {
            throw new Error(`CallSession ${callSessionId} has no linked enrollment or package`);
        }
        const buyerUserId = order.buyerId;
        const sellerUserId = order.seller.userId;
        if (userId !== buyerUserId && userId !== sellerUserId) {
            throw new Error("FORBIDDEN");
        }
        return { callSession, buyerUserId, sellerUserId };
    }
    static async generateUploadUrl(callSessionId, userId, fileType, fileName) {
        try {
            await this.assertParticipant(callSessionId, userId);
            const isPdf = fileType === "application/pdf";
            const isImage = fileType.startsWith("image/");
            if (!isPdf && !isImage)
                throw new Error("only images and pdf are supported.");
            const extension = fileName.split(".").pop();
            const key = `sessions/${callSessionId}/materials/${(0, crypto_1.randomUUID)()}.${extension}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                ContentType: fileType
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(r2Client_1.r2Client, command, { expiresIn: 300 });
            const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
            return { uploadUrl, publicUrl };
        }
        catch (err) {
            throw err;
        }
    }
    static async saveMaterial(callSessionId, userId, fileUrl, fileName, fileType) {
        try {
            await this.assertParticipant(callSessionId, userId);
            return await prisma_1.prisma.sessionMaterial.create({
                data: { callSessionId, uploadedBy: userId, fileUrl, fileName, fileType },
            });
        }
        catch (err) {
            throw err;
        }
    }
    static async listMaterial(callSessionId, userId) {
        try {
            await this.assertParticipant(callSessionId, userId);
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new Error("Not Auhtorized!");
            return await prisma_1.prisma.sessionMaterial.findMany({
                where: { callSessionId },
                orderBy: { createdAt: "desc" },
            });
        }
        catch (err) {
            throw err;
        }
    }
}
exports.SessionMaterialService = SessionMaterialService;
