"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityVerificationService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const r2Client_1 = require("../utils/r2Client");
const crypto_1 = require("crypto");
const prisma_1 = require("../utils/prisma");
const hash_1 = require("../utils/hash");
class IdentityVerificationService {
    static async generateSelfieUploadUrl(userId, fileType) {
        console.log(new Date(), "-> [GET UPLOAD URL VERIFICATION SELFIE]: Hit!!!");
        const extension = fileType.split("/")[1];
        const key = `verification/${userId}/selfie-${crypto_1.randomUUID}.${extension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(r2Client_1.r2Client, command, { expiresIn: 300 });
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
        return { uploadUrl, publicUrl };
    }
    static async startVerification(userId) {
        return prisma_1.prisma.identityVerification.upsert({
            where: { userId },
            update: { status: "PENDING", failureReason: null },
            create: { userId, status: "PENDING" },
        });
    }
    static async submitForVerification(userId, nin, selfieImageUrl) {
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
        const updated = await prisma_1.prisma.identityVerification.update({
            where: { userId },
            data: {
                status: passed ? "PASSED" : "FAILED",
                ninHash: (0, hash_1.hashNin)(nin),
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
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { isAdultVerified: true }
            });
        }
        return updated;
    }
}
exports.IdentityVerificationService = IdentityVerificationService;
