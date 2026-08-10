"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const isAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized. No token provided."
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Might wanna check is admin was banned by SUPIEROR ADMIN
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true }
        });
        if (!user || user.isBanned || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(403).json({
                message: "Acces denied. you have been blocked by SUPERIOR ADMIN"
            });
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
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
    }
    // I'll leave this for now, i don't know how i'll check for role maybe i'll use prisma or is it from JWT directly??
};
exports.isAdmin = isAdmin;
