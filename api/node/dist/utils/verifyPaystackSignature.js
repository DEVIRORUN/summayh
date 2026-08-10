"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaystackSignature = verifyPaystackSignature;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Verifies that an incoming webhook payload genuinely came from Paystack.
 * Paystack signs the raw request body with your secret key using HMAC SHA512.
 * The signature arrives in the `x-paystack-signature` header.
 *
 * CRITICAL: `rawBody` must be the exact, unparsed byte string Paystack sent —
 * not a JSON.parse'd and re-stringified version, or the hash will never match.
 */
function verifyPaystackSignature(rawBody, signatureHeader) {
    if (!signatureHeader)
        return false;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error('❌ [Webhook] PAYSTACK_SECRET_KEY missing from env - cannot verify signature.');
        return false;
    }
    const expectedHash = crypto_1.default
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');
    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedHash, 'utf-8');
    const receivedBuffer = Buffer.from(signatureHeader, 'utf-8');
    if (expectedBuffer.length !== receivedBuffer.length)
        return false;
    return crypto_1.default.timingSafeEqual(expectedBuffer, receivedBuffer);
}
