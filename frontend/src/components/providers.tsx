"use client"

import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";
import { ReactNode } from "react";
import { SocketProvider } from "@/contexts/socket-context";


export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="theme" // Forces next-themes to explicitly save to localStorage under this key
            themes={["light", "dark"]}
            enableSystem
            disableTransitionOnChange
            >
            <AuthProvider>
                <SocketProvider>
                    <SidebarProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </SidebarProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}