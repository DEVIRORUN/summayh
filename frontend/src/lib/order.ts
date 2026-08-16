import { cookies } from "next/headers";

interface DeliveryFile {
    id: string;
    fileName: string;
    fileSize: string;
}

interface Delivery {
    id: string;
    message: string | null;
    createdAt: string;
    files: DeliveryFile[];
}

interface Booking {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  requirementsSubmittedAt: string;
  orderDeliveries: Delivery[];
  gig: {
    id: string;
    title: string;
    coverImage?: string;
    deliveryMode: string;
  };
  sessionPackage?: {
    id: string;
    bookings: Booking[]
  }
  buyer: { name?: string; avatar?: string; id: string; }
  seller: { user: { name: string; id: string }, avatar: string; isOnline: boolean; };
  review?: { id: string; rating: number; commet: string } | null;
}

export interface OrderListItem {
  id: string;
  status: string;
  totalPrice: string;
  createdAt: string;
  gig: { title: string, coverImage: string };
  seller?: { name: string; avatar: string; isOnline: boolean; };
  buyer?: { name: string; avatar: string; isOnline: boolean; };
}

interface OrdersResponse {
    data: OrderListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getOrder(rawOrderId: string): Promise<Order | null> {
  const cleanOrderId = rawOrderId.replace(/^2F/i, "").replace(/^\//, "");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(
      `${process.env.NODE_API_URL}/api/orders/${cleanOrderId}`,
      {
        cache: "no-store",
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status}`);
      return null;
    }

    const body = await res.json();
    // console.log("RAW ORDER", body.data); // Debugging Order
    return body.data;
  } catch (err) {
    console.error("Fetch error: ", err);
    return null;
  }
}

export async function getBuyerOrders(page = 1, limit = 20): Promise<OrdersResponse | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/orders/buyer?page=${page}&limit=${limit}`, {
            cache: 'no-store',
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            return null;
        }

        const body = await res.json();
        console.log("DATA BUYER ORDERS:", body.data);
        return body.data;
    } catch (err) {
        console.error("Fetch error: ", err);
        return null;
    }
}

export async function getSellerOrders(page = 1, limit = 20): Promise<OrdersResponse | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/orders/seller?page=${page}&limit=${limit}`, {
            cache: 'no-store',
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            return null;
        }

        const body = await res.json();
        return body.data;
    } catch (err) {
        console.error("Fetch error: ", err);
        return null;
    }
}