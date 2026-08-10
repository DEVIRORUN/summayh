import { Request, response, Response } from "express";
import { prisma } from "../utils/prisma";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { SessionMaterialService } from "../services/sessionMaterial.service";


export class SessionMaterialController {
    static async generateUploadUrl(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { callSessionId } = req.params;
            const { fileType, fileName } = req.body ?? {};

            console.log("upload-url body received:", req.body);
            if (!fileType || !fileName) {
                console.log("Upload URL request body:", req.body);
                return res.status(400).json({ message: "fileType and fileName are required" })
            }

            const { uploadUrl, publicUrl } = await SessionMaterialService.generateUploadUrl(
                callSessionId as string,
                userId,
                fileType,
                fileName
            )

            return res.status(200).json({
                message: "Sucessfully generated URL",
                data: { uploadUrl, publicUrl }
            })
       } catch (err: any) {
            if (err.message === "only images and pdf are supported.") {
                return res.status(400).json({ message: err.message });
            }
            // if assertParticipant throws something distinguishable, handle similarly
            console.error("ERROR generating session material upload URL:", err);
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async saveMaterial(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { callSessionId } = req.params;
            const { fileUrl, fileName, fileType } = req.body;

            if (!fileUrl || !fileName || !fileType) {
                return res.status(400).json({ message: "fileUrl and fileName are required" })
            }

            const result = await SessionMaterialService.saveMaterial(
                callSessionId as string,
                userId,
                fileUrl,
                fileName,
                fileType,
            )

            return res.status(200).json({
                message: "Sucessfully savved Material",
                data: result
            })
        } catch (error) {
            console.error("ERROR saving session material:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async listMaterial(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { callSessionId } = req.params;
            const results = await SessionMaterialService.listMaterial(
                callSessionId as string, userId
            )

            return res.status(200).json({
                message: "Sucessfully fetched Material(s)",
                data: results
            })
        } catch (error) {
            console.error("ERROR fetching Material:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}
