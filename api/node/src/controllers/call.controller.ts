import { Request, Response } from "express";
import { handlePrismaError } from "../utils/prismaErrorHandler"
import { CallService } from "../services/call.service";

export class CallController {
    static async joinBookingSession(req: Request, res: Response): Promise<any> {
        try {
            console.log("[JOIN SESSION]: Hit!!!")
            const userId = (req as any).userId;
            const { bookingId } = req.params;

            const session = await CallService.joinSession(bookingId as string, userId);
            console.log("[JOIN SESSION]: SUCCESS!!!")
            return res.status(201).json(session)
        } catch (err: any) {
            console.log("[ERROR STARTING CALL]");
            if (err.message === "FORBIDDEN") {
                return res.status(403).json({ error: "Not a participant in this booking" })
            }
            if (err.message === "TOO_EARLY") {
                return res.status(425).json({ error: "It's too early to join this session" })
            }
            if (err.message === "TOO_LATE") {
                return res.status(410).json({ error: "This session has already ended" })
            }
            if (handlePrismaError(err, res)) return;
            return res.status(500).json({ message: "Can't start Call Session" })
        }
    }
    static async getBookingDetails(req: Request, res: Response): Promise<any> {
        try {
            console.log("[GET BOOKING DATA]: Hit!!!")
            const userId = (req as any).userId;
            const { bookingId } = req.params;

            const details = await CallService.getBookingDetails(bookingId as string, userId);

            console.log("[GET BOOKING DATA]: Successful!!!")
            return res.status(200).json(details)
        } catch (err: any) {
            console.error("[ERROR GETTING BOOKING DETAILS]");
            
            if (err.message === "FORBIDDEN") {
                return res.status(403).json({ message: "You do not have access to this booking." });
            }
            if (err.message === "Booking Session not found!") {
                return res.status(404).json({ message: err.message });
            }

            if (handlePrismaError(err, res)) return;
            return res.status(500).json({ message: "Can't start Call Session" })
        }
    }
}