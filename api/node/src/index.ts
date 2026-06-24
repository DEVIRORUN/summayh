// api/node/src/index.ts

import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import express from "express";

import authRoutes from "./routes/auth";
import orderRoutes from "./routes/order.route"
import sellerRoutes from "./routes/seller.route"
import gigRoutes from "./routes/gig.route"
import TermiiRoutes from "./routes/termii.route"
import webhookRouter from './routes/webhook.route';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Summayh API",
      version: "1.0.0",
      description:
        "API documentation for the Summayh freelance marketplace platform."
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        // ---------- ORDERS ----------
        CreateOrder: {
          type: "object",
          required: [
            "buyerEmail",
            "serviceId",
            "amount"
          ],
          properties: {
            buyerEmail: {
              type: "string",
              format: "email"
            },
            serviceId: {
              type: "string",
              format: "uuid"
            },
            amount: {
              type: "number",
              minimum: 500
            }
          }
        },
        CancelOrder: {
          type: "object",
          required: [
            "reason"
          ],
          properties: {
            reason: {
              type: "string",
              minLength: 5
            }
          }
        },
        SubmitRequirements: {
          type: "object",
          required: [
            "requirements"
          ],
          properties: {
            requirements: {
              type: "object",
              additionalProperties: true
            }
          }
        },
        // ---------- GIGS ----------
        GigTierInput: {
          type: "object",
          required: [
            "description",
            "price",
            "deliveryDays",
            "revisionCount"
          ],
          properties: {
            customName: {
              type: "string"
            },
            description: {
              type: "string"
            },
            price: {
              type: "number",
              minimum: 1
            },
            deliveryDays: {
              type: "integer",
              minimum: 1
            },
            revisionCount: {
              type: "integer",
              minimum: 0
            }
          }
        },
        CreateGig: {
          type: "object",
          required: [
            "title",
            "description",
            "tags",
            "categoryId",
            "tiers"
          ],
          properties: {
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            tags: {
              type: "array",
              items: {
                type: "string"
              }
            },
            categoryId: {
              type: "string",
              format: "uuid"
            },
            tiers: {
              type: "object",
              required: [
                "BASIC",
                "STANDARD",
                "PREMIUM"
              ],
              properties: {
                basic: {
                  $ref: "#/components/schemas/GigTierInput"
                },
                standard: {
                  $ref: "#/components/schemas/GigTierInput"
                },
                premium: {
                  $ref: "#/components/schemas/GigTierInput"
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    "./src/routes/*.ts"
  ]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount our routes
app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/gig", gigRoutes);
app.use("/api/otp", TermiiRoutes);

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Summayh 1.0.0 Engine running on http://localhost:${PORT}`);
//   console.log("👉 Actual Keys Node can see:", Object.keys(process.env).filter(key => key.includes('PAYSTACK')));
//   console.log("🔍 Webhook Route Inspecting Key:");
// console.log("- Type of key:", typeof process.env.PAYSTACK_SECRET_KEY);
// console.log("- Length of key string:", process.env.PAYSTACK_SECRET_KEY?.length);
// console.log("- Value starts with 'sk_test_':", process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_'));
});