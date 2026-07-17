import { ReactNode } from "react";
import { Card } from "../ui/card";

interface AuthCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-sm p-6 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <span className="font-bold text-lg">SUMMAYH</span>
                    <p className="text-xl font-semibold">{title}</p>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>

                {children}

                {footer && (<div className="text-center text-sm text-muted-foreground">{footer}</div>)}
            </Card>
        </div>
    )
}