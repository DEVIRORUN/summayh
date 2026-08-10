"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
// 2. the actual bouncer function
const protectRoute = async (req, res, next) => {
    // 1. Grab the token from cookies
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized. No token provided."
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 1. Fetch only the tokenVersion
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true, isBanned: true }
        });
        // 2. Check if user was deleted, banned or an admin bumped their token version before
        if (!user || user.isBanned || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(403).json({
                message: "Access denied. Your session has expired or this account has been suspended."
            });
        }
        // Attach the decoded userId to the request object
        req.userId = decoded.userId;
        req.tokenVersion = decoded.tokenVersion;
        // Send them to the next function (which will be getMe)
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
    }
};
exports.protectRoute = protectRoute;
