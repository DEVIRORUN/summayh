"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshAccessToken = exports.getMe = exports.loginUser = exports.registerUser = exports.checkEduEmail = void 0;
const prisma_1 = require("../utils/prisma");
const validators_1 = require("../validators");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// console.log("🔍 [TOP-LEVEL] Is prisma imported? ->", prisma);
const checkEduEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes("@")) {
            return res.status(400).json({
                message: "Email is required.",
            });
        }
        // Use validator here
        if (!(0, validators_1.isValidEduEmail)(email)) {
            return res.status(400).json({
                isValid: false,
                message: "Email is not a valid .edu.ng email. Not from an approved Nigerian university.",
            });
        }
        // Check if its existing in database
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                isValid: false,
                message: "This email is already registered.",
            });
        }
        return res.status(200).json({
            isValid: true,
            message: "Approved student email.",
        });
    }
    catch (error) {
        //
    }
};
exports.checkEduEmail = checkEduEmail;
const registerUser = async (req, res) => {
    console.log(new Date(), "-> [Sign Up]: Hit!");
    console.log(new Date(), "-> [Sign Up Debug] Payload received:", req.body); // <-- Add this
    try {
        const { email, password: passwordRaw, name, dateOfBirth, phoneNumber, } = req.body;
        // 1. Validate the .edu.ng domain in email
        if (!(0, validators_1.isValidEduEmail)(email)) {
            return res.status(400).json({
                error: "Invalid university email. Must the a supported .edu.ng domain.",
            });
        }
        // 2. Now we check if user exist in teh database
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phoneNumber }],
            },
        });
        if (existingUser) {
            return res.status(400).json({
                error: "Email or phone number already registered.",
            });
        }
        // 3. We Hash the password
        const saltRounds = 12;
        const password = await bcrypt_1.default.hash(passwordRaw, saltRounds);
        // 4. Create the user in the database(Postgres)
        const newUser = await prisma_1.prisma.user.create({
            data: {
                email,
                password,
                name,
                university: email.split("@")[1].split(".")[0].toUpperCase(),
                // dateOfBirth: new Date(dateOfBirth),
                phoneNumber,
                isPhoneVerified: false, // This would be verified later through an OTP process if they choose to buy/sell
            },
        });
        // 5. Fake Termii OTP trigger (I'll wire teh real API later)
        console.log(`[TERMII MOCK] Sending OTP to ${phoneNumber} for user ${email}... (This is a mock, no real OTP sent): ${newUser.id}`);
        const token = jsonwebtoken_1.default.sign({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            tokenVersion: newUser.tokenVersion,
        }, process.env.JWT_SECRET || "summayh_dev_secret_key_0627", { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log(new Date(), "-> [Sign Up]: Successful");
        // 6. Return success (NOT the pwsd hash)
        return res.status(201).json({
            message: "User registered successfully. OTP sent.",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                university: newUser.university,
                dateOfBirth: newUser.dateOfBirth,
                phoneNumber: newUser.phoneNumber,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res
            .status(500)
            .json({ message: "Internal server error during registration." });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    console.log(new Date(), "-> 🔥 loginUser ENTRY, body:", req.body);
    try {
        const { email, password } = req.body;
        // 1. Basic vallidation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }
        console.log(`email: ${email} before prisma call`);
        // 2. Find the user
        // console.log("🔍 [RUNTIME] Is prisma available here? ->", prisma);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }
        // 3. Verify the password
        console.log("user found:", user ? { id: user.id, hasPassword: !!user.password } : null);
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password. Please input a correct password.",
            });
        }
        // 4. Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion,
        }, process.env.JWT_SECRET || "summayh_dev_secret_key_0627", { expiresIn: "7d" });
        // Set the httpOnly cookie - so this is what protectRoute actually reads to validate
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // localhost:3000 <-> localhost:3001
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("Successfully logged In");
        // 5. Return success
        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                university: user.university,
                role: user.role,
                // isPro: user.is
            },
        });
    }
    catch (error) {
        console.error("Login error, something wrong with NETWORK bro", error);
        return res
            .status(500)
            .json({ message: "Internal server error during login." });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res) => {
    console.log("🔥 getMe HIT");
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized.",
            });
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                university: true,
                isPhoneVerified: true,
                createdAt: true,
                role: true,
                sellerProfile: {
                    select: {
                        isPro: true,
                        founderBadge: true,
                        proSource: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const { sellerProfile, ...rest } = user;
        console.log("getMe raw user:", user);
        console.log("Succesully logged in for `getMe`");
        return res.status(200).json({
            user: {
                ...user,
                isPro: sellerProfile ? sellerProfile.isPro : false,
                founderBadge: sellerProfile ? sellerProfile.founderBadge : false,
                proSource: sellerProfile ? sellerProfile.proSource : null,
            },
        });
    }
    catch (error) {
        console.error("GetMe error:", error);
        return res
            .status(500)
            .json({ message: "Internal server error during fetching user data." });
    }
};
exports.getMe = getMe;
const refreshAccessToken = async (req, res) => {
    try {
        // The token from the client from cookies or body for a refresh
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                message: "No token provided. Refresh token is required.",
            });
        }
        // Verify the current token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "summayh_dev_secret_key_0627");
        // Make sure user stil exists in database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized. User no longer exists.",
            });
        }
        // Issue a brand new token
        const newToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "summayh_dev_secret_key_0627", { expiresIn: "7d" });
        return res.status(200).json({
            message: " Token refreshed succesfully.",
            token: newToken,
        });
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again.",
        });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.status(200).json({
            message: "Logged out successfully.",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res
            .status(500)
            .json({ message: "Internal server error during logout." });
    }
};
exports.logoutUser = logoutUser;
