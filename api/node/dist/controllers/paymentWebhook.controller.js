"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookController = void 0;
const verifyPaystackSignature_1 = require("../utils/verifyPaystackSignature");
const order_service_1 = require("../services/order.service");
const foundersPass_service_1 = require("../services/foundersPass.service");
const invoice_service_1 = require("../services/invoice.service");
const payment_service_1 = require("../services/payment.service");
class PaymentWebhookController {
    static async PaystackThread(req, res) {
        try {
            const signature = req.headers["x-paystack-signature"];
            const rawBody = req.rawBody;
            if (!rawBody) {
                console.error(new Date(), "-> [Webhook]: req.rawBody is missing - check expess.json() verify cllback in index.ts");
                return res.status(500).json({ message: "Server misconfiguration." });
            }
            // 1. Verify signature using raw bytes, not the parssed body
            const isValid = (0, verifyPaystackSignature_1.verifyPaystackSignature)(rawBody, signature);
            if (!isValid) {
                console.warn(new Date(), "-> [Security Warning]: Unauthorized webhook signatue mismatch dropped.");
                return res.status(401).send("Invalid event signatue origin");
            }
            // 2. Extract event details now that it's verified
            const { event, data } = req.body;
            console.log(`[Webhook Received]: Paystack event triggered: ${event}`);
            if (event === "charge.success") {
                const { metadata } = data;
                if (metadata?.founderPassPurchaseId) {
                    await foundersPass_service_1.FoundersPassService.activateFoundersPass(data.reference);
                }
                else if (metadata?.invoiceId) {
                    await invoice_service_1.InvoiceService.activateInvoice(data.reference);
                }
                else if (metadata?.orderId) {
                    await order_service_1.OrderService.handleSuccessfulPayment(data);
                }
                else {
                    console.error(`[Webhook Error]: No recognizable identifiew in metadata for referece: ${data.reference}`);
                }
            }
            else if (event === "transfer.success") {
                await payment_service_1.PaymentService.handleTransferSuccess(data);
            }
            else if (event === "transfer.failed") {
                await payment_service_1.PaymentService.handleTransferFailed(data);
            }
            else if (event === "transfer.reversed") {
                await payment_service_1.PaymentService.handleTransferReversed(data);
            }
            else {
                console.log(`[Webhook Info]: Unhandled event type: ${event}`);
            }
            // 4. Always acknowledge Paystack immediately with 200
            return res.status(200).send("Event processed successfully");
        }
        catch (error) {
            console.error("Webhook error:", error);
            return res
                .status(500)
                .json({ message: "Internal server error during webhook processing" });
        }
    }
}
exports.PaymentWebhookController = PaymentWebhookController;
