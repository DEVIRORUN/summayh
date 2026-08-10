"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seller_controller_1 = require("../controllers/seller.controller");
const auth_1 = require("../middleware/auth");
const isSeller_1 = require("../middleware/isSeller");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/seller/banks:
 *   get:
 *     summary: List all supported Nigerian banks for seller onboarding
 *     tags: [Seller]
 *     responses:
 *       200:
 *         description: List of banks with their codes
 *       500:
 *         description: Failed to fetch banks from Paystack
 */
router.get("/banks", seller_controller_1.SellerController.listBanks);
/**
 * @openapi
 * /api/seller/onboard:
 *   post:
 *     summary: Register seller bank account and activate payout via Paystack subaccount
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [settlementBank, accountNumber]
 *             properties:
 *               accountName:
 *                 type: string
 *                 description: Seller's business or display name (optional, defaults to Summayh Seller)
 *               settlementBank:
 *                 type: string
 *                 description: Bank code e.g. "058" for GTBank
 *               accountNumber:
 *                 type: string
 *                 description: Seller's 10-digit NUBAN account number
 *               bio:
 *                 type: string
 *                 description: Input your bio here bud
 *     responses:
 *       200:
 *         description: Seller payout activated, subaccount code returned
 *       400:
 *         description: Missing required fields or Paystack registration failed
 *       404:
 *         description: Seller profile not found
 */
router.post("/onboard", auth_1.protectRoute, seller_controller_1.SellerController.onboardSeller);
/**
 * @openapi
 * /api/seller/me:
 *  get:
 *     summary: Get the authenticated seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       404:
 *         description: Seller profile not found
 */
router.get("/me", auth_1.protectRoute, seller_controller_1.SellerController.getSellerProfile);
/**
 * @openapi
 * /api/seller/availability:
 *  patch:
 *     summary: Get the authenticated seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       404:
 *         description: Seller profile not found
 */
router.patch("/availability", auth_1.protectRoute, isSeller_1.requireSeller, seller_controller_1.SellerController.setAvailability);
/**
 * @openapi
 * /api/seller/{sellerId}/available-slots:
 *  get:
 *     summary: Get the authenticated seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       404:
 *         description: Seller profile not found
 */
router.get("/:sellerId/available-slots", seller_controller_1.SellerController.getAvailableSlots);
/**
 * @openapi
 * /api/seller/availability:
 *  get:
 *     summary: Get the authenticated seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       404:
 *         description: Seller profile not found
 */
router.get("/availability", auth_1.protectRoute, isSeller_1.requireSeller, seller_controller_1.SellerController.getAvailability);
/**
 * @openapi
 * /api/seller/update:
 *   put:
 *     summary: Update the authenticated seller's profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 description: Updated seller bio
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated seller skills
 *               phoneNumber:
 *                 type: string
 *                 description: Updated seller phone number
 *               sellerUsername:
 *                 type: string
 *                 description: Updated seller username
 *     responses:
 *       200:
 *         description: Seller profile updated successfully
 *       400:
 *         description: Invalid input data
 */
router.put("/update", auth_1.protectRoute, seller_controller_1.SellerController.updateSellerProfile);
exports.default = router;
