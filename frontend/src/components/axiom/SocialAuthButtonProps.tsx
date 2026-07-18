import { Button } from "../ui/button";
import { FaGoogle } from "react-icons/fa6";



interface SocialAuthButtonsProps {
    onGoogleAuth: () => void; // I'll add more providers later, and 'cause they go tdifferent slow/SDK call
}

export function SocialAuthButtons({ onGoogleAuth }: SocialAuthButtonsProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" onClick={onGoogleAuth} className="cursor-pointer gap-2">
                <FaGoogle className="w-4 h-4"/>
                Continue with Google
            </Button>
        </div>
    )
}