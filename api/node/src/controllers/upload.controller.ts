import { Request, Response } from "express";
import { UploadService } from "../services/upload.service"
import { isValidPolicyKey } from "../utils/policies";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class UploadController {
    static async getUploadUrl(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { policyKey, fileType } = req.body;

            if (!policyKey || !isValidPolicyKey(policyKey)) {
                return res.status(400).json({ message: "Invalid or missing policyKey" })
            }
            if (!fileType) {
                return res.status(400).json({ message: "fileType is required." })
            }

            const result = await UploadService.getUploadUrl(userId, policyKey, fileType);
            return res.status(200).json({ message: "Upload URL generated", data: result });
        } catch (error: any) {
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(400).json({ message: error.message || "Failed to generate UploadUrl" })
        }
    }
}