import { Button } from "../ui/button";
import { FaGoogle } from "react-icons/fa6";



interface SocialAuthButtonProps {
    onGoogleAuth: () => void; // I'll add more providers later, and 'cause they go tdifferent slow/SDK call
}

export function SocialAuthButton({ onGoogleAuth }: SocialAuthButtonProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" onClick={onGoogleAuth} className="gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v2.4h6.7c-.3 1.4-1.9 4.2-6.7 4.2-4 0-7.3-3.3-7.3-7.4s3.3-7.4 7.3-7.4c2.3 0 3.8.9 4.7 1.8l2.5-2.5C17.5 1 15 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.3-.2-1.9H12z"/></svg>
                Continue with Google
            </Button>
        </div>
    )
}