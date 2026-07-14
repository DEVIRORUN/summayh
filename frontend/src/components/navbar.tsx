"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Menu } from "lucide-react";
import Link from "next/link";

export function Navbar() {
    const { user, isLoading } = useAuth();
    const { toggle } = useSidebar();

    return (
        <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-3">
                <button onClick={toggle} className="md:hidden" aria-label="Toggle menu">
                    <Menu className="h-5 w-5"/>
                </button>
            </div>

            <div className="flex items-center-gap-3">
                {isLoading ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                ) : user ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-2 rounded-full">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                                    {user.name?.[0] ?? "?"}
                                </div>
                                {user.isPro && <Badge variant="secondary">Pro</Badge>}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1">
                            <Link href="/dashboard" className="block rounded px-2 py-1.5 text-sm hover:bg-muted">
                                Dashboard
                            </Link>
                            <Link href="/settings" className="block rounded px-2 py-1.5 text-sm hover:bg-muted">
                                Settings
                            </Link>
                            <button className="block w-full text-left rounded px-2 py-1.5 text-sm hover:bg-muted text-destructive">
                                Log out
                            </button>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Link href="/login" className="text-sm font-medium">
                        Log in
                    </Link>
                )}
            </div>
        </header>
    )
}