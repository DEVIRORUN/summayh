"use client";

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Briefcase,
    ShoppingBag,
    Wallet,
    MessageSquare,
} from "lucide-react"

const navItems = [
    { href:"/dashboard", label: "Overview", icon: LayoutDashboard, exact: true, sellerOnly: false },
    { href:"/dashboard/gigs", label: "Gigs", icon: Briefcase, sellerOnly: true },
    { href:"/dashboard/orders", label: "Orders", icon: ShoppingBag, sellerOnly: false },
    { href:"/dashboard/earnings", label: "Earnings", icon: Wallet, sellerOnly: true },
    { href:"/dashboard/messages", label: "Messages", icon: MessageSquare, sellerOnly: false },
]


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router])

    if (isLoading) {
        return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading dashboard...</div>
    }

     if (!user) {
        return null;
    }

    const visibleNavItems = navItems.filter(
        (item) => !item.sellerOnly || user.role === "SELLER"
    );

    return (
        <div className="flex h-dvh w-full bg-background overflow-hidden">
            {/* Desktop Dashboard Sidebar */}
            <aside className="hidden md:flex w-56 border-r border-border shrink-0 flex-col bg-card h-full overflow-hidden">
                <div className="p-4 border-b border-border shrink-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                        {user.role === "SELLER" ? "Seller account" : "Buyer account"}
                        {user.isPro && <span className="ml-1 font-bold text-foreground">Pro</span>}
                    </p>
                </div>
                <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto min-h-0">
                    {visibleNavItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs transition-colors shrink-0",
                                    isActive 
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Dashboard Content Area */}
            <main className="flex-1 min-w-0 h-full overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
