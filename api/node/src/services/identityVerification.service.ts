import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../utils/r2Client";
import { randomUUID } from "crypto";
import { prisma } from "../utils/prisma";
import { hashNin } from "../utils/hash";

export class IdentityVerificationService {
    static async generateSelfieUploadUrl(userId: string, fileType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
        console.log(new Date(), "-> [GET UPLOAD URL VERIFICATION SELFIE]: Hit!!!");
        
        const extension = fileType.split("/")[1];
        const key = `verification/${userId}/selfie-${randomUUID}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return { uploadUrl, publicUrl }
    }

    static async startVerification(userId: string) {
        return prisma.identityVerification.upsert({
            where: { userId },
            update: { status: "PENDING", failureReason: null },
            create: { userId, status: "PENDING" },
        })
    }
    static async submitForVerification(userId: string, nin: string, selfieImageUrl: string) {
        const fastApiRes = await fetch(`${process.env.FASTAPI_URL}/api/verification/liveness/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, nin, selfieImageUrl })
        });

        if (!fastApiRes.ok) {
            throw new Error(`FastAPI verification call failed: ${fastApiRes.status}`);
        }

        const result = await fastApiRes.json();
        const passed = result.livenessPassed && result.ninMatchPassed && result.ageVerifiedAdult;

        const updated = await prisma.identityVerification.update({
            where: { userId },
            data: {
                status: passed ? "PASSED" : "FAILED",
                ninHash: hashNin(nin),
                dateOfBirthOnNin: result.dateOfBirth ? new Date(result.dateOfBirth) : null,
                fullNameOnNin: result.fullName,
                livenessPassed: result.livenessPassed,
                livenessScore: result.livenessScore,
                ninMatchPassed: result.ninMatchPassed,
                ageVerifiedAdult: result.ageVerifiedAdult,
                failureReason: result.failureReason,
                providerRef: result.providerRef,
                verifiedAt: passed ? new Date() : null,
            }
        });

        if (passed) {
            await prisma.user.update({
                where: { id: userId },
                data: { isAdultVerified: true }
            });
        }

        return updated
    }
}