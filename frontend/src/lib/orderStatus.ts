import { OrderStatus } from "@/components/theorems/OrderCard"

export const statusMap: Record<string, OrderStatus> = {
    PENDING: "pending",
    ACTIVE: "in-progress",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    DISPUTED: "disputed",
    CANCELLED: "pending",
}