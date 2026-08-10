"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../utils/prisma");
const paystack_service_1 = require("./paystack.service");
class InvoiceService {
    /**
     * Creates a new invoice for a Pro seller to send to an off-platform client.
     */
    static async createInvoice(userId, clientName, description, amount) {
        try {
            const seller = await prisma_1.prisma.sellerProfile.findUnique({
                where: { userId },
            });
            if (!seller)
                throw new Error("Seller profile not found.");
            if (!seller.isPro)
                throw new Error("Only Summayh Pro sellers can create invoices.");
            const invoice = await prisma_1.prisma.invoice.create({
                data: {
                    sellerId: userId,
                    clientName,
                    description,
                    amount,
                    status: "PENDING",
                },
            });
            const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
            return { invoice, shareableLink };
        }
        catch (error) {
            console.error("Unable to create Invoice");
            throw error;
        }
    }
    /**
     * Public — fetches invoice details for the checkout page to display.
     */
    static async getInvoiceById(invoiceId) {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                seller: {
                    select: { sellerUsername: true, user: { select: { name: true } } },
                },
            },
        });
        if (!invoice)
            throw new Error("Invoice not found");
        if (invoice.status === "PAID")
            throw new Error("This invoicehas already been paid");
        if (invoice.status === "CANCELLED")
            throw new Error("This invoice has been cancelled.");
        return invoice;
    }
    /**
     * Called when the buyer submits their email/name on the checkout page.
     * Finds or creates a User account as a side effect, then initializes payment.
     */
    static async initializeInvoicePayment(invoiceId, buyerEmail, buyerName) {
        try {
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id: invoiceId },
            });
            if (!invoice)
                throw new Error("Invoice not found.");
            if (invoice.status !== "PENDING")
                throw new Error("This invoiceis not payable.");
            // Find or create the buyer's User account — password is a random placeholder,
            // buyer can set a real one later via setting
            let buyer = await prisma_1.prisma.user.findUnique({
                where: { email: buyerEmail },
            }); // FINd buyer if exisitng
            // If not, create
            if (!buyer) {
                const placeholderPassword = crypto_1.default.randomBytes(16).toString("hex");
                const hashedPassword = await bcrypt_1.default.hash(placeholderPassword, 10);
                buyer = await prisma_1.prisma.user.create({
                    data: {
                        email: buyerEmail,
                        university: "UNKWOWN",
                        name: buyerName,
                        password: hashedPassword,
                        dateOfBirth: new Date("2000-01-01"),
                    },
                });
            }
            // Link buyer to invoice now that we have them
            await prisma_1.prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    buyerId: buyer.id,
                    clientEmail: buyerEmail,
                },
            });
            const paymentInit = await paystack_service_1.PaystackService.initializeTransaction(buyerEmail, invoice.amount, { invoiceId: invoice.id });
            await prisma_1.prisma.invoice.update({
                where: { id: invoiceId },
                data: { paymentReference: paymentInit.data.reference },
            });
            return {
                checkoutUrl: paymentInit.data.authorization_url,
                reference: paymentInit.data.reference,
            };
        }
        catch (error) {
            console.error("Failed to activate the Invoice Payment");
            throw error;
        }
    }
    /**
     * Called from the webhook after Paystack confirms payment.
     * Idempotent — releases full amount to seller (0% commission).
     */
    static async activateInvoice(reference) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { paymentReference: reference },
                include: { seller: true },
            });
            if (!invoice) {
                throw new Error(`No invoice found for reference: ${reference}`);
            }
            if (invoice.status === "PAID") {
                console.log(`[Webhook Info]: Invoice ${invoice.id} already marked as PAID.`);
                return { success: true, duplicated: true };
            }
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: "PAID", paidAt: new Date() },
            });
            const sellerSubaccount = invoice.seller.paystackSubaccountCode;
            if (!sellerSubaccount) {
                throw new Error("Seller does not have  aregistered payout subaccount.");
            }
            // 0% commission — full amount released to seller
            const payoutAmountInKobo = Math.round(invoice.amount * 100);
            await paystack_service_1.PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, invoice.id);
            console.log(`[Webhook Success]: Invoice ${invoice.id} paid and released to seller ${invoice.sellerId}`);
            return { success: true };
        });
    }
    /** Not needed really */
    static async isInvoiceReference(reference) {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { paymentReference: reference },
        });
        return !!invoice;
    }
}
exports.InvoiceService = InvoiceService;
