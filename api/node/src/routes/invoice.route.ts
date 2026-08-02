import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { protectRoute } from "../middleware/auth"


const router = Router()

/**
 * @openapi
 * /api/invoices/create:
 *   post:
 *       summary: Seller creates an invoice for an off-platform client
 *       tags: [Invoices]
 *       security:
 *           - bearerAuth: []
 */
router.post("/create", protectRoute, InvoiceController.create);
/**
 * @openapi
 * /api/invoices/{invoiceId}:
 *   get:
 *       summary: Public — fetch invoice details for the checkout page
 *       tags: [Invoices]
 */
router.get("/:invoiceId", InvoiceController.getById)
/**
 * @openapi
 * /api/invoices/{invoiceId}/pay:
 *   post:
 *       summary: Public - buyer submits email/name and gets a checkout link
 *       tags: [Invoices]
 */

export default router;