import { proxyFetchServer } from "@/lib/proxy-fetch";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface AgentDecision {
  id: string;
  agentName: string;
  entityType: string;
  entityId?: string | null;
  decision: string;
  confidenceScore?: number;
  confidence?: number;
  reason?: string;
  createdAt?: string;
}

export default async function AgentDecisionsPage() {
  const res = await proxyFetchServer("/api/admin/agent-decisions");

  // Handle array responses and nested pagination payloads safely
  const decisionsList: AgentDecision[] = Array.isArray(res) 
    ? res 
    : (res?.data || res?.decisions || []);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl gap-4 p-4 md:p-6 mx-auto overflow-hidden">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-accent text-accent-foreground border border-border">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Agent Audit Logs
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time decision tracking and confidence metrics for autonomous system agents.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
            <Layers className="w-3.5 h-3.5" />
            {decisionsList.length} Total Logs
          </span>
        </div>
      </header>

      {/* Main Table Container - Fills remaining height cleanly without outer scroll */}
      <div className="flex-1 min-h-0 w-full rounded-lg border border-border bg-card overflow-hidden flex flex-col shadow-sm">
        {decisionsList.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <div className="p-3 rounded-full bg-muted/50 border border-border mb-3 text-muted-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No Agent Decisions Recorded</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Autonomous agents haven't executed any actions yet. Logged decisions will stream here automatically.
            </p>
          </div>
        ) : (
          /* Table Wrapper - Handles inner scrolling strictly */
          <div className="flex-1 min-h-0 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              {/* Sticky Header */}
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b border-border z-10">
                <tr>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Agent</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Target Entity</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Decision</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Confidence</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Timestamp</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-border/60">
                {decisionsList.map((d) => {
                  const score = d.confidenceScore ?? d.confidence ?? 0;
                  // Handle score scaling (0-1 vs 0-100)
                  const normalizedScore = score <= 1 ? Math.round(score * 100) : Math.round(score);

                  // Color indicators derived from confidence level
                  const isHighConfidence = normalizedScore >= 80;
                  const isMediumConfidence = normalizedScore >= 50 && normalizedScore < 80;

                  return (
                    <tr 
                      key={d.id} 
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Agent Column */}
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="truncate">{d.agentName}</span>
                        </div>
                      </td>

                      {/* Target Entity Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                          <span className="uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-foreground/80 border border-border/80">
                            {d.entityType || "SYSTEM"}
                          </span>
                          <span className="text-foreground/90">
                            #{d.entityId ? d.entityId.slice(0, 8) : "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Decision Badge Column */}
                      <td className="py-3.5 px-4">
                        <span 
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] border capitalize",
                            d.decision?.toLowerCase().includes("approve") || d.decision?.toLowerCase().includes("pass")
                              ? "bg-accent/50 text-foreground border-border"
                              : d.decision?.toLowerCase().includes("reject") || d.decision?.toLowerCase().includes("flag")
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {d.decision?.toLowerCase().includes("approve") ? (
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          ) : d.decision?.toLowerCase().includes("reject") ? (
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          ) : null}
                          {d.decision}
                        </span>
                      </td>

                      {/* Confidence Progress Bar Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[140px]">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden border border-border/50">
                            <div 
                              className={cn(
                                "h-full transition-all duration-300 rounded-full",
                                isHighConfidence 
                                  ? "bg-foreground" 
                                  : isMediumConfidence 
                                  ? "bg-muted-foreground" 
                                  : "bg-destructive"
                              )}
                              style={{ width: `${normalizedScore}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-foreground shrink-0 w-8 text-right">
                            {normalizedScore}%
                          </span>
                        </div>
                      </td>

                      {/* Timestamp Column */}
                      <td className="py-3.5 px-4 text-right text-muted-foreground">
                        <div className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>
                            {d.createdAt 
                              ? new Date(d.createdAt).toLocaleTimeString("en-NG", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Africa/Lagos",
                                })
                              : "Recent"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Stats Bar */}
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between shrink-0">
          <span>Showing latest recorded decisions</span>
          <span className="font-mono text-[11px]">Server Time: {new Date().toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" })}</span>
        </div>
      </div>
    </div>
  );
}