"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMaterialController = void 0;
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
const sessionMaterial_service_1 = require("../services/sessionMaterial.service");
class SessionMaterialController {
    static async generateUploadUrl(req, res) {
        try {
            const userId = req.userId;
            const { callSessionId } = req.params;
            const { fileType, fileName } = req.body ?? {};
            console.log("upload-url body received:", req.body);
            if (!fileType || !fileName) {
                console.log("Upload URL request body:", req.body);
                return res.status(400).json({ message: "fileType and fileName are required" });
            }
            const { uploadUrl, publicUrl } = await sessionMaterial_service_1.SessionMaterialService.generateUploadUrl(callSessionId, userId, fileType, fileName);
            return res.status(200).json({
                message: "Sucessfully generated URL",
                data: { uploadUrl, publicUrl }
            });
        }
        catch (err) {
            if (err.message === "only images and pdf are supported.") {
                return res.status(400).json({ message: err.message });
            }
            // if assertParticipant throws something distinguishable, handle similarly
            console.error("ERROR generating session material upload URL:", err);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async saveMaterial(req, res) {
        try {
            const userId = req.userId;
            const { callSessionId } = req.params;
            const { fileUrl, fileName, fileType } = req.body;
            if (!fileUrl || !fileName || !fileType) {
                return res.status(400).json({ message: "fileUrl and fileName are required" });
            }
            const result = await sessionMaterial_service_1.SessionMaterialService.saveMaterial(callSessionId, userId, fileUrl, fileName, fileType);
            return res.status(200).json({
                message: "Sucessfully savved Material",
                data: result
            });
        }
        catch (error) {
            console.error("ERROR saving session material:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async listMaterial(req, res) {
        try {
            const userId = req.userId;
            const { callSessionId } = req.params;
            const results = await sessionMaterial_service_1.SessionMaterialService.listMaterial(callSessionId, userId);
            return res.status(200).json({
                message: "Sucessfully fetched Material(s)",
                data: results
            });
        }
        catch (error) {
            console.error("ERROR fetching Material:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}
exports.SessionMaterialController = SessionMaterialController;
