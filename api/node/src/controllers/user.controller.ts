import { Response, Request } from "express"
import { UserService } from "../services/user.service"
import { handlePrismaError } from "../utils/prismaErrorHandler";

export class UserController {
    static async getMe(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;

            // Fecth the user info
            const user = await UserService.getMe(userId);

            return res.status(200).json({
                message: "User fetched successfully",
                user
            })
        } catch(error: any) {
            console.error("ERROR in getMe:", error);

            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "SOmethign wnet wrong fetching user data." })
        }
    }
    static async updateMe(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const userData = req.body;

            const updatedUser = await UserService.updateMe(userId, userData);

            return res.status(200).json({
                message: "User updated successfully",
                user: updatedUser
            })
        } catch(error: any) {
            console.error("ERROR in updateMe:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong updating user data." })
        }
    }
}