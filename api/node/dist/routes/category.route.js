"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/category/trending:
 *   get:
 *     summary: Retrieve top trending categories
 *     description: Fetches a list of categories aggregated by order volume from the past 7 days.
 *     tags:
 *       - Category Management
 *     responses:
 *       200:
 *         description: Fetches top Categories successfully.
 *       500:
 *         description: Internal server error.
 */
router.get("/trending", category_controller_1.CategoryController.getTrendingGigs);
/**
 * @openapi
 * /api/category/tree:
 *   get:
 *     summary: Retrieve tre categories deatils
 *     description: Fetches a list of categories aggregated by order volume from the past 7 days.
 *     tags:
 *       - Category Management
 *     responses:
 *       200:
 *         description: Fetches top Categories successfully.
 *       500:
 *         description: Internal server error.
 */
router.get("/tree", category_controller_1.CategoryController.getCategoryTree);
exports.default = router;
