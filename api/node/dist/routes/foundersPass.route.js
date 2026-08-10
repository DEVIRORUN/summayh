"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const foundersPass_controller_1 = require("../controllers/foundersPass.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/founders-pass/initialize:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Founders Pass]
 *      security:
 *          - bearerAuht: []
 */
router.post('/initialize', auth_1.protectRoute, foundersPass_controller_1.FoundersPassController.initialize);
/**
 * @openapi
 * /api/founders-pass/avaialbility:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Founders Pass]
 */
router.get('/availability', foundersPass_controller_1.FoundersPassController.availability);
exports.default = router;
