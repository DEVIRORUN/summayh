"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useSidebar } from "@/contexts/sidebar-context";
import Link from "next/link"


interface Category {
    id: string;
    name: string;
    slug: string;
}



function SidebarLinks({ categories }: { categories: Category[] }) {
    return (
        <nav className="flex flex-col gap-1 p-4">
            {categories.map((cat) => (
                <Link
                    key={cat.id}
                        href={`/gigs?category=${cat.slug}`}
                        className="rounded-md px-3 py-2 text-sm hover:bg-muted"
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
        <aside className="hidden md:block w-60 shrink-0 border-r bg-background">
            <SidebarLinks categories={categories} />
        </aside>
        {/* Mobile/tabet: slider*/}
        <Drawer open={isOpen} onOpenChange={(open) => !open && close()} direction="left">
            <DrawerContent className="h-full w-72 md:hidden">
                <SidebarLinks categories={categories} />
            </DrawerContent>
        </Drawer>
        </>
    )
}