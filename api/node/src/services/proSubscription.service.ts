import { prisma } from "../utils/prisma";
import { PaystackService } from "./paystack.service";

export class ProSubscriptionService {
    static async getActivePlans() {
        return prisma.proPlan.findMany({ where: { isActive: true }, orderBy: { priceNaira: "asc" } })
    }
    static async initializeSubscription(sellerId: string, planId: string, buyerEmail: string) {
        const plan = await prisma.proPlan.findUniqueOrThrow({ where: { id: planId } });
        const seller = await prisma.sellerProfile.findUniqueOrThrow({ where: { id: sellerId } });

        if (seller.isPro && seller.proSource === "FOUNDERS"){
            throw new Error("You already have a lifetime Founders Pass - no need to subscribe.");
        }

        const subscription = await prisma.proSubscription.create({
            data: { sellerId, planId, status: "PENDING" },
        });

        const paymentInit = await PaystackService.initializeTransaction(
            buyerEmail,
            plan.priceNaira,
            { proSubscriptionId: subscription.id } // metadata - webhhok routes on this
        );

        await prisma.proSubscription.update({
            where: { id: subscription.id },
            data: { paymentReference: paymentInit.data.reference }
        });

        return { checkoutUrl: paymentInit.data.authorization_url, reference: paymentInit.data.reference }
    }
    static async activateSubscription(reference: string) {
        return prisma.$transaction(async (tx) => {
            const sub = await tx.proSubscription.findUniqueOrThrow({
                where: { paymentReference: reference },
                include: { plan: true },
            });

            if (sub.status === "PAID") return { success: true, duplicated: true };

            const periodDays = sub.plan.interval === "MONTHLY" ? 30 : 365; // wnat abotu FEBRUARY
            const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

            await tx.proSubscription.update({
                where: { id: sub.id },
                data: { status: "PAID", paidAt: new Date(), currentPeriodEnd },
            });

            await tx.sellerProfile.update({
                where: { id: sub.sellerId }, // we need to update frontend on user.role fo rseller checks, tahst' if we are gonna use useAuth, but if we use getCurrentUsre this got no probs
                data: { isPro: true, proSource: "SUBSCRIPTION", proExpiresAt: currentPeriodEnd }
            });

            return { success: true };
        })
    }

    // BullMQ flips non-subers to non-Pro
    static async expiresStaleSubscriptions() {
        const expired = await prisma.sellerProfile.findMany({
            where: { isPro: true, proSource: "SUBSCRIPTION", proExpiresAt: { lt: new Date() } },
            select: { id: true }
        });

        for (const seller of expired) {
            await prisma.sellerProfile.update({
                where: { id: seller.id },
                data: { isPro: false, proSource: null, proExpiresAt: null },
            });
        }

        return { expiredCount: expired.length };
    }
}