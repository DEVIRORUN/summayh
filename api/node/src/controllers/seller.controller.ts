import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { PaystackService } from "../services/paystack.service";
import { SellerService } from "../services/seller.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export class SellerController {
  // POST /api/seller/onboard
  static async onboardSeller(req: Request, res: Response): Promise<any> {
    console.log(new Date(), "-> [Seller Onboard]: Hit!");
    try {
      const userId = (req as any).userId;
      const {
        accountName,
        settlementBank,
        accountNumber,
        biography,
        phoneNumber,
      } = req.body;

      if (!settlementBank || !accountNumber) {
        return res
          .status(400)
          .json({ error: "Bnak code and account numner are required." });
      }

      // 1. Fire the Paystack generator method we wrote above
      console.log(`🏦 Registering subaccount for user ${userId}...`);
      const subaccountCode = await PaystackService.createSellerSubaccount(
        accountName || `Summayh Seller ${userId.slice(0, 4)}`,
        settlementBank,
        accountNumber,
        10, // my cut
      );

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // 2. Update the user record with the generated payout kwy
      const updateProfile = await prisma.sellerProfile.upsert({
        where: { userId },
        update: {
          paystackSubaccountCode: subaccountCode,
        },
        create: {
          user: {
            connect: { id: userId },
          },
          paystackSubaccountCode: subaccountCode,
          bio: biography as string,
          phoneNumber: phoneNumber,
          skills: [],
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { role: "SELLER" },
      });
      console.log(
        new Date(),
        "-> [Seller Onboard]: Succesully created SellerProfile!",
      );
      return res.status(200).json({
        message: "Seller payout successfully activated!",
        subaccountCode: updateProfile.paystackSubaccountCode,
      });
    } catch (error) {
      console.error("ERROR in On-Boarding Seller:", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
  // To list all supported banks from Paystack
  static async listBanks(req: Request, res: Response): Promise<any> {
    try {
      const banks = await PaystackService.getSupportedBanks();
      return res.status(200).json({ banks });
    } catch (error) {
      console.error("ERROR in Listing Banks Available:", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({ message: "Something went wrong." });
    }
  }
  static async getSellerProfile(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).userId;
      const sellerProfile = await SellerService.getSellerByUserId(sellerId);
      return res.status(200).json({
        sellerProfile,
      });
    } catch (error: any) {
      console.error("ERROR in Getting Seller Profile: ", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({ message: "Failed to get seller profile." });
    }
  }
  // static async getSellerProfileByUserId(req: Request, res: Response): Promise<any> {
  //     try {
  //         const userId = (req as any).userId;
  //         const sellerProfile = await SellerService.getSellerByUserId(userId);
  //         return res.status(200).json({
  //             sellerProfile
  //         });
  //     } catch(error: any) {
  //         console.error("ERROR in Getting Seller Profile: ", error);
  //         const handled = handlePrismaError(error, res);
  //         if (handled) return;
  //         return res.status(500).json({ message: "Failed to get seller profile." });
  //     }
  // }
  static async updateSellerProfile(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).userId;
      const { bio, skills, phoneNumber, sellerUsername } = req.body;

      if (!bio && !skills && !phoneNumber && !sellerUsername) {
        return res
          .status(400)
          .json({ message: "At least one field must be provided for update." });
      }

      const updatedProfile = await SellerService.updateSellerProfile(
        sellerId,
        bio,
        skills,
        phoneNumber,
        sellerUsername,
      );

      return res.status(200).json({
        message: "Seller profile updated successfully.",
        updatedProfile,
      });
    } catch (error: any) {
      console.error("ERROR in Updating Seller Profile: ", error);
      throw error;
    }
  }
}
