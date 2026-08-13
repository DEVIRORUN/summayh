"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { BottomNavbar } from "@/components/bottom-navbar";
import type { CategoryNode } from "@/types/category"
import React from "react";

export function AppShell({
    categories,
    children,
}: {
    categories: CategoryNode[],
    children: React.ReactNode
}) {
    const pathname  = usePathname();
    const hideCatgorySidebar = pathname.startsWith("/dashboard");

    return (
        <div className="flex flex-col h-dvh w-full bg-background">
            <Navbar />
            <div className="flex flex-1 min-w-0 min-h-0">
                {!hideCatgorySidebar && <Sidebar categories={categories} />}
                <main className="flex-1 min-w-0 min-h-0 overflow-y-auto pb-14 md:pb-0">
                    {children}
                </main>
                <BottomNavbar />
            </div>
        </div>
    )
}