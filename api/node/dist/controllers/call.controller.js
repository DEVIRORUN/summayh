"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallController = void 0;
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
const call_service_1 = require("../services/call.service");
class CallController {
    static async joinBookingSession(req, res) {
        try {
            console.log("[JOIN SESSION]: Hit!!!");
            const userId = req.userId;
            const { bookingId } = req.params;
            const session = await call_service_1.CallService.joinSession(bookingId, userId);
            console.log("[JOIN SESSION]: SUCCESS!!!");
            return res.status(201).json(session);
        }
        catch (err) {
            console.log("[ERROR STARTING CALL]");
            if (err.message === "FORBIDDEN") {
                return res.status(403).json({ error: "Not a participant in this booking" });
            }
            if (err.message === "TOO_EARLY") {
                return res.status(425).json({ error: "It's too early to join this session" });
            }
            if (err.message === "TOO_LATE") {
                return res.status(410).json({ error: "This session has already ended" });
            }
            if ((0, prismaErrorHandler_1.handlePrismaError)(err, res))
                return;
            return res.status(500).json({ message: "Can't start Call Session" });
        }
    }
    static async getBookingDetails(req, res) {
        try {
            console.log("[GET BOOKING DATA]: Hit!!!");
            const userId = req.userId;
            const { bookingId } = req.params;
            const details = await call_service_1.CallService.getBookingDetails(bookingId, userId);
            console.log("[GET BOOKING DATA]: Successful!!!");
            return res.status(200).json(details);
        }
        catch (err) {
            console.error("[ERROR GETTING BOOKING DETAILS]");
            if (err.message === "FORBIDDEN") {
                return res.status(403).json({ message: "You do not have access to this booking." });
            }
            if (err.message === "Booking Session not found!") {
                return res.status(404).json({ message: err.message });
            }
            if ((0, prismaErrorHandler_1.handlePrismaError)(err, res))
                return;
            return res.status(500).json({ message: "Can't start Call Session" });
        }
    }
}
exports.CallController = CallController;
