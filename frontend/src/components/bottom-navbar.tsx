"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { 
    Home,
    ShoppingBag,
    MessageSquare,
    Menu as MenuIcon,
    LayoutDashboard,
    Briefcase,
    Wallet
 } from "lucide-react";
 import {
    Drawer,
    DrawerContent,
    DrawerTrigger
 } from "@/components/ui/drawer"
 import { Button } from "@/components/ui/button";


const dashboardNavItems  = [
    { href:"/dashboard", label: "Overview", icon: LayoutDashboard, exact: true, sellerOnly: false },
    { href:"/dashboard/gigs", label: "Gigs", icon: Briefcase, sellerOnly: true },
    { href:"/dashboard/orders", label: "Orders", icon: ShoppingBag, sellerOnly: false },
    { href:"/dashboard/earnings", label: "Earnings", icon: Wallet, sellerOnly: true },
    { href:"/dashboard/messages", label: "Messages", icon: MessageSquare, sellerOnly: false },
]

const bottomTabs = [
    { href: "/", label: 'Home', icon: Home, exact: true },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, exact: false },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, exact: false },
]

export function BottomNavbar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!user) return null;

    const visibleMenuItems = dashboardNavItems.filter(
        (item) => !item.sellerOnly || user.role === "SELLER"
    );


    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-border bg-background h-14">
            {bottomTabs.map((tab) => {
                const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                const Icon = tab.icon;
                return (
                    <Link
                        href={tab.href}
                        key={tab.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px]",
                            isActive ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                    </Link>
                )
            })}

            <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
                <DrawerTrigger asChild>
                    <Button className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] text-muted-foreground">
                        <MenuIcon className="w-5 h-5" />
                        Menu
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="p-4 flex flex-col gap-1">
                        <p className="text-sm font-semibold px-2 pb-2">{user.name}</p>
                        {visibleMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm hover:bg-muted"
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                        <Link
                            href="/settings"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm hover:bg-muted"
                        >
                            Settings
                        </Link>
                    </div>
                </DrawerContent>
            </Drawer>
        </nav>
    )
}