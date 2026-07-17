import { Card } from "@/components/ui/card";
import { PriceTag } from "./PriceTag";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

interface EarningsSummaryCardProps {
    totalEarnings: number;
    completedOrders: number
    pendingClearance: number;
    chartData: { date: string; amount: number }[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { date: string; amount: number; } }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 border border-border px-2.5 py-1.5 rounded-lg shadpw-sm text-xs backdrop-blur-sm">
                <p className="text=[10px] text-muted-foreground uppercase tacking-wider font-medium">
                    {payload[0].payload.date}
                </p>
                <div className="mt-0 5 font-semibold">
                    <PriceTag price={payload[0].value} size="sm"/>
                </div>
            </div>
        );
    }
    return null;
}

export function EarningsSummaryCard({ totalEarnings, completedOrders, pendingClearance, chartData }: EarningsSummaryCardProps) {
    return (
        <Card className="p-4 m-4">
            <div className="flex gap-2 justify-between mb-4">
                <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <span className="font-bold text-sm">{completedOrders}</span>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <PriceTag price={totalEarnings} size="sm" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Pending Clearance</p>
                    <PriceTag price={pendingClearance} size="sm" />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="date" hide />
                {/* Tooltip */}
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#e4e4e7", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#1f1f1e" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#1f1f1e", fill: "#fff" }}
                />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    )
}