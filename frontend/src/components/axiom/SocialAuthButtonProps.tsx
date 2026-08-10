import { Button } from "../ui/button";
import { FaGoogle } from "react-icons/fa6";



interface SocialAuthButtonsProps {
    onGoogleAuth: () => void; // I'll add more providers later, and 'cause they go tdifferent slow/SDK call
}

export function SocialAuthButtons({ onGoogleAuth }: SocialAuthButtonsProps) {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">or</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" onClick={onGoogleAuth} className="cursor-pointer gap-2 bg-background hover:bg-accent text-foreground border border-border hover:border-ring/40 transition-all duration-150">
                <FaGoogle className="w-4 h-4"/>
                Continue with Google
            </Button>
        </div>
    )
}