// scripts/testBooking.ts
import { prisma } from "../utils/prisma";
import { BookingService } from "../services/booking.service"; 

async function main() {
  // 1. reuse an existing seller + buyer if you have test users already, else create them
  const seller = await prisma.sellerProfile.findUnique({ where: { id: "66fcb691-167b-42a1-851c-64968ee28053" } });
  const buyer = await prisma.user.findUnique({ where: { id: "d356296a-c27a-4977-8ce0-408961ace407" } });

  if (!seller || !buyer) {
    throw new Error("Need at least one SellerProfile and one BUYER user in DB first");
  }

  // 2. create a minimal test gig + tier if none exists
  let gig = await prisma.gig.findFirst({ where: { sellerId: seller.id } });
  if (!gig) {
    const category = await prisma.category.findFirst();
    if (!category) throw new Error("Need at least one Category in DB first");

    gig = await prisma.gig.create({
      data: {
        sellerId: seller.id,
        categoryId: category.id,
        title: "Test Tutoring Gig",
        deliveryMode: "LIVE",
      },
    });
  }

  let tier = await prisma.gigTier.findFirst({ where: { gigId: gig.id } });
  if (!tier) {
    tier = await prisma.gigTier.create({
      data: {
        gigId: gig.id,
        label: "BASIC",
        description: "Test tier",
        price: 5000,
        deliveryDays: 1,
        revisionCount: 0,
      },
    });
  }

  // 3. create a test order
  const order = await prisma.order.create({
    data: {
      sellerId: seller.id,
      buyerId: buyer.id,
      categoryId: gig.categoryId,
      gigId: gig.id,
      gigTierId: tier.id,
      tierLabelSnapshot: "BASIC",
      tierDescription: tier.description,
      unitPriceSnapshot: tier.price,
      totalPrice: tier.price,
      deliveryDaysSnapshot: tier.deliveryDays,
      revisionCountSnapshot: tier.revisionCount,
      status: "PAID",
    },
  });

  // 4. create a session package
  const sessionPackage = await prisma.sessionPackage.create({
    data: {
      orderId: order.id,
      gigTierid: tier.id,
      sessionLengthMin: 30,
      breakLengthMin: 3,
      totalSessions: 10,
    },
  });

  // 5. THIS is the real test — goes through your actual service, queues real BullMQ jobs
  const booking = await BookingService.createBooking({
    packageId: sessionPackage.id,
    scheduledStart: new Date(Date.now() + 2 * 60_000), // 2 min from now
    scheduledEnd: new Date(Date.now() + 32 * 60_000),
  });

  console.log("Booking created:", booking);
  console.log("Watch your terminal — 'prepare-room' should fire almost immediately (delay clamped to 0).");
}

main()
  .catch(console.error)
  .finally(() => process.exit());