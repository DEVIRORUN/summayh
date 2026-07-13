import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma"
import { PaystackService } from "./paystack.service";


export class InvoiceService {
    /**
     * Creates a new invoice for a Pro seller to send to an off-platform client.
     */
    static async createInvoice(sellerId: string, clientName: string, description: string, amount: number): Promise<any> {
        try {
            const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
            if (!seller) throw new Error("Seller profile not found.");
            if (!seller.isPro) throw new Error("Only Summayh Pro sellers can create invoices.");

            const invoice = await prisma.invoice.create({
                data: {
                    sellerId,
                    clientName,
                    description,
                    amount,
                    status: 'PENDING',
                }
            });

            const shareableLink = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
            return { invoice, shareableLink };
        } catch(error: any) {
            console.error();
            throw error;
        }
    }
    /**
     * Public — fetches invoice details for the checkout page to display.
     */
    static async getInvoiceById(invoiceId: string):Promise<any> {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { seller: { select: { sellerUsername: true, user: { select: { name: true } } } } }
        });
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status === 'PAID') throw new Error("This invoicehas already been paid");
        if (invoice.status === 'CANCELLED') throw new Error("This invoice has been cancelled.");
        return invoice;  
    }
    /**
     * Called when the buyer submits their email/name on the checkout page.
     * Finds or creates a User account as a side effect, then initializes payment.
     */
    static async initializeInvoicePayment(invoiceId: string, buyerEmail: string, buyerName: string): Promise<any> {
        try {
            const invoice = await prisma.invoice.findUnique({  where: { id: invoiceId } });
            if (!invoice) throw new Error("Invoice not found.");
            if (invoice.status !== 'PENDING') throw new Error("This invoiceis not payable.");
            
            // Find or create the buyer's User account — password is a random placeholder,
            // buyer can set a real one later via setting
            let buyer = await prisma.user.findUnique({ where: { email: buyerEmail } });// FINd buyer if exisitng

            // If not, create
            if (!buyer) {
                const placeholderPassword = crypto.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(placeholderPassword, 10);

                buyer = await prisma.user.create({
                    data: {
                        email: buyerEmail,
                        university: 'UNKWOWN',
                        name: buyerName,
                        password: hashedPassword,
                        dateOfBirth: new Date('2000-01-01'),
                    }
                });
            }

            // Link buyer to invoice now that we have them

            await prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    buyerId: buyer.id,
                    clientEmail: buyerEmail
                }
            });

            const paymentInit = await PaystackService.initializeTransaction(
                buyerEmail,
                invoice.amount,
                { invoiceId: invoice.id }
            );

            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { paymentReference: paymentInit.data.reference }
            });
            
            return {
                checkoutUrl: paymentInit.data.authorization_url,
                reference: paymentInit.data.reference
            };
        } catch(error: any) {
            console.error("Failed to activate the Invoice Payment");
            throw error;
        }
    }
    /**
     * Called from the webhook after Paystack confirms payment.
     * Idempotent — releases full amount to seller (0% commission).
     */
    static async activateInvoice(reference: string) {
        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { paymentReference: reference },
                include: { seller: true }
            });

            if (!invoice) {
                throw new Error(`No invoice found for reference: ${reference}`); 
            }

            if (invoice.status === 'PAID') {
                console.log(`[Webhook Info]: Invoice ${invoice.id} already marked as PAID.`);
                return { success: true, duplicated: true }
            }

            await tx.invoice.update({
                where: { id: invoice.id },
                data: {  status: 'PAID', paidAt: new Date() }
            });

            const sellerSubaccount = invoice.seller.paystackSubaccountCode;
            if (!sellerSubaccount) {
                throw new Error("Seller does not have  aregistered payout subaccount.");
            }

            // 0% commission — full amount released to seller
            const payoutAmountInKobo = Math.round(invoice.amount * 100);
            await PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, invoice.id)

            console.log(`[Webhook Success]: Invoice ${invoice.id} paid and released to seller ${invoice.sellerId}`);
            return { success: true };
        })
    }
    /** Not needed really */
    static async isInvoiceReference(reference: string): Promise<any> {
        const invoice = await prisma.invoice.findUnique({ where: { paymentReference: reference } });
        return !!invoice;
    }
}