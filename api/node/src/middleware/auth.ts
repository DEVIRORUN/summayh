import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { AuthedRequest } from "./requireEmailVerified";

// 1. This tells Typescript we might have a userId attached.
export interface AuthRequest extends Request {
    userId?: string;
    tokenVersion?: number;
}


// 2. the actual bouncer function
export const protectRoute = async (req: AuthRequest & AuthedRequest, res: Response, next: NextFunction): Promise<any> => {

    // 1. Grab the token from cookies
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized. No token provided."
        })
    }

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as { userId: string, tokenVersion: number };

        let userCheck = req.authUser;
        if (!userCheck) {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true, isEmailVerified: true },
        });
        if (!user) {
            return res.status(403).json({ message: "Access denied. Your session has expired or this account has been suspended." });
        }
        userCheck = { userId: decoded.userId, ...user };
        }
       // Attach the decoded userId to the request object
        req.userId = decoded.userId;
        req.tokenVersion = decoded.tokenVersion;

        // Send them to the next function (which will be getMe)
        next();
    } catch(error) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
    }
}