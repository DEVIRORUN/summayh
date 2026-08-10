"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSeller = void 0;
const prisma_1 = require("../utils/prisma");
const requireSeller = async (req, res, next) => {
    try {
        const seller = await prisma_1.prisma.sellerProfile.findUnique({
            where: { userId: req.userId },
            select: { id: true }
        });
        if (!seller) {
            return res.status(403).json({ message: "Acces denied. Seller account required." });
        }
        req.sellerId = seller.id;
        next();
    }
    catch (err) {
        console.log("[REQUIRE SELLER MIDDLEWARE ERROR]", err);
        return res.status(500).json({ message: "Failed to verify seller status." });
    }
};
exports.requireSeller = requireSeller;
