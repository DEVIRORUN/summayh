"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoundersPassController = void 0;
const foundersPass_service_1 = require("../services/foundersPass.service");
class FoundersPassController {
    static async initialize(req, res) {
        try {
            const sellerId = req.userId;
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required." });
            }
            const result = await foundersPass_service_1.FoundersPassService.initializeFoundersPassPayment(sellerId, email);
            return res.status(200).json({
                message: new Date() + "-> [FoundersPass Init Success]: Founder Pass initialized successfully",
                data: result
            });
        }
        catch (error) {
            console.error(new Date(), "-> [FoundersPass Init Error]:", error.message);
            return res.status(500).json({ message: error.message });
        }
    }
    static async availability(req, res) {
        try {
            console.log("[FOUNDERS PASS]: HIT!!!");
            const result = await foundersPass_service_1.FoundersPassService.getFoundersPassAvailability();
            console.log("[FOUNDERS PASS]: SUCCESFULL!!!");
            return res.status(200).json({
                message: new Date() + "-> [FoundersPass Availability  Success]: Check Successful",
                data: result
            });
        }
        catch (error) {
            console.error(new Date(), "-> [FoundersPass Availability Error]:", error.message);
            return res.status(500).json({ message: "Failed to fetch availability." });
        }
    }
}
exports.FoundersPassController = FoundersPassController;
