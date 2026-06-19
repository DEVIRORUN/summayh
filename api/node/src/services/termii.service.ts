import axios from "axios";
import { prisma } from "../utils/prisma";


const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_BASE_URL = process.env.TERMII_BASE_URL!; // https://v3.api.termii.com
const SENDER_ID = process.env.TERMII_SENDER_ID!; // SUMMAYH (once approved, use "N-Alert" for now in dev)
const OTP_EXPIRY_MINUTES = 10;

export class TermiiService {
    // 1. SEND OTP
    static async sendOtp(phone: string, userId: string): Promise<any> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Upsert so re-sends overwrite instead of creating a duplicate
        await prisma.oTPVerification.upsert({
            where: { userId},
            update: { otp, expiresAt, verified: false },
            create: { userId, otp, expiresAt, verified: false }
        });

        const message = `Your SUMMAYH verification code is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this with anyone.`;

        await axios.post(`${TERMII_BASE_URL}/api/sms/send`, {
            api_key: TERMII_API_KEY,
            to: phone,
            from: SENDER_ID,
            sms: message,
            type: "plain",
            channel: "generic"
        });
    }

    // 2. VERIFY THE OTP bro
    static async verifyOtp(userId: string, otp: string): Promise<any> {
        const record = await prisma.oTPVerification.findUnique({
            where: { userId },
        });

        if (!record) {
            return { success: false, message: "No OTP found for this user. Request a new one." };
        }
        if (record.verified) {
            return { success: false, message: "This OTP has already been used." };
        }
        if (new Date() > record.expiresAt) {
            return { success: false, message: "This OTP has expired, Request a new one." }
        }
        if (record.otp !== otp) {
            return { success: false, message: "Incorrect OTP." }
        }

        // Now we mark as verified
        await prisma.$transaction([
            prisma.oTPVerification.update({
                where: { userId },
                data: { verified: true }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { isPhoneVerified: true }
            })
        ]);

        return { successs: true, message: "Phoen verified successfully." };

    }

    // 3. SEND SMS NOTIFICATION (for orders, alerts)
    static async sendSms(phone: string, message:string): Promise<any> {
        await axios.post(`${TERMII_BASE_URL}/api/sms/send`, {
            api_key: TERMII_API_KEY,
            to: phone,
            from: SENDER_ID,
            sms: message,
            type: "plain",
            channel: "generic"
        });
    }

    // 4. DEFINE REUSABLE NOTIFICATION TEMPLATES
    // notify Order for buyer(s)
    static async notifyOrderPlaced(phone: string, gigTitle: string): Promise<any> {
        await TermiiService.sendSms(
            phone,
            `SUMMAYH: Your order for "${gigTitle}" has been placed. You'll be notified once teh seller confirms.`
        );
    }

    // notify Order for buyer(s)
    static async notifyOrderCompleted(phone: string, gigTitle: string): Promise<any> {
        await TermiiService.sendSms(
            phone,
            `SUMMAYH: Your order for "${gigTitle}" has been completed. Log in to review and release payment.`
        );
    }

    // notify Payout for seller(s)
    static async notifyPayoutSent(phone: string, amount: number): Promise<any> {
        await TermiiService.sendSms(
            phone,
            `SUMMAYH: Your payout of NGN ${amount.toLocaleString()} has been sent to your bank account.`
        );
    }
}