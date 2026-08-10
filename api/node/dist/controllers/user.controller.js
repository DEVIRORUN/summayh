"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class UserController {
    static async getMe(req, res) {
        try {
            const userId = req.userId;
            // Fecth the user info
            const user = await user_service_1.UserService.getMe(userId);
            return res.status(200).json({
                message: "User fetched successfully",
                user
            });
        }
        catch (error) {
            console.error("ERROR in getMe:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "SOmethign wnet wrong fetching user data." });
        }
    }
    static async updateMe(req, res) {
        try {
            const userId = req.userId;
            const userData = req.body;
            const updatedUser = await user_service_1.UserService.updateMe(userId, userData);
            return res.status(200).json({
                message: "User updated successfully",
                user: updatedUser
            });
        }
        catch (error) {
            console.error("ERROR in updateMe:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong updating user data." });
        }
    }
}
exports.UserController = UserController;
