import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";


// Define admin
export interface AdminRequest extends Request {
    userId?: string;
    userRole?: string;
}



export const isAdmin = (req: AdminRequest, res: Response, next: NextFunction): any => {
    // Grabs the header to take the token to verify
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({
            message: "Unauthorized. No token provided"
        })
    }

    // Split the string to get the token
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string || "summayh_dev_secret_key_0627"
        ) as { userId: string; role: string; };

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
