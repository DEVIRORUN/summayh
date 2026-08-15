"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOtpService = void 0;
const prisma_1 = require("../utils/prisma");
const resend_1 = require("../utils/resend");
const EmailOtpEmail_1 = require("../email/EmailOtpEmail");
const OTP_EXPIRY_MINUTES = 10;
class EmailOtpService {
    static async sendOtp(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found.");
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await prisma_1.prisma.oTPVerification.upsert({
            where: { userId_channel: { userId, channel: "EMAIL" } },
            update: { otp, expiresAt, verified: false },
            create: { userId, channel: "EMAIL", otp, expiresAt, verified: false }
        });
        await resend_1.resend.emails.send({
            from: "SUMMAYH <notifications@summayh.com>",
            to: user.email,
            subject: "Verify your SUMMAYH email",
            react: (0, EmailOtpEmail_1.EmailOtpEmail)({ name: user.name, otp })
        });
        return { message: "OTP sent to email." };
    }
    static async verifyOtp(userId, otp) {
        const record = await prisma_1.prisma.oTPVerification.findUnique({
            where: { userId_channel: { userId, channel: "EMAIL" } }
        });
        if (!record) {
            return { success: false, message: "No OTP found for this user. Request a new one." };
        }
        if (record.verified) {
            return { success: false, message: "This OTP has already been used." };
        }
        if (new Date() > record.expiresAt) {
            return { success: false, message: "This OTP has expired, request a new one." };
        }
        if (record.otp !== otp) {
            return { success: false, message: "Incorrect OTP." };
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.oTPVerification.update({
                where: { userId_channel: { userId, channel: "EMAIL" } },
                data: { verified: true }
            }),
            prisma_1.prisma.user.update({
                where: { id: userId },
                data: { isEmailVerified: true }
            })
        ]);
        return { success: true, message: "Email verified successfully." };
    }
}
exports.EmailOtpService = EmailOtpService;
