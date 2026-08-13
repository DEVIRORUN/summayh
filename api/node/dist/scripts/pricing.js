"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../utils/prisma");
async function seed() {
    await prisma_1.prisma.proPlan.createMany({
        data: [
            {
                name: "Pro Monthly",
                priceNaira: 6000,
                interval: "MONTHLY",
                perks: ["Priority ranking", "Pro badge", "Lower commission"],
                isActive: true,
            },
            {
                name: "Pro Yearly",
                priceNaira: 54000,
                interval: "YEARLY",
                perks: ["Priority ranking", "Pro badge", "Lower commission", "3 months free"],
                isActive: true,
            },
        ],
    });
    console.log("Seeded ProPlans");
}
seed().then(() => process.exit(0));
