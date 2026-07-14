import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { UserController } from "../controllers/user.controller";


const router = Router();

/**
 * @openapi
 * /api/user/me:
 *  get:
 *     summary: get current authenticated user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: successfully listed the user details
 *       500:
 *         description: Failed to fetch user data
 * 
 */
router.get("/me", protectRoute, UserController.getMe);
/**
 * @openapi
 * /api/user/update:
 *   put:
 *     summary: Update user's data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated user username
 *               phoneNumber:
 *                 type: string
 *                 description: Updated user phone number
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input data
 */
router.put("/update", protectRoute, UserController.updateMe);

export default router;