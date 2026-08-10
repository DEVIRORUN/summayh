"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermiiService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../utils/prisma");
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_BASE_URL = process.env.TERMII_BASE_URL; // https://v3.api.termii.com
const SENDER_ID = process.env.TERMII_SENDER_ID; // SUMMAYH (once approved, use "N-Alert" for now in dev)
const OTP_EXPIRY_MINUTES = 10;
class TermiiService {
    static secretKey = process.env.PAYSTACK_SECRET_KEY;
    // 1. SEND OTP
    static async sendOtp(phone, userId) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        // Upsert so re-sends overwrite instead of creating a duplicate
        await prisma_1.prisma.oTPVerification.upsert({
            where: { userId },
            update: { otp, expiresAt, verified: false },
            create: { userId, otp, expiresAt, verified: false },
        });
        const message = `Your SUMMAYH verification code is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this with anyone.`;
        await axios_1.default.post(`${TERMII_BASE_URL}/api/sms/send`, {
            api_key: TERMII_API_KEY,
            to: phone,
            from: SENDER_ID,
            sms: message,
            type: "plain",
            channel: "generic",
        });
        console.log("SENDER_ID being used:", process.env.TERMII_SENDER_ID);
    }
    // 2. VERIFY THE OTP bro
    static async verifyOtp(userId, otp) {
        const record = await prisma_1.prisma.oTPVerification.findUnique({
            where: { userId },
        });
        if (!record) {
            return {
                success: false,
                message: "No OTP found for this user. Request a new one.",
            };
        }
        if (record.verified) {
            return { success: false, message: "This OTP has already been used." };
        }
        if (new Date() > record.expiresAt) {
            return {
                success: false,
                message: "This OTP has expired, Request a new one.",
            };
        }
        if (record.otp !== otp) {
            return { success: false, message: "Incorrect OTP." };
        }
        // Now we mark as verified
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.oTPVerification.update({
                where: { userId },
                data: { verified: true },
            }),
            prisma_1.prisma.user.update({
                where: { id: userId },
                data: { isPhoneVerified: true },
            }),
        ]);
        return { successs: true, message: "Phoen verified successfully." };
    }
    // 3. SEND SMS NOTIFICATION (for orders, alerts)
    static async sendSms(phone, message) {
        await axios_1.default.post(`${TERMII_BASE_URL}/api/sms/send`, {
            api_key: TERMII_API_KEY,
            to: phone,
            from: SENDER_ID,
            sms: message,
            type: "plain",
            channel: "generic",
        });
    }
    // 4. DEFINE REUSABLE NOTIFICATION TEMPLATES
    // notify Order for buyer(s)
    static async notifyOrderPlaced(phone, gigTitle) {
        await TermiiService.sendSms(phone, `SUMMAYH: Your order for "${gigTitle}" has been placed. You'll be notified once teh seller confirms.`);
    }
    // notify Order for buyer(s)
    static async notifyOrderCompleted(phone, gigTitle) {
        await TermiiService.sendSms(phone, `SUMMAYH: Your order for "${gigTitle}" has been completed. Log in to review and release payment.`);
    }
    // notify Payout for seller(s)
    static async notifyPayoutSent(phone, amount) {
        await TermiiService.sendSms(phone, `SUMMAYH: Your payout of NGN ${amount.toLocaleString()} has been sent to your bank account.`);
    }
    static async notifySellerRequirementsSubmitted(sellerId, orderId) {
        try {
            // 1. We fecth teh seller's number
            const seller = await prisma_1.prisma.sellerProfile.findUnique({
                where: { id: sellerId },
            });
            if (!seller || !seller.phoneNumber) {
                console.error(`[TermiiService] Aborting notification: Seller ${seller?.sellerUsername || "username"}, Id: ${sellerId} has no valid phone number.`);
                return;
            }
            // 2. Format message
            const shortOrderId = orderId.substring(0, 8).toUpperCase();
            const message = `hello ${seller.sellerUsername || "Seller"}, the buyer has submitted requiremenst for Order #${shortOrderId}. Your delivery timer has started! Log in to your SUMMAYH your dashboard`;
            //3. Post payload to Termii's transactional SMS route
            const payload = {
                to: seller.phoneNumber,
                from: SENDER_ID,
                sms: message,
                type: "plain",
                channel: "generic", // 'generic' or 'dnd' depending on route configs
                api_key: TERMII_API_KEY,
            };
            const response = await axios_1.default.post(`${TERMII_BASE_URL}/api/sms/send`, payload);
            if (response.data && response.data.code === "ok") {
                console.log(`[TermiService] Requirement alert sent successfully to seller ${sellerId}`);
            }
            else {
                console.warn(`[TermiService] Termii accepted payload but returned unexpected status: `, response.data);
            }
        }
        catch (error) {
            console.error(new Date(), "-> [TermiiService] Failed to execute notifySellerRequirementsSubmitted:", error?.response?.data || error.message);
        }
    }
}
exports.TermiiService = TermiiService;
