export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getCategories } from "@/lib/categories";
import { AuthGate } from "@/components/auth-gate";

import React from "react";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const categories = await getCategories();

    return (
        <div className="flex h-dvh w-full bg-background">
            <AppShell categories={categories} >
                <AuthGate>{children}</AuthGate>
                {/* {children} */}
            </AppShell>
        </div>
    )
}

