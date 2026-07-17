import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Represents the 10 Hunter Power Ranks.
 * Scales from "spark" (Rank 10) up to "apex" (Rank 1, S-Rank equivalent).
 */
export type SellerLevel = 
  | "spark"        // Rank 10: Newly awakened, raw, local threat clearance.
  | "vanguard"     // Rank 9:  Battle-hardened, frontline squad fighters.
  | "sentinel"     // Rank 8:  Elite defenders, regional district protectors.
  | "bastion"      // Rank 7:  High-tier professional, heavy regional assets.
  | "eclipse"      // Rank 6:  Power that begins to dwarf the natural order.
  | "dreadnought"  // Rank 5:  Walking siege engines, immense destructive output.
  | "paragon"      // Rank 4:  Peak human capability, world-class ceiling.
  | "cataclysm"    // Rank 3:  Disasters in human form, alters local climate up to 3000/imposiible to create  a Guild.
  | "sovereign"    // Rank 2:  Nation-level. Requires 50 to legally charter a Guild.
  | "apex";        // Rank 1:  S-Rank anomaly. Instantly qualified to found a Guild alone.
  // My Neq idea a guild is like a buyer can submit a request to a guild for  a oyutbe short on something and then with many ppl in specified areas from voice, to clipping to ediitng to colour grading, to hook script-writing balancg everything out for customer. also a new plug liek system where buyer plugs sellers liek node, and we automatically sequence teh works so befor fnial product this one does not need  aguild
  // I might chnage some of the name later those, also in db



const levelThemes: Record<SellerLevel, { label: string; textColor: string; dotColor: string; rank: number }> = {
  spark:       { label: "Spark",       textColor: "text-slate-400",    dotColor: "bg-slate-400",    rank: 10 },
  vanguard:    { label: "Vanguard",    textColor: "text-emerald-500",  dotColor: "bg-emerald-500",  rank: 9 },
  sentinel:    { label: "Sentinel",    textColor: "text-teal-500",     dotColor: "bg-teal-500",     rank: 8 },
  bastion:     { label: "Bastion",     textColor: "text-blue-500",     dotColor: "bg-blue-500",     rank: 7 },
  eclipse:     { label: "Eclipse",     textColor: "text-indigo-500",   dotColor: "bg-indigo-500",   rank: 6 },
  dreadnought: { label: "Dreadnought", textColor: "text-purple-500",   dotColor: "bg-purple-500",   rank: 5 },
  paragon:     { label: "Paragon",     textColor: "text-fuchsia-500",  dotColor: "bg-fuchsia-500",  rank: 4 },
  cataclysm:   { label: "Cataclysm",   textColor: "text-rose-500",     dotColor: "bg-rose-500",     rank: 3 },
  sovereign:   { label: "Sovereign",   textColor: "text-amber-500",    dotColor: "bg-amber-500",    rank: 2 },
  apex:        { label: "Apex",        textColor: "text-yellow-400",   dotColor: "bg-yellow-400",   rank: 1 },
};


interface SellerMiniRowProps {
    avatar: string
    name: string
    isOnline: boolean
    level?: SellerLevel
    compact?: boolean
}

export function SellerMiniRow({ avatar, name, isOnline, level, compact = false }: SellerMiniRowProps) {
    const initials = (name || "")
        .split(" ").
        map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const theme = level ? levelThemes[level]: null;

    return (
        <div className="relative flex items-center gap-2">
            {/* Avatar with online status dot */}
            <div className="relative">
                <Avatar className={compact ? "w-6 h-6" : "w-8 h-8"}>
                    <AvatarImage src={avatar} alt={name}/>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-2 ring-background" />
                )}
            </div>


            {/* Compact mode: rank shown as a small do ton avatar instead of text */}
              {/* Compact mode: rank shown as a small do ton avatar instead of text */}
            {compact && theme && (
                <span 
                    className={cn(
                        "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background",
                        theme.dotColor
                    )}
                />
            )}

            {/* Full mode: name + level labe, hidden in compact */}
            {!compact && (
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{name}</span>

                    {theme && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className={cn("text-xs font-bold cursor-default w-fit", theme.textColor)}>
                                        {theme.label}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Rank {theme.rank} - {theme.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )}
        </div>
    )
}