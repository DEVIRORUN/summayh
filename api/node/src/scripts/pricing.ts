import { prisma } from "../utils/prisma";

async function seed() {
  await prisma.proPlan.createMany({
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