"use client"

import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";


export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="cream"
            storageKey="theme" // 👈 Forces next-themes to explicitly save to localStorage under this key
            themes={["cream", "slate", "dark"]}
            enableSystem={false}
            disableTransitionOnChange
            >
            <AuthProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}