"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailOtpController = void 0;
const emailOtp_service_1 = require("../services/emailOtp.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class EmailOtpController {
    static async sendOtp(req, res) {
        try {
            const userId = req.userId;
            const result = await emailOtp_service_1.EmailOtpService.sendOtp(userId);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("ERROR sending email OTP:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to send email OTP." });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const userId = req.userId;
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ message: "OTP is required" });
            }
            const result = await emailOtp_service_1.EmailOtpService.verifyOtp(userId, otp);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("ERROR verifying email:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to verify email." });
        }
    }
}
exports.EmailOtpController = EmailOtpController;
