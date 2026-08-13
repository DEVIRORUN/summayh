export const dynamic = "force-dynamic";

// Components
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { BottomNavbar } from "@/components/bottom-navbar";
import { AppShell } from "@/components/app-shell";
import { getCategories } from "@/lib/categories";
import React from "react";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const categories = await getCategories();

    return (
        <div className="flex h-dvh w-full bg-background">
            <AppShell categories={categories} >
                {children}
            </AppShell>
        </div>
    )
}

