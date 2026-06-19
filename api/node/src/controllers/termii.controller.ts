import { Request, Response } from "express";
import { TermiiService } from "../services/termii.service";
import { prisma } from "../utils/prisma";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class TermiiController {
    // POST api/otp/send
    static async sendOtp(req: Request, res: Response): Promise<any> {
        try{
            const userId = (req as any).userId;
            const { phone } = req.body;

            if (!phone) {
                return res.status(400).json({ message: "Phone number is required!" });
            }

            await TermiiService.sendOtp(phone, userId);

            return res.status(200).json({ message: "OTP sent succesfully, now Verify" })
        } catch(error:any) {
            console.error("ERROR sending OTP:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ messsage: "Failed to send OTP." });
        }
    }

    //POST api/otp/verify
    static async verifyOtp(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { otp } = req.body;

            if (!otp) {
                return res.status(400).json({ message: "OTP is required." })
            }

            const result = await TermiiService.sendOtp(userId, otp);

            return res.status(200).json({ message: result.message });
        } catch(error: any) {
            console.error("ERROR verifying OTP");
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to verify the OTP." })
        }
    }

    static async notifyOrderPlaced(req: Request, res: Response) {
       try{
            const userId = (req as any).userId;
            const { gig } = req.body

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(400).json({ message: "User does not exist" })
            }

            await TermiiService.notifyOrderPlaced(user.phoneNumber, gig.title);
       } catch(error: any) {
            console.error(" ERROR notifying buyer for order placement:", error);
            const handled = handlePrismaError(error, res);
            if(handled) return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been placed." })
       }
    }

    static async notifyOrderCompleted(req: Request, res: Response) {
       try{
            const userId = (req as any).userId;
            const { gig } = req.body

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(400).json({ message: "User does not Exist" })
            }

            await TermiiService.notifyOrderCompleted(user.phoneNumber, gig.title);

            return res.status(200).json({ message: "Buyer notified successfully." });
       } catch(error: any) {
            console.error(" ERROR notifying buyer for Order Completion:", error);
            const handled = handlePrismaError(error, res);
            if(handled) return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been completed." })
       }
    }

    static async notifyPayoutSent(req: Request, res: Response) {
       try{
            const userId = (req as any).userId;
            const { amount } = req.body

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(400).json({ message: "User does not Exist" })
            }

            await TermiiService.notifyOrderCompleted(user.phoneNumber, amount);
       } catch(error: any) {
            console.error(" ERROR notifying buyer for Order Completion", error);
            const handled = handlePrismaError(error, res);
            if(handled) return;
            return res.status(500).json({ message: "Failed to Send Order to buyer, as order has been completed." })
       }
    }

}


