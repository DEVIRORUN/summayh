"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const prisma_1 = require("../utils/prisma");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const r2Client_1 = require("../utils/r2Client");
const crypto_1 = require("crypto");
class DeliveryService {
    static async getUploadUrl(orderId, sellerId, fileName, contentType) {
        try {
            console.log("[GET UPLOAD URL FOR SUBMISSION]: Hit!!!");
            const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId } });
            if (!order)
                throw new Error("Order not found");
            if (order.sellerId !== sellerId)
                throw new Error("not your order");
            const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
            const key = `deliveries/${orderId}/summayh-${Date.now()}-${(0, crypto_1.randomUUID)()}${ext}`; // No extension neecesarily needed???
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                ContentType: contentType,
            });
            const hour = 60 * 60; // 
            const url = await (0, s3_request_presigner_1.getSignedUrl)(r2Client_1.r2Client, command, { expiresIn: hour }); // no time limits?? I mean some project file could be really so
            console.log("[GET UPLOAD URL FOR SUBMISSION]: UPLAOD URL GOTTEN!!!");
            return { uploadUrl: url, fileKey: key };
        }
        catch (err) {
            throw err;
        }
    }
    static async submitDelivery(orderId, sellerId, message, files) {
        try {
            const order = await prisma_1.prisma.order.findUnique({ where: { id: orderId }, include: { seller: true } });
            if (!order)
                throw new Error("Order not found");
            if (order.sellerId !== sellerId)
                throw new Error("Not your order");
            return prisma_1.prisma.$transaction(async (tx) => {
                const delivery = await tx.orderDelivery.create({
                    data: {
                        orderId,
                        message,
                        type: "DIGITAL", // for now until v2 LIVE activation
                        files: { create: files },
                    }
                });
                await tx.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
                return delivery;
            });
        }
        catch (err) {
            throw err;
        }
    }
    static async getDownloadUrl(fileId, userId) {
        try {
            const file = await prisma_1.prisma.deliveryFile.findUnique({
                where: { id: fileId },
                include: { delivery: { include: { order: { include: { buyer: true, seller: true } } } } }
            });
            if (!file)
                throw new Error("File not found");
            const order = file.delivery?.order;
            const isParty = order?.buyerId === userId || order?.seller.userId === userId;
            if (!isParty)
                throw new Error("Not authorized");
            const command = new client_s3_1.GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: file.fileKey,
                ResponseContentDisposition: `attachment; filename=${file.fileName}`,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(r2Client_1.r2Client, command, { expiresIn: 300 });
            return { downloadUrl: url, fileName: file.fileName };
        }
        catch (err) {
            throw err;
        }
    }
}
exports.DeliveryService = DeliveryService;
