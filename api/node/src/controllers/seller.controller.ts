import { Request, Response } from "express"
import { prisma } from "../utils/prisma"
import { PaystackService } from "../services/paystack.service"


export class SellerController {

    // POST /api/seller/onboard
    static async onboardSeller(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { accountName, settlementBank, accountNumber, biography } = req.body;

            if (!settlementBank || !accountNumber) {
                return res.status(400).json({ error: "Bnak code and account numner are required." })
            }

            // 1. Fire the Paystack generator method we wrote above
            console.log(`🏦 Registering subaccount for user ${userId}...`);
            const subaccountCode = await PaystackService.createSellerSubaccount(
                accountName  || `Summayh Seller ${userId.slice(0,4)}`,
                settlementBank,
                accountNumber,
                10 // my cut
            );

            // 2. Update the user record with the generated payout kwy
            const updateProfile = await prisma.sellerProfile.upsert({
                where: { userId },
                update: {
                    paystackSubaccountCode: subaccountCode
                },
                create: {
                    userId,
                    paystackSubaccountCode: subaccountCode,
                    bio: biography as string,
                    skills: [],
                }
            });
            await prisma.user.update({
                where: { id: userId },
                data: { role: "SELLER" }
            });

            return res.status(200).json({
                message: "Seller payout successfully activated!",
                subaccountCode: updateProfile.paystackSubaccountCode
            })
        } catch(error: any) {
            console.error(error.message);
            return res.status(400).json({ error: error.message })
        }
    }

    // To list all supported banks from Paystack
    static async listBanks(req: Request, res: Response): Promise<any> {
        try {
            const banks = await PaystackService.getSupportedBanks();
            return res.status(200).json({ banks });
        } catch(error: any) {
            return res.status(500).json({ error: error.message })
        }
    }
}