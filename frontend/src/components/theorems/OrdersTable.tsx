import { Table, TableHeader,  TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { PriceTag } from "../axiom/PriceTag";
import { Badge } from "@/components/ui/badge";
import { type OrderStatus, statusStyles } from "./OrderCard";

interface OrderRow {
  id: string;
  gigTitle: string;
  counterpartName: string;
  price: number;
  status: OrderStatus;
  date: string;
}

interface OrdersTableProps {
  orders: OrderRow[];
  onRowClick?: (id: string) => void;
}

export function OrdersTable({ orders, onRowClick }: OrdersTableProps) {
  return (
    <Table className="
        sticky top-0 z-50 w-full p-4
      /* 1. Transparent background layer */
      bg-background/70 
      /* 2. Frosted glass blurring effect behind it */
      backdrop-blur-md 
      /* 3. Subtle outer boundaries and elevation shadow */
      border-b border-border shadow-sm 
    ">
      <TableHeader>
        <TableRow>
          <TableHead>Gig</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id} onClick={() => onRowClick?.(o.id)} className="cursor-pointer">
            <TableCell className="max-w-[200px] truncate">{o.gigTitle}</TableCell>
            <TableCell>{o.counterpartName}</TableCell>
            <TableCell><PriceTag price={o.price} size="sm"/></TableCell>
            <TableCell><Badge className={statusStyles[o.status]}>{o.status}</Badge></TableCell>
            <TableCell className="text-[13px]">{o.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}