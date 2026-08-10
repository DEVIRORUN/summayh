"use client"

import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";


export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="theme" // 👈 Forces next-themes to explicitly save to localStorage under this key
            themes={["light", "dark"]}
            enableSystem
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