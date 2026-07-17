import { CreditCard, Landmark, Trash2 } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";


interface PaymentMethod {
    id: string;
    type: "card" | "bank";
    label: string;
    isDefault?: boolean;
}

interface PaymentMethodsSectionProps {
    methods: PaymentMethod[];
    onAddNew: () => void;
    onSetDefault: (id: string) => void;
    onRemove: (id: string) => void;
}



export function PaymentMethodsSection({ methods, onAddNew, onSetDefault, onRemove } :PaymentMethodsSectionProps) {
    return (
        <div className="flex flex-col gap-3">
            {methods.map((m) => (
                <Card key={m.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                        {m.type === "card" ? <CreditCard className="w-4 h-4"/> : <Landmark className="w-4 h-4"/>}
                        <span className="text-sm">{m.label}</span>
                        {m.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <div className="flex gap-2">
                        {!m.isDefault && (
                            <Button size="sm" variant="ghost" onClick={() => onSetDefault(m.id)}>Set default</Button>
                        )}
                            <Button size="sm" variant="ghost" onClick={() => onRemove(m.id)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                    </div>
                </Card>
            ))}
            <Button variant="outline" onClick={() => onAddNew}>+ Add payment method</Button>
        </div>
    )   
}