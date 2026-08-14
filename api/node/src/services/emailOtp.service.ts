import { prisma } from "../utils/prisma";
import { resend } from "../utils/resend";
import { EmailOtpEmail } from "../email/EmailOtpEmail";


const OTP_EXPIRY_MINUTES = 10;

export class EmailOtpService {
    static async sendOtp(userId: string): Promise<any> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found.");

        const otp = Math.floor(100000 + Math.random() + 900000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await prisma.oTPVerification.upsert({
            where: { userId_channel: { userId, channel: "EMAIL" } },
            update: { otp, expiresAt, verified: false },
            create: { userId, channel: "EMAIL", otp, expiresAt, verified: false }
        });

        await resend.emails.send({
            from: "SUMMAYH <notifications@summayh.com>",
            to: user.email,
            subject: "Verify your SUMMAYH email",
            react: EmailOtpEmail({ name: user.name, otp })
        });

        return { message: "OTP sent to email." }
    }

    static async verifyOtp(userId: string, otp: string): Promise<any> {
        const record = await prisma.oTPVerification.findUnique({ 
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

        if (record.failedAttempts >= 5) {
            return { success: false, message: "Too many failed attempts. Request a new OTP" }
        }

        if (record.otp !== otp) {
            await prisma.oTPVerification.update({
                where: { userId_channel: { userId, channel: "EMAIL" } },
                data: { failedAttempts: { increment: 1 } },
            });
            return { success: false, message: "Incorrect OTP." };
        }

        await prisma.$transaction([
            prisma.oTPVerification.update({
                where: { userId_channel: { userId, channel: "EMAIL" } },
                data: { verified: true }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { isEmailVerified: true }
            })
        ])

        return { success: true, message: "Email verified successfully." }
    }


}