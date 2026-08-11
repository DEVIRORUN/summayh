export const dynamic = "force-dynamic";
import { getConversations } from "@/lib/message";
import { getCurrentUser } from "@/lib/auth";
import { ConversationList } from "@/components/theorems/ConversationList";


export default async function MessagesPage() {
    const [conversations, currentUser]  = await Promise.all([getConversations(), getCurrentUser()]);

    if (!currentUser) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Please log in to view your messages.</div>
    }

    return (
        <div className="flex flex-col h-[calc(100dvh-4rem)] max-w-3xl gap-4 w-full min-w-0 p-4 mx-auto overflow-hidden">
            <header className="shrink-0">
                <span className="text-2xl font-semibold">Messages</span>
            </header>

            <div className="flex-1 min-h-0 w-full overflow-hidden">
                <ConversationList conversations={conversations ?? []} currentUserId={currentUser.id} />
            </div>
        </div>
    )
}