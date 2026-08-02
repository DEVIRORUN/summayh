import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

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
router.get("/trending", CategoryController.getTrendingGigs);
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
router.get("/tree", CategoryController.getCategoryTree);

export default router;