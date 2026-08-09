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
        return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    }

     if (!user) {
        return null;
    }

    
    const visibleNavItems = navItems.filter(
        (item) => !item.sellerOnly || user.role === "SELLER"
    );

    return (
        <div className="flex min-h-screen">
            <aside className="w-56 border-r shrink-0 flex flex-col">
                <div className="p-4 border-b">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {user.role === "SELLER" ? "Seller" : "Buyer"}
                        {user.isPro && <span className="ml-1 font-bold">Pro</span>}
                    </p>
                </div>
                <nav className="flex flex-col gap-1 p-2">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-sm text-sm",
                                    isActive 
                                        ? "bg-muted font-medium"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
            {children}
        </div>
    )
}
