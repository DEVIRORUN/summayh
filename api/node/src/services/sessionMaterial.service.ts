import { prisma } from "../utils/prisma";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../utils/r2Client";
import { randomUUID } from "crypto";


export class SessionMaterialService {

    static async assertParticipant(callSessionId: string, userId: string) {
        const callSession = await prisma.callSession.findFirstOrThrow({
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

        return { callSession, buyerUserId, sellerUserId }
    }
    static async generateUploadUrl(callSessionId: string, userId: string, fileType: string, fileName: string) {
        try {
            await this.assertParticipant(callSessionId, userId);

            const isPdf = fileType === "application/pdf";
            const isImage = fileType.startsWith("image/");
            if (!isPdf && !isImage) throw new Error("only images and pdf are supported.");
            

            const extension = fileName.split(".").pop();
            const key = `sessions/${callSessionId}/materials/${randomUUID()}.${extension}`;

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                ContentType: fileType
            });

            const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
            const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

            return { uploadUrl, publicUrl }
        } catch (err: any) {
            throw err;
        }

    }
    static async saveMaterial(callSessionId: string, userId: string, fileUrl: string, fileName: string, fileType: string) {
        try {
            await this.assertParticipant(callSessionId, userId);

            return await prisma.sessionMaterial.create({
                data: { callSessionId, uploadedBy: userId, fileUrl, fileName, fileType },
            })
        } catch(err: any) {
            throw err;
        }
    }
    static async listMaterial(callSessionId: string, userId: string) {
        try {
            await this.assertParticipant(callSessionId, userId);
            
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("Not Auhtorized!")
            return await prisma.sessionMaterial.findMany({
                where: { callSessionId } ,
                orderBy: { createdAt: "desc" },
            });
        } catch(err: any) {
            throw err;
        }
    }
}