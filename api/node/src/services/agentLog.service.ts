import { prisma } from "../utils/prisma";
import { AgentName } from "../../generated/prisma";

interface AgentLogRow {
  id: string;
  agentName: AgentName;
  entityId: string;
  entityType: string;
  decision: string;
  confidence?: string;
  reasoning?: string;
  createdAt: string;
} //  Use in FE

export class AgentlogService {
  static async getAllLogs(): Promise<any> {
    try {
      console.log(new Date(), "-> [GET MANY LOGs]: Hit!!!");

      const agent = await prisma.agentDecision.findMany({
        orderBy: { createdAt: "desc" }, // i dont know what to do here
        take: 50, // I don't mind this hard-coded
      });

      console.log(
        new Date(),
        "-> [GET MANY LOGs]: Succesfully return Many Log details!!!",
      );
      return agent;
    } catch (err: any) {
      throw err;
    }
  }
  static async getFilteredLogs(filters: {
    agentName?: string;
    entityType?: string;
    from?: string; // from req.params
    to?: string;
  }): Promise<any> {
    try {
      console.log(new Date(), "-> [GET FILTERED LOG]: Hit!!!");
      // we start the "where" empty
      const where: any = {};

      if (filters.agentName) {
        where.agentName = filters.agentName;
      }
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      if (filters.from || filters.to) {
        where.createdAt = {};
        if (filters.from) where.createdAt.gte = new Date(filters.from);
        if (filters.to) where.createdAt.lte = new Date(filters.to);
      }

      const logs = await prisma.agentDecision.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      console.log(
        new Date(),
        "-> [GET FILTERED LOG]: Succesfully return Filtered logs!!!",
      );
      return logs;
    } catch (err: any) {
      throw err;
    }
  }
  static async getSingleDetailedLog(logId: string): Promise<any> {
    try {
      console.log(new Date(), "-> [GET SINGLE LOG]: Hit!!!");
      const log = await prisma.agentDecision.findUnique({
        where: { id: logId },
      });
      if (!log) throw new Error("Log not found");

      console.log(
        new Date(),
        "-> [GET SINGLE LOG]: Succesfully return Log details!!!",
      );
      return log;
    } catch (err: any) {
      throw err;
    }
  }
}
