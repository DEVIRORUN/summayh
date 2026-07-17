import { ReactNode } from "react";
import { Button } from "@/components/ui/button";


interface StateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: { 
        label: string; 
        onClick: () => void 
    };
}


export function EmptyState({ icon, title, description, action }: StateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="text-muted-foreground mb-4">{icon}</div>

            <div className="text-base font-semibold">{title}</div>

            {description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
            )}

            {action && (
                <Button onClick={action.onClick} className="mt-6" size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    )
}