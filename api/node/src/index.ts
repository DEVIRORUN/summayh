// api/node/src/index.ts

import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import express from "express";

import authRoutes from "./routes/auth";
import orderRoutes from "./routes/order.route"
import sellerRoutes from "./routes/seller.route"
import gigRoutes from "./routes/gig.route"
import webhookRouter from './routes/webhook.route';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Summayh API", version: "1.0.0"},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount our routes
app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/gig", gigRoutes);

app.use(express.json());

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Summayh Engine running on http://localhost:${PORT}`);
//   console.log("👉 Actual Keys Node can see:", Object.keys(process.env).filter(key => key.includes('PAYSTACK')));
//   console.log("🔍 Webhook Route Inspecting Key:");
// console.log("- Type of key:", typeof process.env.PAYSTACK_SECRET_KEY);
// console.log("- Length of key string:", process.env.PAYSTACK_SECRET_KEY?.length);
// console.log("- Value starts with 'sk_test_':", process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_'));
});