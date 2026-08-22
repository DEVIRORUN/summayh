// api/node/src/index.ts
import "dotenv/config";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
import './workers/call.worker'; // just importing starts it listening
import './workers/proSubscription.worker'; // just importing starts it listening
import './workers/ranking.worker'; // just importing starts it listening
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import { Server } from "socket.io"
import { initSocket } from "./socket"
import { requireEmailVerified } from "./middleware/requireEmailVerified";


import notificationRoutes from "./routes/notification.route";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin.route";
import testimonialRoutes from "./routes/testimonial.route";
import categoryRoutes from "./routes/category.route";
import userRoutes from "./routes/user.route";
import foundersPassRoutes from "./routes/foundersPass.route";
import orderRoutes from "./routes/order.route"
import deliveryRoutes from "./routes/delivery.route"
import messageRoutes from "./routes/message.route"
import paymentRoutes from "./routes/payment.route"
import sellerRoutes from "./routes/seller.route"
import gigRoutes from "./routes/gig.route"
import TermiiRoutes from "./routes/termii.route"
import emailOtpRoutes from "./routes/emailOtp.route";
import callRoutes from "./routes/call.route";
import reviewRoutes from './routes/review.route';
import disputeRoutes from './routes/dispute.route';
import sessionDisputeRoutes from './routes/sessionDispute.route';
import webhookRouter from './routes/webhook.route';
import agentDecisionRoutes from './routes/agentDesicion.route';
import sessionMaterialRoutes from './routes/sessionMaterial.route';
import proSubscriptionRoutes from './routes/proSubscription.route';
import livekitWebhookRouter from "./routes/livekitWebhook.route";
import avatarRoutes from "./routes/avatar.route";

const app = express();
app.use(helmet());
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

app.use(
  "/webhooks/livekit",
  express.raw({ type: "application/webhook+json" }),
  livekitWebhookRouter
)

// 1. Configure CORS to explicitly allow credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true // Now cookies can pass back and forth
}));

// 2. Register Cookie Parser
app.use(cookieParser());

// Middleware to parse incoming JSON payloads
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf; // buf - needed for webhook signature verification
  }
}));

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3001", credentials: true }
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Covers it all to check emial first
// app.use(requireEmailVerified);

// Mount our routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/founders-pass", foundersPassRoutes);
app.use("/api/webhook", webhookRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/gig", gigRoutes);
app.use("/api/otp", TermiiRoutes);
app.use("/api/email-otp", emailOtpRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/session-disputes", sessionDisputeRoutes);
app.use("/api/admin/agent-decisions", agentDecisionRoutes);
app.use("/api/session-material", sessionMaterialRoutes);
app.use("/api/pro-subscriptions", proSubscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/avatar", avatarRoutes)

initSocket(io);

export function getIO() {
  return io;
}

// Start listening
server.listen(PORT, () => {
  console.log(`🚀 Summayh 1.0.0 Engine running on ${PORT}`);
});