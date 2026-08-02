import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "../axiom/PriceTag";
import { SellerMiniRow, type SellerLevel } from "../axiom/SellerMiniRow";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";


export type OrderStatus = "pending" | "in-progress" | "delivered" | "completed" | "disputed" | "cancelled";

interface OrderCardProps {
    id: string;
    gigTitle: string;
    gigThumbnail: string;
    price: number;
    status: OrderStatus;
    deadline: string;
    counterpart: { avatar: string; name: string; isOnline: boolean; level?: SellerLevel }
    link: string;
    onClick?: () => void;
}

export const statusStyles: Record<OrderStatus, string> = {
    pending: "bg-slate-100 text-slate-700",
    "in-progress": "bg-blue-100 text-blue-700",
    delivered: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    disputed: "bg-red-100 text-red-700",
    cancelled: "bg-muted text-muted-foreground",
}


export function OrderCard({ gigTitle, gigThumbnail, price, status, deadline, counterpart, link, onClick }: OrderCardProps ) {
    return (
        <Link href={link}>
            <Card onClick={onClick} className="flex gap-3 p-3 cursor-pointer hover:bg-muted/40">
                <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden">
                    <Image src={gigThumbnail} alt={gigTitle} fill sizes="80px" className="object-cover" />
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{gigTitle}</div>
                    <SellerMiniRow {...counterpart} compact={false} />
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground">{deadline}</span>
                        <PriceTag price={price} size="sm" />
                    </div>
                </div>

                <Badge className={cn("h-fit shrink-0", statusStyles[status])}>{status}</Badge>
            </Card>
        </Link>
    )
}