import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


interface PasswordChangeFormProps {
    onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
    isSubmitting?: boolean;
    error?: string;
}

export function PasswordChangeForm({ onSubmit, isSubmitting, error }: PasswordChangeFormProps) {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");

    // lil mismatch check here
    const mismatch = next !== confirm && confirm.length > 0;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (mismatch) return;
        onSubmit({ currentPassword: current, newPassword: next });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
                <Label>Current password</Label>
                <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>New password</Label>
                <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
                <Label>Confirm new password</Label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {mismatch && <span className="text-xs text-red-500">{"Passwords don't match"}</span>}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
            <Button type="submit" disabled={isSubmitting || mismatch} >Update password</Button>
        </form>
    )
}