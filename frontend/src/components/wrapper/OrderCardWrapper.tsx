// page.tsx
"use client";

import { SellerLevel } from "../axiom/SellerMiniRow";
import { OrderCard } from "../theorems/OrderCard";

// mockOrders.ts
export interface MockOrder {
  id: string;
  gigTitle: string;
  gigThumbnail: string;
  price: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  deadline: string;
  counterpart: {
    name: string;
    avatar: string;
    isOnline: boolean;
    level?: SellerLevel;
  };
}

const mockOrders: MockOrder[] = [
  {
    id: "ord-001",
    gigTitle: "I will design a modern minimalist logo for your tech startup",
    gigThumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-1.jpg",
    price: 15000,
    status: "in-progress",
    deadline: "Due in 2 days",
    counterpart: {
      name: "Alex Rivera",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171746.png",
      isOnline: true,
      level: "dreadnought",
    },
  },
  {
    id: "ord-002",
    gigTitle: "I will create a professional 3D animated intro video",
    gigThumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-2.jpg",
    price: 45000,
    status: "pending",
    deadline: "Starts when requirements submitted",
    counterpart: {
      name: "Sarah Chen",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171802.png",
      isOnline: false,
      level: "cataclysm",
    },
  },
  {
    id: "ord-003",
    gigTitle: "I will write SEO optimized blog posts for your business website",
    gigThumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg",
    price: 7500,
    status: "completed",
    deadline: "Delivered 3 hours ago",
    counterpart: {
      name: "David K.",
      avatar: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-07-15%20171814.png",
      isOnline: true,
      level: "apex"
    },
  },
];


export default function OrdersPage() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      {mockOrders.map((order) => (
        <OrderCard
          id={order.id}
          key={order.id}
          gigTitle={order.gigTitle}
          gigThumbnail={order.gigThumbnail}
          price={order.price}
          status={order.status}
          deadline={order.deadline}
          counterpart={order.counterpart}
          link={`/orders/${order.id}`}
          onClick={() => console.log(`Clicked order: ${order.id}`)}
        />
      ))}
    </main>
  );
}
