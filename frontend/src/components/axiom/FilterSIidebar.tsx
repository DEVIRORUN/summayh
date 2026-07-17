import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionTrigger, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface FilterConfig {
    id: string;
    label: string;
    type: "checkbox" | "radio" | "slider";
    options?: { label: string; value: string }[];
    range?: [number, number]
}

interface FilterSidebarProps {
    filters: FilterConfig[];
    values: Record<string, any>;
    onChange: (filterId: string, value: any) => void;
}


export function FilterSidebar({ filters, values, onChange }: FilterSidebarProps) {
    return (
        <Accordion type="multiple" className="w-full">
            {filters.map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger>{f.label}</AccordionTrigger>
                    <AccordionContent>
                        {f.type === "checkbox" && f.options?.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 py-1 text-sm">
                                <Checkbox
                                    checked={values[f.id]?.includes(opt.value)}
                                    onCheckedChange={(checked) => {
                                        const current = values[f.id] || [];
                                        onChange(f.id, checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value))
                                    }}
                                />
                                {opt.label}
                            </label>
                        ))}
                        {f.type === "radio" && (
                            <RadioGroup value={values[f.id]} onValueChange={(v) => onChange(f.id, v)}>
                                {f.options?.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 py-1 text-sm">
                                        <RadioGroupItem value={opt.value}/>
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </RadioGroup>
                        )}
                        {f.type === "slider" && f.range && (
                            <div className="flex flex-col gap-2 pt-2 px-2 pb-1">
                                <Slider
                                    min={f.range[0]}
                                    // className=""
                                    max={f.range[1]}
                                    value={values[f.id] || f.range}
                                    onValueChange={(v) => onChange(f.id, v)}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>${(values[f.id] as number[])?.[0] ?? f.range[0]}</span>
                                    <span>${(values[f.id] as number[])?.[1] ?? f.range[1]}</span>
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}