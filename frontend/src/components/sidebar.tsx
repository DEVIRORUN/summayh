"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSidebar } from "@/contexts/sidebar-context";
import { useState } from "react";
import { BookOpen, ChevronRight, Crown, LayoutDashboard, MessageSquare, ShieldCheck, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { CategoryNode } from "@/types/category";

function CategoryItem({
    category,
    onItemClick,
}: {
    category: CategoryNode;
    onItemClick?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = (category.children?.length ?? 0) > 0; 

    return (
        <div className="flex flex-col">
            <div className="flex items-center rounded-md hover:bg-muted transition-colors">
                <Link
                    href={`/gig?category=${category.slug}`}
                    onClick={onItemClick}
                    className="flex-1 px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
                >
                    {category.name}
                </Link>
                {hasChildren && (
                    <Button
                        onClick={() => setIsOpen((o) => !o)}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        className="bg-unset hover:bg-unset cursor-pointer px-2 py-2 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight
                            className={cn(
                                "w-3.5 h-3.5 transition-transform",
                                isOpen && "rotate-90"
                            )}
                            />
                    </Button>
                )}
            </div>

            {hasChildren && isOpen && (
                <div className="ml-4 pl-3 border-l border-border flex flex-col gap-0.5 py-1">
                    {category.children?.map((sub) => (
                        <Link
                            key={sub.id}
                            href={`/gig?category=${sub.slug}`}
                            onClick={onItemClick}
                            className="rounded-md px-2 py-1.5 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
    const { user } = useAuth();

    const items = [
        { href: "/onboarding/seller", label: "Become a seller", icon: Store, show: user?.role !== "SELLER" },
        { href: "/founders", label: "Founders Pass", icon: Crown, show: true },
        { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, show: !!user },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !!user },
        { href: "/admin", label: "Admin", icon: ShieldCheck, show: user?.role === "ADMIN" },
    ];

    return (
        <nav className="flex flex-col gap-1 p-4 border-b border-border">
            {items.filter(item => item.show).map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onItemClick}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors">
                            <Icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                )
            })}
            <a
                href="https://docs.summayh.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onItemClick}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
                <BookOpen className="w-4 h-4 shrink-0" />
                Docs
            </a>
        </nav>
    )
}

function SidebarLinks({
    categories,
    onItemClick,
}: {
    categories: CategoryNode[];
    onItemClick?: () => void;
}) {
    return (
        <>
            <NavLinks onItemClick={onItemClick} />
            <nav className="flex flex-col gap-1 p-4">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Categories
                </p>
                {categories.map((cat) => (
                    <CategoryItem key={cat.id} category={cat} onItemClick={onItemClick}/>
                ))}
            </nav>
        </>
    )
}


export function Sidebar({ categories }: { categories: CategoryNode[] }) {
    const { isOpen, close } = useSidebar();

    return (
        <>
            <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-background h-full overflow-y-auto">
                <SidebarLinks categories={categories} />
            </aside>
            <Drawer open={isOpen} onOpenChange={(open) => !open && close()} direction="left">
                <DrawerContent className="h-full w-75 flex flex-col data-[vaul-drawer-direction=left]:rounded-r-xs">
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <SidebarLinks categories={categories} onItemClick={close}/>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    )
}