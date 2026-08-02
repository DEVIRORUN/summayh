import { cookies } from "next/headers";

export interface ConversationListItem {
    id: string;
    userAId: string;
    userBId: string;
    lastMessageAt: string | null;
    userA: { id: string; name: string; avatar: string | null };
    userB: { id: string; name: string; avatar: string | null };
    messages: { id: string; content: string; senderId: string; seenAt: string | null; createdAt: string }[];
}

export async function getConversations(): Promise<ConversationListItem[] | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/messages/conversations`, {
            cache: "no-store",
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`)
            return null;
        }

        const json = await res.json();
        return json.data;
    } catch (err) {
        console.error('Fetch err', err);
        return null;
    }
}