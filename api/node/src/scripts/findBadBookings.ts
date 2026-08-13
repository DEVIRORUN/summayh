import { prisma } from "../utils/prisma";

async function main() {
    const suspects = await prisma.sessionBooking.findMany({
        where: { outcome: "BOTH_MISSED", status: "COMPLETED" },
        select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
            outcomeResolvedAt: true,
            buyerJoinedAt: true,
            sellerJoinedAt: true,
        },
        orderBy: { scheduledStart: "desc" },
    });
    console.log(`${suspects.length} BOTH_MISSED bookings:`);
    suspects.forEach(b => console.log(b));
}

main().finally(() => prisma.$disconnect());