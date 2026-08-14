import { prisma } from "../utils/prisma";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../utils/r2Client";
import { randomUUID } from "crypto";



export class DeliveryService {
    static async getUploadUrl(orderId: string, sellerId: string, fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
        try {
            console.log("[GET UPLOAD URL FOR SUBMISSION]: Hit!!!");
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            if (!order) throw new Error("Order not found");
            if (order.sellerId !== sellerId) throw new Error("not your order");

            const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
            const key = `deliveries/${orderId}/summayh-${Date.now()}-${randomUUID()}${ext}`; // No extension neecesarily needed???

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                ContentType: contentType,
            });

            const hour = 60 * 60 // 

            const url = await getSignedUrl(r2Client, command, { expiresIn: hour }) // no time limits?? I mean some project file could be really so

            console.log("[GET UPLOAD URL FOR SUBMISSION]: UPLAOD URL GOTTEN!!!");
            return { uploadUrl: url, fileKey: key }
        } catch (err: any) {
            throw err;
        }
    }
    static async submitDelivery(orderId: string, sellerId: string, message: string, files: { fileKey: string; fileName: string; fileSize: number }[]): Promise<any> {
        try {
            const order = await prisma.order.findUnique({ where: { id: orderId }, include: { seller: true } });
            if (!order) throw new Error("Order not found");
            if (order.sellerId !== sellerId) throw new Error("Not your order");
            
            return prisma.$transaction(async (tx) => {
                const delivery = await tx.orderDelivery.create({
                    data: {
                        orderId,
                        message,
                        type: "DIGITAL", // for now until v2 LIVE activation
                        files: { create: files },
                    }
                });

                await tx.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } })
                return delivery;
            })
        } catch (err: any) {
            throw err
        }
    }
    static async getDownloadUrl(fileId: string, userId: string, disposition: "inline" | "attachment" = "attachment"): Promise<any> {
        try {
            const file = await prisma.deliveryFile.findUnique({
                where: { id: fileId },
                include: { delivery: { include: { order: { include: { buyer: true, seller: true } } } } }
            });
            if (!file) throw new Error("File not found");
            
            const order = file.delivery?.order;
            const isParty = order?.buyerId === userId || order?.seller.userId === userId;
            if(!isParty) throw new Error("Not authorized");

            function buildContentDisposition(disposition: "inline" | "attachment", fileName: string): string {
                const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, "_");
                const encoded = encodeURIComponent(fileName);

                return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
            }
            
            const command = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: file.fileKey,
                ResponseContentDisposition: buildContentDisposition(disposition, file.fileName),
            })
            
            const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
            return { downloadUrl: url, fileName: file.fileName } 
        } catch (err: any) {
            throw err;
        }
    }
}