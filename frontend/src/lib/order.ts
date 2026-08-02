import { cookies } from "next/headers";

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  requirementsSubmittedAt: string;
  gig: {
    id: string;
    title: string;
    price?: string;
  };
  buyer: { name?: string; avatar?: string; id: string; }
  seller: { user: { name: string; id: string }, avatar: string; isOnline: boolean; };
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