import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { AuthedRequest } from "./requireEmailVerified";
import { Role } from "../../generated/prisma";

export interface OptionalAuthRequest extends Request {
    userId?: string;
    tokenVersion?: number;
    role?: Role;
}

export const optionalAuth = async (
    req: OptionalAuthRequest & AuthedRequest, 
    _res: Response, 
    next: NextFunction): Promise<void> => {
    const token = req.cookies?.token;
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            tokenVersion: number;
        }

        let userCheck = req.authUser;
        if (!userCheck) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { tokenVersion: true, isBanned: true, isEmailVerified: true, role: true }
            });
            if (!user || user.isBanned) return next();

            userCheck = { userId: decoded.userId, ...user }
        }

        req.userId = decoded.userId;
        req.tokenVersion = decoded.tokenVersion;
        req.role = userCheck.role;

        return next();
    } catch {
        // proceed as unknown
        return next();
    }
}