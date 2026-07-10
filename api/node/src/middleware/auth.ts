import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

// 1. This tells Typescript we might have a userId attached.
export interface AuthRequest extends Request {
    userId?: string;
    tokenVersion?: number;
}


// 2. the actual bouncer function
export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    // Grabs teh header to tak ethe token to verify
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized. No token provided."
        });
    }

    // Split teh string to get the token
    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string || "summayh_dev_secret_key_0627"
        ) as { userId: string, tokenVersion: number };

        // 1. Fetch only the tokenVersion
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true }
        });

        // 2. Check if user was deleted, banned or an admin bumped their token version before
        if (!user || user.isBanned || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(403).json({
                message: "Access denied. Your session has expired or this account has been suspended."
            })
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