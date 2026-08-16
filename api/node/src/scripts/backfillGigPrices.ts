// scripts/backfillGigPrices.ts
import { prisma } from "../utils/prisma";

async function backfill() {
  const gigs = await prisma.gig.findMany({
    select: { id: true, tiers: { select: { price: true } } },
  });

  for (const gig of gigs) {
    if (gig.tiers.length === 0) continue;
    const prices = gig.tiers.map((t) => t.price);
    const minPrice = prices.reduce((a, b) => (a < b ? a : b));
    const maxPrice = prices.reduce((a, b) => (a > b ? a : b));
    await prisma.gig.update({
      where: { id: gig.id },
      data: { minPrice, maxPrice },
    });
  }
  console.log(`Backfilled ${gigs.length} gigs`);
}

backfill().then(() => process.exit(0));