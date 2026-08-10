import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class PaymentController {
    static async getBalance(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const balance = await PaymentService.getBalance(userId);

            return res.status(200).json({
                message: "Balance retrieved successfully",
                data: balance
            })
        } catch (error: any) {
            console.error("ERROR GETTING BALANCE", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting balance." });
        }
    }
    static async getEarningsSummary(req: Request, res: Response): Promise<any> {
        try {
            const sellerId = (req as any).sellerId;
            const summary = await PaymentService.getEarningsSummary(sellerId);

            return res.status(200).json({
                message: "Summary gotten succesfully",
                data: summary
            })
        } catch (error: any) {
            console.log("ERROR GETTING EARNING SUMMARY")
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({
                message: "Faield to get Eraning Summary",
            })
        }
    }
    static async getLedger(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const ledger = await PaymentService.getLedger(userId, page, limit);

            return res.status(200).json({
                message: "Ledger retrieved successfully",
                data: ledger
            })
        } catch (error: any) {
            console.error("ERROR LEDGER BALANCE", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting ledger." });
        }
    }
    static async requestWithdrawal(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { amount, bankDetails } = req.body;

            if (!amount) return res.status(400).json({ message: "Please provide a withdrawal amount." })

            const withdrawal = await PaymentService.requestWithdrawal(userId, amount, bankDetails);

            return res.status(200).json({
                message: "Withdrawal requested successfully",
                data: withdrawal
            })
        } catch (error: any) {
            console.error("ERROR REQUESTING WITHDRAWAL", error);

            if (error.message.includes("exceeds") || error.message.includes("required") || error.message.includes("greate than")) {
                return res.status(400).json({ message: error.message })
            }

            if (error.message.includes("Only seller")) {
                return res.status(400).json({ message: error.message })
            }

            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting ledger." });
        }
    }
}