import { cn } from "@/lib/utils";
import { ReactNode } from "react";


interface SettingsNavItem {
    id: string;
    label: string;
    icon: ReactNode;
}


interface SettingsSidebarNavProps {
    items: SettingsNavItem[];
    activeId: string;
    title: string;
    onSelect: (id: string) => void;
}



export function SettingsSidebarNav({ items, title, activeId, onSelect }: SettingsSidebarNavProps) {
    return (
        <nav className="flex flex-col gap-1">
            <p className="font-semibold text-2xl mb-1 tracking-tight">{title}</p>

            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-all",
                        activeId === item.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
                    )}
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </nav>
    )
}