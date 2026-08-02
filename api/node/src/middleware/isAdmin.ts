import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";


// Define admin
export interface AdminRequest extends Request {
    userId?: string;
    userRole?: string;
}



export const isAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<any> => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: string; role: string; tokenVersion: number };

        // Might wanna check is admin was banned by SUPIEROR ADMIN
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true }
        });

        if (!user || user.isBanned || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(403).json({
                message: "Acces denied. you have been blocked by SUPERIOR ADMIN"
            })
        }

        // 3. Strict gatekeeping check: Bounce them out if they aren't an admin
        if (decoded.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied. Administrative privileges required, bro."
            });
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role;

        // Send them to the next function (getDashboard)
        next()
    } catch(error) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." })
    }
    // I'll leave this for now, i don't know how i'll check for role maybe i'll use prisma or is it from JWT directly??
}
