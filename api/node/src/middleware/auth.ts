import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. This tells Typescript we might have a userId attached.
export interface AuthRequest extends Request {
    userId?: string;
}


// 2. the actual bouncer function
export const protectRoute = (req: AuthRequest, res: Response, next: NextFunction): any => {
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
        ) as { userId: string };

       // Attach the decoded userId to the request object
        req.userId = decoded.userId;

        // Send them to the next function (which will be getMe)
        next();
    } catch(error) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
    }
}