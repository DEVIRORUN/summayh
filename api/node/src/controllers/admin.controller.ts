import { Response, Request } from "express"
import { AdminService } from "../services/admin.service"
import { prisma } from "../utils/prisma"
import { handlePrismaError } from "../utils/prismaErrorHandler"


export class AdminController{
    static async getDashboard(req: Request, res: Response): Promise<any> {
        try {
            console.error("GETTING DASHBOARD AS ADMIN: HIT!!!");
            const adminId = (req as any).userId
            const data = await AdminService.getDashboardMetrics(adminId);
            console.error("GETTING DASHBOARD AS ADMIN: SUCCESS!!!");
            return res.status(200).json({
                message: "Admin dashboard metrics fetched successfully.",
                data
            });
        } catch(err: any) {
            console.error("ERROR GETTING DASHBOARD AS ADMIN: ", err);

            const handler = handlePrismaError(err, res);
            if (handler) return;
            return res.status(500).json({
                message: "ERROR GETTING DASHBOARD AS ADMIN 500"
            });
        }
    }
    static async listDisputes(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.page as string) || 15;
            const status = req.query.status as string;

            const { disputes, meta } = await AdminService.getPaginatedDisputes(
                page, limit, status
            )

            return res.status(200).json({
                messgae: "Disputes retrieved successfully.",
                data: disputes,
                meta
            });
        } catch(err: any) {
            console.error("DISPUTES CONTROLLER ERROR: ", err);

            const handler = handlePrismaError(err, res);
            if (handler) return;
            return res.status(500).json({
                message: "Internal server error fetching dispute database data."
            })
        }
    }
    static async listUsers(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.page as string) || 15;

            const filters = {
                VerificationStatus: req.query.verificationStatus as string,
                university: req.query.university as string,
                dateForm: req.query.dateForm as string
            }

            const { users, meta } = await AdminService.getPaginatedUsers(
                page, limit, filters
            )
            return res.status(200).json({
                messgae: "Users retrieved successfully.",
                data: users,
                meta
            });
        } catch(err: any) {
            console.error("USERS LIST CONTROLLER ERROR: ", err);

            const handler = handlePrismaError(err, res);
            if (handler) return;
            return res.status(500).json({
                message: "Internal server error fetching user database data."
            })
        }
    }
    static async verifyUser(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const { userId } = req.params;

            const updatedUser = await AdminService.verifyUserAccount(userId as string);

            return res.status(200).json({
                message: 'User account verified successfully',
                data: updatedUser
            });
        } catch (error: any) {
            console.error("VERIFY CONTROLLER ERROR:", error);
            if (error.code === "P2025") return res.status(404).json({ message: "User record not found." });
            if (handlePrismaError(error, res)) return;
            return res.status(500).json({ message: "Failed to apply profile verification." });
        }
    }
    static async suspendUser(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const { userId } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({ message: "A reason must be specified for sccount suspension." })
            }

            const updatedUser = await AdminService.suspendUserAccount(userId as string, reason);

            return res.status(200).json({
                message: 'User account has been suspended.',
                data: updatedUser
            });
        } catch (error: any) {
            console.error("SUSPEND CONTROLLER ERROR:", error);
            if (error.code === "P2025") return res.status(404).json({ message: "User record not found." });
            if (handlePrismaError(error, res)) return;
            return res.status(500).json({ message: "Failed to apply suspension ." });
        }
    }
}