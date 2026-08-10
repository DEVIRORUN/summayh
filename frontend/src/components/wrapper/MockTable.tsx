// components/MockOrders.tsx
"use client";

import { OrdersTable } from "@/components/theorems/OrdersTable"; 
import { type OrderStatus } from "@/components/theorems/OrderCard"; // Adjust this import path as well

// 1. Static mock data representing different statuses
const MOCK_ORDERS = [
  {
    id: "ord-1",
    gigTitle: "UI/UX Design for SaaS Dashboard",
    counterpartName: "Alice Vance",
    price: 450,
    status: "completed" as OrderStatus,
    date: "2026-07-12",
  },
  {
    id: "ord-2",
    gigTitle: "Next.js API Integration & Optimization",
    counterpartName: "Devon Lane",
    price: 1200,
    status: "in_progress" as OrderStatus, // Using common order status types
    date: "2026-07-14",
  },
  {
    id: "ord-3",
    gigTitle: "Logo Design and Brand Guidelines (Premium Package)",
    counterpartName: "Kristin Watson",
    price: 250,
    status: "pending" as OrderStatus,
    date: "2026-07-15",
  },
];

export default function MockOrders() {
  const handleRowClick = (id: string) => {
    alert(`You clicked Row ID: ${id}`);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <p className="text-xs text-muted-foreground">Click any row to trigger an action.</p>
      </div>
      <OrdersTable orders={MOCK_ORDERS} onRowClick={handleRowClick} />
    </div>
  );
}