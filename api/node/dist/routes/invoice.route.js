"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/invoices/create:
 *   post:
 *       summary: Seller creates an invoice for an off-platform client
 *       tags: [Invoices]
 *       security:
 *           - bearerAuth: []
 */
router.post("/create", auth_1.protectRoute, invoice_controller_1.InvoiceController.create);
/**
 * @openapi
 * /api/invoices/{invoiceId}:
 *   get:
 *       summary: Public — fetch invoice details for the checkout page
 *       tags: [Invoices]
 */
router.get("/:invoiceId", invoice_controller_1.InvoiceController.getById);
/**
 * @openapi
 * /api/invoices/{invoiceId}/pay:
 *   post:
 *       summary: Public - buyer submits email/name and gets a checkout link
 *       tags: [Invoices]
 */
exports.default = router;
