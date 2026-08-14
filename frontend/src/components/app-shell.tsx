"use client";

import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { BottomNavbar } from "@/components/bottom-navbar";
import type { CategoryNode } from "@/types/category"
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";


const EXEMPT_PATHS = ["/verify-email", "login", "singup"]

export function AppShell({
    categories,
    children,
}: {
    categories: CategoryNode[],
    children: React.ReactNode
}) {
    const pathname  = usePathname();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const hideCategorySidebar = pathname.startsWith("/dashboard");

    // useEffect(() => {
    //     if (isLoading) return;
    //     if (!user) return;
    //     if (EXEMPT_PATHS.some((p) => pathname.startsWith(p))) return;

    //     if (!user.isEmailVerified) {
    //         router.push("verify-email")
    //     }
    // }, [isLoading, user, pathname, router])

    return (
        <div className="flex flex-col h-dvh w-full bg-background">
            <Navbar />
            <div className="flex flex-1 min-w-0 min-h-0">
                {!hideCategorySidebar && <Sidebar categories={categories} />}
                <main className="flex-1 min-w-0 min-h-0 overflow-y-auto pb-14 md:pb-0">
                    {children}
                </main>
                <BottomNavbar />
            </div>
        </div>
    )
}