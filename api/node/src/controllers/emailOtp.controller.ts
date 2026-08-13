import { Request, Response } from "express";
import { EmailOtpService } from "../services/emailOtp.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class EmailOtpController {
    static async sendOtp(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const result = await EmailOtpService.sendOtp(userId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("ERROR sending email OTP:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to send email OTP." });
        }
    }
    static async verifyOtp(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { otp } = req.body;

            if (!otp) {
                return res.status(400).json({ message: "OTP is required" })
            }
            const result = await EmailOtpService.verifyOtp(userId, otp);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error("ERROR verifying email:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to verify email." });
        }
    }
}