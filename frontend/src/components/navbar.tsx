"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { Menu } from "lucide-react";
import Logo from "../../public/logo2.svg";
import Link from "next/link";
import { NotificationBell } from "@/components/axiom/NotificationBell";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { user, isLoading, logout } = useAuth();
    const { toggle } = useSidebar();
    const router = useRouter();

    async function handleLogout() {
        await logout();
        router.push("/login");
    }

    return (
        <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-3">
                <button onClick={toggle} className="lg:hidden" aria-label="Toggle menu">
                    <Menu className="cursor-pointer h-5 w-5"/>
                </button>
                <div className="flex flex-row gap-0 items-center">
                    <Logo width={25} height={25} className="text-foreground"/>
                    <h1 className="font-bold text-xl leading-tighter tracking-tighter">
                        SUMMAYH
                    </h1>
                </div>
            </div> 

            <div className="flex items-center gap-3">
                {isLoading ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                ) : user ? (
                    <>
                        {user.role !== "SELLER" && (
                            <Link
                                href="/onboarding/seller"
                                className="hidden sm:block text-sm font-medium hover:bg-foreground hover:text-background px-3 py-2 rounded-md transition-colors"
                            >
                            Become a seller</Link>
                        )}
                        <NotificationBell />
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
                                <button onClick={handleLogout} className="block w-full text-left rounded px-2 py-1.5 text-sm hover:bg-muted text-destructive">
                                    Log out
                                </button>
                            </PopoverContent>
                        </Popover>
                    </>
                ) : (
                    <Link href="/login" className="hover:bg-foreground hover:text-background px-4 py-3 rounded-md cursor-pointer text-sm font-medium duration-150">
                        Log in
                    </Link>
                )}
            </div>
        </header>
    )
}