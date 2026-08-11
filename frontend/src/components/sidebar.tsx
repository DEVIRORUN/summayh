"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useSidebar } from "@/contexts/sidebar-context";
import Link from "next/link"


interface Category {
    id: string;
    name: string;
    slug: string;
}



function SidebarLinks({ 
    categories,
    onItemClick,
 }: { 
    categories: Category[];
    onItemClick?: () => void;
}) {
    return (
        <nav className="flex flex-col gap-1 p-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Categories
            </p>
            {categories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/gigs?category=${cat.slug}`}
                    onClick={onItemClick}
                    className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                >
                    {cat.name}
                </Link>
            ))}
        </nav>
    )
}


export function Sidebar({ categories }: { categories: Category[] }) {
    const { isOpen, close } = useSidebar();


    return (
        <>
        {/* Desktop: always in DOM by the side */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-background h-full overflow-y-auto">
            <SidebarLinks categories={categories} />
            <h2>Nothing to show</h2>
        </aside>
        {/* Mobile/tabet: slider*/}
        <Drawer open={isOpen} onOpenChange={(open) => !open && close()} direction="left">
            <DrawerContent className="h-full w-72">
                <SidebarLinks categories={categories} />
            </DrawerContent>
        </Drawer>
        </>
    )
}