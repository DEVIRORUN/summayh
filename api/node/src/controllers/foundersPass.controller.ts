import { Request, Response } from "express"
import { FoundersPassService } from "../services/foundersPass.service"


export class FoundersPassController {
    static async initialize(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId },
      });
      if (!sellerProfile) {
        return res
          .status(403)
          .json({ message: "You must be a seller to purchase a Founders Pass." });
      }

      const result = await FoundersPassService.initializeFoundersPassPayment(
        sellerProfile.id,
        email,
      );
      return res.status(200).json({
        message: new Date() + "-> [FoundersPass Init Success]: Founder Pass initialized successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(new Date(), "-> [FoundersPass Init Error]:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
    static async availability(req: Request, res: Response): Promise<any> {
        try {
            console.log("[FOUNDERS PASS]: HIT!!!");
            const result = await FoundersPassService.getFoundersPassAvailability();
            console.log("[FOUNDERS PASS]: SUCCESFULL!!!");
            return res.status(200).json({
                message: new Date() + "-> [FoundersPass Availability  Success]: Check Successful",
                data: result
            });
        } catch(error: any) {
            console.error(new Date(),"-> [FoundersPass Availability Error]:", error.message);
            return res.status(500).json({ message: "Failed to fetch availability." });
        }
    }
}