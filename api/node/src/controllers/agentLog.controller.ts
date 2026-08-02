import { Response, Request, response } from "express";
import { AgentlogService } from "../services/agentLog.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";


export class AgentLogController {
    static async getAllLogs(req: Request, res: Response): Promise<any> {
        try {
            const logs = await AgentlogService.getAllLogs();

            return res.status(200).json({
                message:"Get all logs succesful",
                data: logs
            })
        } catch(error: any) {
            console.error("ERROR GETTING LOGS bro: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            // Fallback for really unexpected errors
            return res.status(500).json({ message: "Failed to get logs. Please try again." });
        }
    }
    static async getFilteredLogs(req: Request, res: Response): Promise<any> {
        try {
            const { agentName, entityType, from, to } = req.query;

            const logs = await AgentlogService.getFilteredLogs({
                agentName: agentName as string | undefined,
                entityType: entityType as string | undefined,
                from: from as string | undefined,
                to: to as string | undefined,
            });

            return res.status(200).json({
                message: "Get filtered logs successful",
                data: logs
            });
        } catch(error: any) {
            console.error("ERROR GETTING FILTERED LOGS bro: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get filtered logs. Please try again." });
        }
    }

    static async getSingleDetailedLog(req: Request, res: Response): Promise<any> {
        try {
            const { logId } = req.params;

            const log = await AgentlogService.getSingleDetailedLog(logId as string);

            return res.status(200).json({
                message: "Get single log successful",
                data: log
            });
        } catch(error: any) {
            console.error("ERROR GETTING SINGLE LOG bro: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get log. Please try again." });
        }
    }
}