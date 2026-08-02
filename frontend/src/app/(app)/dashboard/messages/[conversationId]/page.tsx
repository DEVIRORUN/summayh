import { getCurrentUser } from "@/lib/auth";
import { ChatSection } from "@/components/theorems/ChatSection";

export default async function MessageThreadPage({
    params,
} : {
    params: Promise<{ conversationId: string }>
}) {
    const { conversationId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Please log in to view this conversation.</div>
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="profile">
            </div> {/* I'll make this a component later */}
            <ChatSection 
                messagePage={true}
                conversationId={conversationId} 
                currentUserId={currentUser.id} />
        </div>
    )
}