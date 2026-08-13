"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class AdminController {
    static async getDashboard(req, res) {
        try {
            console.error("GETTING DASHBOARD AS ADMIN: HIT!!!");
            const adminId = req.userId;
            const data = await admin_service_1.AdminService.getDashboardMetrics(adminId);
            console.error("GETTING DASHBOARD AS ADMIN: SUCCESS!!!");
            return res.status(200).json({
                message: "Admin dashboard metrics fetched successfully.",
                data
            });
        }
        catch (err) {
            console.error("ERROR GETTING DASHBOARD AS ADMIN: ", err);
            const handler = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handler)
                return;
            return res.status(500).json({
                message: "ERROR GETTING DASHBOARD AS ADMIN 500"
            });
        }
    }
    static async listDisputes(req, res) {
        try {
            const adminId = req.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.page) || 15;
            const status = req.query.status;
            const { disputes, meta } = await admin_service_1.AdminService.getPaginatedDisputes(page, limit, status);
            return res.status(200).json({
                messgae: "Disputes retrieved successfully.",
                data: disputes,
                meta
            });
        }
        catch (err) {
            console.error("DISPUTES CONTROLLER ERROR: ", err);
            const handler = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handler)
                return;
            return res.status(500).json({
                message: "Internal server error fetching dispute database data."
            });
        }
    }
    static async listUsers(req, res) {
        try {
            const adminId = req.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.page) || 15;
            const filters = {
                VerificationStatus: req.query.verificationStatus,
                university: req.query.university,
                dateForm: req.query.dateForm
            };
            const { users, meta } = await admin_service_1.AdminService.getPaginatedUsers(page, limit, filters);
            return res.status(200).json({
                messgae: "Users retrieved successfully.",
                data: users,
                meta
            });
        }
        catch (err) {
            console.error("USERS LIST CONTROLLER ERROR: ", err);
            const handler = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handler)
                return;
            return res.status(500).json({
                message: "Internal server error fetching user database data."
            });
        }
    }
    static async verifyUser(req, res) {
        try {
            const adminId = req.userId;
            const { userId } = req.params;
            const updatedUser = await admin_service_1.AdminService.verifyUserAccount(userId);
            return res.status(200).json({
                message: 'User account verified successfully',
                data: updatedUser
            });
        }
        catch (error) {
            console.error("VERIFY CONTROLLER ERROR:", error);
            if (error.code === "P2025")
                return res.status(404).json({ message: "User record not found." });
            if ((0, prismaErrorHandler_1.handlePrismaError)(error, res))
                return;
            return res.status(500).json({ message: "Failed to apply profile verification." });
        }
    }
    static async suspendUser(req, res) {
        try {
            const adminId = req.userId;
            const { userId } = req.params;
            const { reason } = req.body;
            if (!reason) {
                return res.status(400).json({ message: "A reason must be specified for sccount suspension." });
            }
            const updatedUser = await admin_service_1.AdminService.suspendUserAccount(userId, reason);
            return res.status(200).json({
                message: 'User account has been suspended.',
                data: updatedUser
            });
        }
        catch (error) {
            console.error("SUSPEND CONTROLLER ERROR:", error);
            if (error.code === "P2025")
                return res.status(404).json({ message: "User record not found." });
            if ((0, prismaErrorHandler_1.handlePrismaError)(error, res))
                return;
            return res.status(500).json({ message: "Failed to apply suspension ." });
        }
    }
}
exports.AdminController = AdminController;
