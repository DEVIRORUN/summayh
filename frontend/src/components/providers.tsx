"use client"

import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ReactNode } from "react";


export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </AuthProvider>
    )
}