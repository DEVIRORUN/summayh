import { Request, Response } from "express";
import { DeliveryService } from "../services/delivery.service"; 
import { handlePrismaError } from "../utils/prismaErrorHandler";



export class DeliveryController {
    static async getUploadUrl(req: Request, res: Response): Promise<any> {
        try {
            console.log("[GET UPLOAD URL]: GOT TO CONTROLLER");
            const sellerId = (req as any).sellerId;

            if (!sellerId) {
                return res.status(403).json({ 
                    message: "Failed to verify seller status: User does not have an active seller profile." 
                });
            }

            const { orderId } = req.params;
            const { fileName, contentType } = req.body;

            if (!fileName || !contentType) {
                return res.status(400).json({ message: "fileType and slot are required." });
            }

            const result = await DeliveryService.getUploadUrl(orderId as string, sellerId, fileName, contentType);

            console.log("[GET UPLOAD URL]: SUCCESSFULL", result);
            return res.status(200).json({
                message: "Upload URL generated",
                data: result
            })
        } catch (error: any) {
            console.log("[ERROR GETTING UPLAOD URL]", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Soemthign went wrong trying to get upload url" })
        }
    }
    static async submitDelivery(req: Request, res: Response): Promise<any> {
        try {
            const sellerId = (req as any).sellerId;
            const { orderId } = req.params;
            const { message, files } = req.body;
            
            if (!files || !Array.isArray(files) || files.length === 0) {
                return res.status(400).json({ message: "At least one file is required." });
            }

            const result = await DeliveryService.submitDelivery(orderId as string, sellerId, message, files);

            return res.status(200).json({
                message: "Delivery submitted",
                data: result
            })
        } catch (error: any) {
            console.log("[ERROR SUBMITTING DELIVERY]", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Soemthign went wrong trying tosubmit delivery" })
        }
    }
    static async getDownloadUrl(req: Request, res: Response): Promise<any> {
        try {
            console.log("[DOWNLOAD-URL]: Hit!!!");
            const userId = (req as any).userId;
            const { fileId } = req.params;

            if (!fileId) {
                return res.status(400).json({ message: "fileId is required." })
            }

            const result = await DeliveryService.getDownloadUrl(fileId as string, userId);

            console.log("[DOWNLOAD-URL]: Succesful!!!");
            return res.status(200).json({
                message: "Download URL generated",
                data: result,
            })
        } catch (error: any) {
            console.log("[ERROR GETTING DOWNLOAD URL]", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Soemthign went wrong trying to get downlaod url" })
        }
    }
}