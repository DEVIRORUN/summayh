import crypto from 'crypto';

// 1. Paste your local Paystack Test Secret Key here
const PAYSTACK_SECRET_KEY = "sk_test_9646cfe9cdffae9431aafc28dab869fbed5bd68f"; 

// 2. Paste the Order ID you copied from Prisma Studio here
const MOCK_ORDER_ID = "28c6853e-42c2-4106-880e-63e142c6244e";

// Strongly type the webhook structure to match Paystack's delivery layout
interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    metadata: {
      orderId: string;
    };
    customer: {
      email: string;
    };
  };
}

const payload: PaystackWebhookPayload = {
  event: "charge.success",
  data: {
    reference: `TST-${Math.floor(Math.random() * 1000000)}`,
    amount: 50000, // ₦500.00 (stored in kobo subunits)
    metadata: {
      orderId: MOCK_ORDER_ID
    },
    customer: {
      email: "test-buyer@example.com"
    }
  }
};

const rawBody = JSON.stringify(payload);

// Compute the identical cryptographic hash your route expects
const signature = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(rawBody)
  .digest('hex');

/**
 * Fires the signed payload at your running express application server
 */
async function runTest() {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/paystack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature
      },
      body: rawBody
    });

    const bodyText = await response.text();
    console.log(`==== Test Webhook Transmission Completed ====`);
    console.log(`Response Status : ${response.status} ${response.statusText}`);
    console.log(`Server Output   : ${bodyText}`);
  } catch (error) {
    console.error("Execution failed sending mock payload:", error);
  }
}

runTest();