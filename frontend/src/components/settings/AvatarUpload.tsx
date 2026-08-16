"use client";

import { useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

export function AvatarUpload() {
    const { user, refetch } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setError(null);
        setUploading(true);
        try {
            // 1. Get presigned URL
            const res = await fetch("/api/avatar/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileType: file.type }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to get upload URL.");
            }
            const { data } = await res.json();
            const { uploadUrl, publicUrl } = data;

            // 2. PUT to R2
            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!putRes.ok) throw new Error("Upload to storage failed.");

            // 3. Save on user
            const saveRes = await fetch("/api/avatar/save", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: publicUrl }),
            });
            if (!saveRes.ok) throw new Error("Failed to save avatar.");

            await refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Avatar upload failed.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center text-lg font-medium">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                    user?.name?.[0] ?? "?"
                )}
            </div>

            <label
                className={cn(
                    "flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border cursor-pointer hover:bg-muted transition-colors",
                    uploading && "pointer-events-none opacity-60"
                )}
            >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Change photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleSelect} disabled={uploading} />
            </label>

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}