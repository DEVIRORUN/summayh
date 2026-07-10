import crypto from 'crypto';

/**
 * Verifies that an incoming webhook payload genuinely came from Paystack.
 * Paystack signs the raw request body with your secret key using HMAC SHA512.
 * The signature arrives in the `x-paystack-signature` header.
 *
 * CRITICAL: `rawBody` must be the exact, unparsed byte string Paystack sent —
 * not a JSON.parse'd and re-stringified version, or the hash will never match.
 */
export function verifyPaystackSignature(rawBody: string, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        console.error('❌ [Webhook] PAYSTACK_SECRET_KEY missing from env - cannot verify signature.')
        return false
    }

    const expectedHash = crypto
        .createHmac('sha512', secretKey)
        .update(rawBody)
        .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedHash, 'utf-8')
    const receivedBuffer = Buffer.from(signatureHeader, 'utf-8')

    if (expectedBuffer.length !== receivedBuffer.length) return false;

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}