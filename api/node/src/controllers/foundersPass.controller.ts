import { Request, Response } from "express"
import { FoundersPassService } from "../services/foundersPass.service"


export class FoundersPassController {
    static async initialize(req: Request, res: Response): Promise<any> {
        try {
            const sellerId = (req as any).userId;
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email is required." });
            }

            const result = await FoundersPassService.initializeFoundersPassPayment(sellerId, email);
            return res.status(200).json({
                message: "[FoundersPass Init Success]: Founder Pass initialized successfully",
                data: result
            });
        } catch(error: any) {
            console.error("[FoundersPass Init Error]:", error.message);
            return res.status(500).json({ message: error.message })
        }
    }
    static async availability(req: Request, res: Response): Promise<any> {
        try {
            const result = await FoundersPassService.getFoundersPassAvailability();
            return res.status(200).json({
                message: "[FoundersPass Availability  Success]: Check Successful",
                data: result
            });
        } catch(error: any) {
            console.error("[FoundersPass Availability Error]:", error.message);
            return res.status(500).json({ message: "Failed to fetch availability." });
        }
    }
}