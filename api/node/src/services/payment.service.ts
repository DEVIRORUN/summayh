import { prisma } from "../utils/prisma";
import { PaystackService } from "./paystack.service";

export class PaymentService {
  static async getBalance(userId: string): Promise<any> {
    try {
      console.log("[PAYMENT GET BALANCE]: HIT!!!");
      const [earnings, refunds, withdrawals, pending] = await Promise.all([
        prisma.ledgerEntry.aggregate({
          where: { userId, type: "EARNING", status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.ledgerEntry.aggregate({
          where: { userId, type: "REFUND", status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.ledgerEntry.aggregate({
          where: {
            userId,
            type: "WITHDRAWAL",
            status: { in: ["PENDING", "COMPLETED"] },
          },
          _sum: { amount: true },
        }),
        prisma.ledgerEntry.aggregate({
          where: { userId, type: "EARNING", status: "PENDING" },
          _sum: { amount: true },
        }),
      ]);

      const totalEarned = Number(earnings._sum.amount || 0);
      const totalRefunded = Number(refunds._sum.amount || 0);
      const totalWithdrawn = Number(withdrawals._sum.amount || 0);
      const pendingWithdrawals = Number(pending._sum.amount || 0);

      const available = totalEarned - totalRefunded - totalWithdrawn;

      console.log(`[PAYMENT GET BALANCE]: SUCCESSFUL ${available}!!!`);
      return {
        available,
        totalEarned,
        totalWithdrawn,
        pendingWithdrawals,
      };
    } catch (error: any) {
      console.error("ERROR GETTING BALANCE", error);
      throw error;
    }
  }
  static async getEarningsSummary(sellerId: string): Promise<any> {
    try {
      console.log("[SUMMARY EARNING]: HIT!!!");

      const [balance, pendingEarnings, orderCount] = await Promise.all([
        this.getBalance(sellerId),
        prisma.ledgerEntry.aggregate({
          where: { sellerId, type: "EARNING", status: "PENDING" },
          _sum: { amount: true }
        }),
        prisma.order.count({
          where: { sellerId: sellerId }
        }),
      ]);


      console.log("[SUMMARY EARNING]: SUCESSFUL!!!", orderCount);
      return {
        totalEarned: balance.totalEarned,
        pendingPayout: Number(pendingEarnings._sum.amount || 0),
        orderCount: orderCount ?? 0,
        available: balance.available,
      }
    } catch (error: any) {
      console.error("ERROR GETTING EARNINGS SUMMARY", error);
      throw error;
    }
  }
  static async getLedger(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
        const skip = (page - 1) * limit;

        const entries = await prisma.ledgerEntry.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                order: { select: { id: true, gigId: true } },
                withdrawal: { select: { id: true, status: true } }
            }
        });

        const total = await prisma.ledgerEntry.count({ where: { userId } });

        return {
            data: entries,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error: any) {
        console.error("ERROR GETTING LEDGER", error);
        throw error;
    }
  }
  static async requestWithdrawal(
    userId: string,
    amount: number,
    bankDetails?: {
      accountNumber: string;
      bankCode: string;
      accountName: string;
    },
  ): Promise<any> {
    try {
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId },
      });
      if (!seller) throw new Error("Only sellers can request withdrawals.");
      if (!seller.paystackSubaccountCode)
        throw new Error(
          "No payout recipient set up. Add your bank details first.",
        );

      const balance = await this.getBalance(userId);
      if (amount > balance.available)
        throw new Error("Withdrawal amount exceeds available balance.");
      if (amount <= 0)
        throw new Error("Withdrawal amount must be greater than zero.");

      let recipientCode = seller.paystackSubaccountCode;
      if (!recipientCode) {
        if (!bankDetails)
          throw new Error("Bank details required for first withdrawal.");
        recipientCode = await PaystackService.createTransferRecipient(
          bankDetails.accountNumber,
          bankDetails.bankCode,
          bankDetails.accountName,
        );
        await prisma.sellerProfile.update({
          where: { userId },
          data: { paystackSubaccountCode: recipientCode },
        });
      }

      const withdrawal = await prisma.$transaction(async (tx) => {
        const w = await tx.withdrawal.create({
          data: {
            userId,
            amount,
            status: "PENDING",
            paystackRecipientCode: recipientCode,
          },
        });

        await tx.ledgerEntry.create({
          data: {
            userId,
            type: "WITHDRAWAL",
            status: "PENDING",
            amount,
            withdrawalId: w.id,
            description: `Withdrawal request ${w.id}`,
          },
        });

        return w;
      });
      // Another try ^^
      try {
        const transfer = await PaystackService.initiateTransfer(
          recipientCode,
          Math.round(amount * 100),
          withdrawal.id,
          `SUMMMAYH withdrawal ${withdrawal.id}`,
        );

        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            paystackTransferCode: transfer.transfer_code,
            paystackTransferId: String(transfer.id),
            status: transfer.status === "success" ? "COMPLETED" : "PENDING",
          },
        });
      } catch (transferError: any) {
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "FAILED", failureReason: transferError.message },
        });
        await prisma.ledgerEntry.updateMany({
          where: { withdrawalId: withdrawal.id },
          data: { status: "FAILED" },
        });
        throw transferError;
      }
      return withdrawal;
    } catch (error: any) {
      console.error("ERROR REQUESTING WITHDRAWAL", error);
      throw error;
    }
  }
  public static async handleTransferSuccess(data: any) {
    const { reference } = data;
    try {
        return await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.update({
                where: { id: reference },
                data: { status: "COMPLETED", completedAt: new Date() }
            });
            await tx.ledgerEntry.updateMany({
                where: { withdrawalId: withdrawal.id },
                data: { status: "COMPLETED" }
            });

            console.log(`[Webhook Success]: Withdrawal ${reference} completed`);
            return { succes: true }
        });
    } catch (error) {
        console.error( `[Webhook Processing Failed - Transfer Success]: ${error}`);
        throw error;
    }
  }
  public static async handleTransferFailed(data: any) {
    const { reference, reason } = data;
    try {
        return await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.update({
                where: { id: reference },
                data: { status: "FAILED", failureReason: reason || "Transfer failed" }
            });
            await tx.ledgerEntry.updateMany({
                where: { withdrawalId: withdrawal.id },
                data: { status: "FAILED" }
            });

            console.log(`[Webhook Info]: Withdrawal ${reference} failed - ${reason}`);
            return { succes: true }
        });
    } catch (error) {
        console.error( `[Webhook Processing Failed - Transfer Failed]: ${error}`);
        throw error;
    }
  }
  public static async handleTransferReversed(data: any) {
    const { reference } = data;
    try {
        return await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.update({
                where: { id: reference },
                data: { status: "REVERSED" }
            });
            await tx.ledgerEntry.updateMany({
                where: { withdrawalId: withdrawal.id },
                data: { status: "REVERSED" }
            });

            console.log(`[Webhook Info]: Withdrawal ${reference} reversed - funds returned`);
            return { succes: true }
        });
    } catch (error) {
        console.error( `[Webhook Processing Failed - Transfer Reversed]: ${error}`);
        throw error;
    }
  }
}
