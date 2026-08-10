"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
const delivery_service_1 = require("../services/delivery.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class DeliveryController {
    static async getUploadUrl(req, res) {
        try {
            console.log("[GET UPLOAD URL]: GOT TO CONTROLLER");
            const sellerId = req.sellerId;
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
            const result = await delivery_service_1.DeliveryService.getUploadUrl(orderId, sellerId, fileName, contentType);
            console.log("[GET UPLOAD URL]: SUCCESSFULL", result);
            return res.status(200).json({
                message: "Upload URL generated",
                data: result
            });
        }
        catch (error) {
            console.log("[ERROR GETTING UPLAOD URL]", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Soemthign went wrong trying to get upload url" });
        }
    }
    static async submitDelivery(req, res) {
        try {
            const sellerId = req.sellerId;
            const { orderId } = req.params;
            const { message, files } = req.body;
            if (!files || !Array.isArray(files) || files.length === 0) {
                return res.status(400).json({ message: "At least one file is required." });
            }
            const result = await delivery_service_1.DeliveryService.submitDelivery(orderId, sellerId, message, files);
            return res.status(200).json({
                message: "Delivery submitted",
                data: result
            });
        }
        catch (error) {
            console.log("[ERROR SUBMITTING DELIVERY]", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Soemthign went wrong trying tosubmit delivery" });
        }
    }
    static async getDownloadUrl(req, res) {
        try {
            console.log("[DOWNLOAD-URL]: Hit!!!");
            const userId = req.userId;
            const { fileId } = req.params;
            if (!fileId) {
                return res.status(400).json({ message: "fileId is required." });
            }
            const result = await delivery_service_1.DeliveryService.getDownloadUrl(fileId, userId);
            console.log("[DOWNLOAD-URL]: Succesful!!!");
            return res.status(200).json({
                message: "Download URL generated",
                data: result,
            });
        }
        catch (error) {
            console.log("[ERROR GETTING DOWNLOAD URL]", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Soemthign went wrong trying to get downlaod url" });
        }
    }
}
exports.DeliveryController = DeliveryController;
