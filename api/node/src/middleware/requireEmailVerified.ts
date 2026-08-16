import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { Role } from "../../generated/prisma";

const EXEMPT_PREFIXES = [
    "/api/email-otp",
    "/api/otp",
    "/api/auth",
    "/api/webhook"
]

export interface AuthedRequest extends Request {
    authUser?: {
        userId: string;
        tokenVersion: number;
        isBanned: boolean;
        isEmailVerified: boolean;
        role: Role;
    }
}

export async function requireEmailVerified(
    req: AuthedRequest,
    res: Response,
    next: NextFunction
): Promise<any> {
    const token = req.cookies?.token;
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            tokenVersion: number
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true, isEmailVerified: true, role: true }
        });

        if (!user) return next();

        req.authUser = {
            userId: decoded.userId,
            tokenVersion: user.tokenVersion,
            isBanned: user.isBanned,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
        };

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before continuing.",
                code: "EMAIL_NOT_VERIFIED",
            });
        }

        return next();
    } catch {
        return next()
    } 
}