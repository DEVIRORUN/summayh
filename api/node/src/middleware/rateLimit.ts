import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10,
    message: { message: "Too many login attempts. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min, same with Otp expiry
    max: 5,
    message: { message: "Too many OTP attempts. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
})