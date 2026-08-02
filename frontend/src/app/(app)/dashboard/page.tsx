"use client";

import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    }

     if (!user) {
        return (
        <div className="p-6 text-sm text-muted-foreground">
            Session expired. Please <a href="/login" className="underline">log in</a> again.
        </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
                {user.role === "SELLER" ? "Seller dashboard . " : "Buyer dashboard"}
                {user.isPro && <span className="font-bold">Pro</span>}
            </p>
        </div>
    )
}
