"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class PaymentController {
    static async getBalance(req, res) {
        try {
            const userId = req.userId;
            const balance = await payment_service_1.PaymentService.getBalance(userId);
            return res.status(200).json({
                message: "Balance retrieved successfully",
                data: balance
            });
        }
        catch (error) {
            console.error("ERROR GETTING BALANCE", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong getting balance." });
        }
    }
    static async getEarningsSummary(req, res) {
        try {
            const sellerId = req.sellerId;
            const summary = await payment_service_1.PaymentService.getEarningsSummary(sellerId);
            return res.status(200).json({
                message: "Summary gotten succesfully",
                data: summary
            });
        }
        catch (error) {
            console.log("ERROR GETTING EARNING SUMMARY");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({
                message: "Faield to get Eraning Summary",
            });
        }
    }
    static async getLedger(req, res) {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const ledger = await payment_service_1.PaymentService.getLedger(userId, page, limit);
            return res.status(200).json({
                message: "Ledger retrieved successfully",
                data: ledger
            });
        }
        catch (error) {
            console.error("ERROR LEDGER BALANCE", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong getting ledger." });
        }
    }
    static async requestWithdrawal(req, res) {
        try {
            const userId = req.userId;
            const { amount, bankDetails } = req.body;
            if (!amount)
                return res.status(400).json({ message: "Please provide a withdrawal amount." });
            const withdrawal = await payment_service_1.PaymentService.requestWithdrawal(userId, amount, bankDetails);
            return res.status(200).json({
                message: "Withdrawal requested successfully",
                data: withdrawal
            });
        }
        catch (error) {
            console.error("ERROR REQUESTING WITHDRAWAL", error);
            if (error.message.includes("exceeds") || error.message.includes("required") || error.message.includes("greate than")) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes("Only seller")) {
                return res.status(400).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong getting ledger." });
        }
    }
}
exports.PaymentController = PaymentController;
