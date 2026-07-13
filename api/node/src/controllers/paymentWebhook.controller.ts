import { Request, Response } from "express"
import { verifyPaystackSignature } from "../utils/verifyPaystackSignature"
import { OrderService } from "../services/order.service"
import { FoundersPassService } from "../services/foundersPass.service"
import { InvoiceService } from "../services/invoice.service"


export class PaymentWebhookController {
    static async PaystackThread(req: Request, res: Response) {
        try {
            const signature = req.headers['x-paystack-signature'] as string | undefined;
            const rawBody = (req as any).rawBody;

            if(!rawBody) {
                console.error("[Webhook]: req.rawBody is missing - check expess.json() verify cllback in index.ts");
                return res.status(500).json({ message: "Server misconfiguration." })
            }

            // 1. Verify signature using raw bytes, not the parssed body
            const isValid = verifyPaystackSignature(rawBody, signature);
            if(!isValid){
                console.warn("[Security Warning]: Unauthorized webhook signatue mismatch dropped.");
                return res.status(401).send('Invalid event signatue origin');
            }

            // 2. Extract event details now that it's verified
            const { event, data } = req.body;
            console.log(`[Webhook Received]: Paystack event triggered: ${event}`)

            if (event === "charge.success") {
                const { metadata } = data

                if (metadata?.founderPassPurchaseId) {
                    await FoundersPassService.activateFoundersPass(data.reference);
                } else if (metadata?.invoiceId) {
                    await InvoiceService.activateInvoice(data.reference)
                } else if (metadata?.orderId){
                    await OrderService.handleSuccessfulPayment(data)
                } else {
                    console.error(`[Webhook Error]: No recognizable identifiew in metadata for referece: ${data.reference}`)
                }
            }

            // 4. Always acknowledge Paystack immediately with 200
            return res.status(200).send('Event processed successfully');
        } catch(error) {
            console.error("Webhook error:", error);
            return res.status(500).json({ message: "Internal server error during webhook processing" })
        }
    }
}