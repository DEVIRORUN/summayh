"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
class PaystackService {
    static secretKey = process.env.PAYSTACK_SECRET_KEY;
    static async initiateRefund(transactionReference, amountInKobo) {
        try {
            const response = await axios_1.default.post('https://api.paystack.co/refund', {
                transaction: transactionReference,
                amount: amountInKobo // No commision deducted
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': "application/json"
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("❌ [Paystack Refund Error]:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to initiate refund");
        }
    }
    /**
     * Releases escrow funds directly to the seller's account
     * @param subaccountCode The Paystack subaccount ID assigned to the seller (e.g., ACCT_xxxxxx)
     * @param amountInKobo Total payout amount in Kobo (minus platform fee)
     * @param orderId Used to create a unique transfer reference
     */
    static async releaseEscrowToSeller(subaccountCode, amountInKobo, orderId) {
        try {
            // In a production marketplace environment, Paystack can auto-split on transaction,
            // or you can manually trigger a transfer from your main balance like this:
            const response = await axios_1.default.post('https://api.paystack.co/transfer', {
                source: "balance",
                amount: amountInKobo,
                recipient: subaccountCode,
                reason: `Escrow release for Order #${orderId}`,
                reference: `RELEASE-${orderId}-${Date.now()}`
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("❌ [Paystack Transfer Error]:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to execute escrow release transfer.");
        }
    }
    /**
     * Creates a dedicated Paystack subaccount for a seller
     * @param businessName The seller's brand/display name or full name
     * @param settlementBank The bank code (e.g., "058" for GTBank, "011" for First Bank)
     * @param accountNumber The seller's 10-digit NUBAN account number
     * @param percentageCharge Your platform's flat commission percentage (e.g., 10 for 10%)
     */
    static async createSellerSubaccount(businessName, settlementBank, accountNumber, percentageCharge = 10) {
        try {
            const response = await axios_1.default.post('https://api.paystack.co/subaccount', {
                business_name: businessName,
                settlement_bank: settlementBank,
                account_number: accountNumber,
                percentage_charge: percentageCharge
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                },
            });
            console.log("KEY:", this.secretKey?.slice(0, 8)); // just the first 8 chars, safe to log
            // This returns the unique subaccount code (e.g., ACCT_abc123xyz)
            return response.data.data.subaccount_code;
        }
        catch (error) {
            console.error("❌ [Paystack Subaccount Creation Error]:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to create seller subaccount with Paystack.");
        }
    }
    static async getSupportedBanks() {
        const agent = new https_1.default.Agent({ rejectUnauthorized: false });
        try {
            const response = await axios_1.default.get("https://api.paystack.co/bank?country=nigeria", {
                headers: { Authorization: `Bearer ${this.secretKey}` },
                httpsAgent: agent
            });
            console.log("KEY:", this.secretKey?.slice(0, 8)); // just the first 8 chars, safe to log
            return response.data.data;
        }
        catch (error) {
            console.error("❌ [Paystack Fetch Banks Error]:", error.message);
            throw new Error("Failed to load supported banks");
        }
    }
    static async initializeTransaction(email, amountInNaira, metadata) {
        const amountInKobo = amountInNaira * 100;
        try {
            const response = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
                email,
                amount: amountInKobo,
                metadata,
                callback_url: `${process.env.FRONTEND_URL}/orders/callback` // Send back to FE
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    "Content-Type": "application/json"
                }
            });
            return response.data;
        }
        catch (error) {
            console.error("❌ [Paystack Initialize Transaction Error]:", error.message);
            throw new Error("Failed to initialize Transaction");
        }
    }
    static async verifyTransaction(reference) {
        try {
            const response = await axios_1.default.get(`https://api.paystack.co/transaction/${reference}`, { headers: { Authorization: `Bearer ${this.secretKey}` } });
            return response.data;
        }
        catch (error) {
            console.error(" [Paystack Verify Transaction Error]: ", error.response?.data || error.message);
            throw new Error("Failed to verify transaction");
        }
    }
    static async createTransferRecipient(accountNumber, bankCode, name) {
        try {
            const response = await axios_1.default.post("https://api.paystack.co/transferrecipient", {
                type: "nuban",
                name,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: "NGN"
            }, { headers: { Authorization: `Bearer ${this.secretKey}` } });
            return response.data.data.recipient_code;
        }
        catch (error) {
            console.error("ERROR CREATING TRANSFER RECIPIENT", error);
            throw new Error("Failed to create transfer recipient");
        }
    }
    static async initiateTransfer(recipientCode, amountInKobo, reference, reason) {
        try {
            const response = await axios_1.default.post("https://api.paystack.co/transfer", {
                source: "balance",
                amount: amountInKobo,
                recipient: recipientCode,
                reference,
                reason,
            }, { headers: { Authorization: `Bearer ${this.secretKey}` } });
            return response.data.data;
        }
        catch (error) {
            console.error("ERROR IINITIATING TRANSFER", error?.response?.data);
            throw new Error("Failed to inititae transfer.");
        }
    }
}
exports.PaystackService = PaystackService;
