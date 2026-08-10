import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "./auth";

export interface SellerRequest extends AuthRequest {
    sellerId?: string;
}

export const requireSeller = async (req: SellerRequest, res: Response, next: NextFunction) => {
    try {
        const seller = await prisma.sellerProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true }
        });

        if (!seller) {
            return res.status(403).json({ message: "Acces denied. Seller account required." })
        }

        req.sellerId = seller.id;
        next();
    } catch(err: any) {
        console.log("[REQUIRE SELLER MIDDLEWARE ERROR]", err)
        return res.status(500).json({ message: "Failed to verify seller status." })
    }
}