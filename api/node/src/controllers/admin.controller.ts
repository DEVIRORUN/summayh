import { Response, Request } from "express"
import { prisma } from "../utils/prisma"
import { handlePrismaError } from "../utils/prismaErrorHandler"


export class AdminController{
    static async getDashboard(res: Response, req: Request): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const user = await prisma.user.findUnique({
                where: { id: adminId }
            });

            // Validate: Check if user is an admin
            if (user?.role !== "ADMIN") {
                return res.status(400).json({ message: "You are not an admin!!!" })
            }

            const users = await prisma.user.count() // i don't knwo what to pass here
            const gigs = await prisma.gig.count({ where: { state: "ACTIVE" } }) // i don't knwo what to pass here
            const top5sellers = await prisma.sellerProfile.findMany({ where: { avgRating: 4 } })
        } catch(err: any) {
            console.error("ERROR GETTING DASHBOARD AS ADMIN: ", err);
            const handler = handlePrismaError(err, res);
            if (handler) return;
            return res.status(500).json({
                message: "ERROR GETTING DASHBOARD AS ADMIN 500"
            })
        }
    }
}