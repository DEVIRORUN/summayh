"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = getIO;
// api/node/src/index.ts
require("dotenv/config");
require("./workers/call.worker"); // just importing starts it listening
require("./workers/proSubscription.worker"); // just importing starts it listening
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_1 = require("./socket");
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const testimonial_route_1 = __importDefault(require("./routes/testimonial.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const foundersPass_route_1 = __importDefault(require("./routes/foundersPass.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const delivery_route_1 = __importDefault(require("./routes/delivery.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
const seller_route_1 = __importDefault(require("./routes/seller.route"));
const gig_route_1 = __importDefault(require("./routes/gig.route"));
const termii_route_1 = __importDefault(require("./routes/termii.route"));
const emailOtp_route_1 = __importDefault(require("./routes/emailOtp.route"));
const call_route_1 = __importDefault(require("./routes/call.route"));
const review_route_1 = __importDefault(require("./routes/review.route"));
const dispute_route_1 = __importDefault(require("./routes/dispute.route"));
const sessionDispute_route_1 = __importDefault(require("./routes/sessionDispute.route"));
const webhook_route_1 = __importDefault(require("./routes/webhook.route"));
const agentDesicion_route_1 = __importDefault(require("./routes/agentDesicion.route"));
const sessionMaterial_route_1 = __importDefault(require("./routes/sessionMaterial.route"));
const proSubscription_route_1 = __importDefault(require("./routes/proSubscription.route"));
const livekitWebhook_route_1 = __importDefault(require("./routes/livekitWebhook.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use("/webhooks/livekit", express_1.default.raw({ type: "application/webhook+json" }), livekitWebhook_route_1.default);
// 1. Configure CORS to explicitly allow credentials
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true // Now cookies can pass back and forth
}));
// 2. Register Cookie Parser
app.use((0, cookie_parser_1.default)());
// Middleware to parse incoming JSON payloads
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf; // buf - needed for webhook signature verification
    }
}));
const swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Summayh API",
            version: "1.0.0",
            description: "API documentation for the Summayh freelance marketplace platform."
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
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
});
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Mount our routes
app.use("/api/auth", auth_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/testimonial", testimonial_route_1.default);
app.use("/api/category", category_route_1.default);
app.use("/api/user", user_route_1.default);
app.use("/api/founders-pass", foundersPass_route_1.default);
app.use("/api/webhook", webhook_route_1.default);
app.use("/api/orders", order_route_1.default);
app.use("/api/deliveries", delivery_route_1.default);
app.use("/api/messages", message_route_1.default);
app.use("/api/payment", payment_route_1.default);
app.use("/api/seller", seller_route_1.default);
app.use("/api/gig", gig_route_1.default);
app.use("/api/otp", termii_route_1.default);
app.use("/api/email-otp", emailOtp_route_1.default);
app.use("/api/calls", call_route_1.default);
app.use("/api/reviews", review_route_1.default);
app.use("/api/disputes", dispute_route_1.default);
app.use("/api/session-disputes", sessionDispute_route_1.default);
app.use("/api/admin/agent-decisions", agentDesicion_route_1.default);
app.use("/api/session-material", sessionMaterial_route_1.default);
app.use("/api/pro-subscriptions", proSubscription_route_1.default);
app.use("/api/notifications", notification_route_1.default);
(0, socket_1.initSocket)(io);
function getIO() {
    return io;
}
// Start listening
server.listen(PORT, () => {
    console.log(`🚀 Summayh 1.0.0 Engine running on ${PORT}`);
});
