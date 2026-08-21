import { prisma } from "../utils/prisma";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../utils/r2Client";
import { randomUUID } from "crypto";


export class AvatarService {
    static async getAvatarUploadUrl(userId: string, fileType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(fileType)) {
            throw new Error("Unsupported image type.");
        }

        const extension = fileType.split("/")[1];
        const key = `avatars/${userId}/avatar-${Date.now()}-${randomUUID()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return { uploadUrl, publicUrl };
    }
    static async saveAvatar(userId: string, avatarUrl: string, role: string): Promise<any> {
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

        
        if (role === "SELLER") {
            await prisma.sellerProfile.update({
                where: { userId },
                data: { avatar: avatarUrl },
            }).catch(() => {}); 
        }

        return updatedUser;
    }
}