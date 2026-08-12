import { Response, Request } from "express";
import { AgentDecisionService } from "../services/agentDecision.service";

export class AgentDecisionController {
  static async list(req: Request, res: Response): Promise<any> {
    try {
      console.log("[AGENT DECISION]: HIT!!");
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const { agentName, entityType, dateForm, dateTo } = req.query;

      const result = await AgentDecisionService.listDecisions(page, limit, {
        agentName: agentName as string,
        entityType: entityType as string,
        dateForm: dateForm as string,
        dateTo: dateTo as string,
      });

      console.log("[AGENT DECISION]: SUCCESS!!");
      return res.status(200).json(result);
    } catch (error: any) {
      console.error(
        new Date(),
        "-> [AgentDecision List Error]: ",
        error.message,
      );
      return res
        .status(500)
        .json({ message: "Failed to fetch agent decisions." });
    }
  }
  static async stats(req: Request, res: Response) {
    try {
      const result = await AgentDecisionService.getStats();
      return res.status(200).json(result);
    } catch (error: any) {
      console.error(
        new Date(),
        "-> [AgentDecision Stats Error]:",
        error.message,
      );
      return res.status(500).json({ message: "Failed to fetch agent stats." });
    }
  }
}
