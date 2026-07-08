import { Response, Request } from "express";
import jwt from "jsonwebtoken";


// Define admin
export interface IsAdmin extends Request {
    adminId?: string
}



export const isAdmin = (req: IsAdmin, res: Response): any => {
    //

    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({
            message: "Unauthorized. No token provided"
        })
    }

    const token = authHeader.split(" ")[1];

    // I'll leave this for now, i don't know how i'll check for role maybe i'll use prisma or is it from JWT directly??
}