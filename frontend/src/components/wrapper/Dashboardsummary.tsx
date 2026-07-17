"use client"; // Required since Recharts uses client-side rendering APIs

import { EarningsSummaryCard } from "../axiom/EarningsSummaryCard"; 

// Mock data representing earnings over a 7-day period
const mockChartData = [
  { date: "Mon", amount: 2000 },
  { date: "Tue", amount: 5000 },
  { date: "Wed", amount: 4500 },
  { date: "Thu", amount: 9000 },
  { date: "Fri", amount: 12000 },
  { date: "Sat", amount: 11000 },
  { date: "Sun", amount: 15000 },
];

export function EarningsSummary() {
  return (
    <EarningsSummaryCard
      totalEarnings={15000}
      completedOrders={12}
      pendingClearance={4500}
      chartData={mockChartData}
    />
  );
}