import axios from "axios";
import { prisma } from "../utils/prisma";

const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_BASE_URL = process.env.TERMII_BASE_URL!; // https://v3.api.termii.com
const SENDER_ID = process.env.TERMII_SENDER_ID!; // SUMMAYH (once approved, use "N-Alert" for now in dev)
const OTP_EXPIRY_MINUTES = 10;

export class TermiiService {
  // SEND OTP
  static async sendOtp(phone: string, userId: string): Promise<any> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert so re-sends overwrite instead of creating a duplicate
    await prisma.oTPVerification.upsert({
      where: { userId_channel: { userId, channel: "PHONE" } },
      update: { otp, expiresAt, verified: false },
      create: { userId, channel: "PHONE", otp, expiresAt, verified: false },
    });

    const message = `Your SUMMAYH verification code is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this with anyone.`;

    await axios.post(`${TERMII_BASE_URL}/api/sms/send`, {
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
  static async verifyOtp(userId: string, otp: string): Promise<any> {
    const record = await prisma.oTPVerification.findUnique({
      where: { userId_channel: { userId, channel: "PHONE" } },
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
      await prisma.oTPVerification.update({
        where: { userId_channel: { userId, channel: "PHONE" } },
        data: { failedAttempts: { increment: 1 } }
      })
      return { success: false, message: "Incorrect OTP." };
    }

    // Now we mark as verified
    await prisma.$transaction([
      prisma.oTPVerification.update({
        where: { userId_channel: { userId, channel: "PHONE" } },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isPhoneVerified: true },
      }),
    ]);

    return { success: true, message: "Phone verified successfully." };
  }

  // 3. SEND SMS NOTIFICATION (for orders, alerts)
  static async sendSms(phone: string, message: string): Promise<any> {
    await axios.post(`${TERMII_BASE_URL}/api/sms/send`, {
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
  static async notifyOrderPlaced(
    phone: string,
    gigTitle: string,
  ): Promise<any> {
    await TermiiService.sendSms(
      phone,
      `SUMMAYH: Your order for "${gigTitle}" has been placed. You'll be notified once the seller confirms.`,
    );
  }

  // notify Order for buyer(s)
  static async notifyOrderCompleted(
    phone: string,
    gigTitle: string,
  ): Promise<any> {
    await TermiiService.sendSms(
      phone,
      `SUMMAYH: Your order for "${gigTitle}" has been completed. Log in to review and release payment.`,
    );
  }

  // notify Payout for seller(s)
  static async notifyPayoutSent(phone: string, amount: number): Promise<any> {
    await TermiiService.sendSms(
      phone,
      `SUMMAYH: Your payout of NGN ${amount.toLocaleString()} has been sent to your bank account.`,
    );
  }

  static async notifySellerRequirementsSubmitted(
    sellerId: string,
    orderId: string,
  ): Promise<any> {
    try {
      // 1. We fecth the seller's number
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: sellerId },
      });

      if (!seller || !seller.phoneNumber) {
        console.error(
          `[TermiiService] Aborting notification: Seller ${seller?.sellerUsername || "username"}, Id: ${sellerId} has no valid phone number.`,
        );
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

      const response = await axios.post(
        `${TERMII_BASE_URL}/api/sms/send`,
        payload,
      );

      if (response.data && response.data.code === "ok") {
        console.log(
          `[TermiService] Requirement alert sent successfully to seller ${sellerId}`,
        );
      } else {
        console.warn(
          `[TermiService] Termii accepted payload but returned unexpected status: `,
          response.data,
        );
      }
    } catch (error: any) {
      console.error(
        new Date(),
        "-> [TermiiService] Failed to execute notifySellerRequirementsSubmitted:",
        error?.response?.data || error.message,
      );
    }
  }
}
