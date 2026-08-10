"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermiiController = void 0;
const termii_service_1 = require("../services/termii.service");
const prisma_1 = require("../utils/prisma");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class TermiiController {
    // POST api/otp/send
    static async sendOtp(req, res) {
        try {
            const userId = req.userId;
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ message: "Phone number is required!" });
            }
            await termii_service_1.TermiiService.sendOtp(phone, userId);
            return res.status(200).json({ message: "OTP sent succesfully, now Verify" });
        }
        catch (error) {
            console.error("ERROR sending OTP:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ messsage: "Failed to send OTP." });
        }
    }
    //POST api/otp/verify
    static async verifyOtp(req, res) {
        try {
            const userId = req.userId;
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ message: "OTP is required." });
            }
            const result = await termii_service_1.TermiiService.sendOtp(userId, otp);
            return res.status(200).json({ message: result.message });
        }
        catch (error) {
            console.error("ERROR verifying OTP");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to verify the OTP." });
        }
    }
    static async notifyOrderPlaced(req, res) {
        try {
            const userId = req.userId;
            const { gig } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(400).json({ message: "User does not exist" });
            }
            await termii_service_1.TermiiService.notifyOrderPlaced(user.phoneNumber, gig.title);
        }
        catch (error) {
            console.error(" ERROR notifying buyer for order placement:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been placed." });
        }
    }
    static async notifyOrderCompleted(req, res) {
        try {
            const userId = req.userId;
            const { gig } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(400).json({ message: "User does not Exist" });
            }
            await termii_service_1.TermiiService.notifyOrderCompleted(user.phoneNumber, gig.title);
            return res.status(200).json({ message: "Buyer notified successfully." });
        }
        catch (error) {
            console.error(" ERROR notifying buyer for Order Completion:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been completed." });
        }
    }
    static async notifyPayoutSent(req, res) {
        try {
            const userId = req.userId;
            const { amount } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(400).json({ message: "User does not Exist" });
            }
            await termii_service_1.TermiiService.notifyOrderCompleted(user.phoneNumber, amount);
        }
        catch (error) {
            console.error(" ERROR notifying buyer for Order Completion", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been completed." });
        }
    }
}
exports.TermiiController = TermiiController;
