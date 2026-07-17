import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleX } from "lucide-react";


type AuthMode = "login" | "signup";

interface AuthFormProps {
    mode: AuthMode;
    onSubmit: (values: { name?: string; email: string; password: string; }) => void;
    isSubmitting?: boolean;
    error?: string; // SS errors bruh
}

export function AuthForm({ mode, onSubmit, isSubmitting, error }: AuthFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const verificationRules = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "At least one lowercase letter", valid: /[a-z]/.test(password) },
        { label: "At least One numerical digit", valid: /[0-9]/.test(password) },
        { label: "At least One special character (e.g. , _, /, !)", valid: /[^A-Za-z0-9]/.test(password) },
    ]

    const isSignup = mode === "signup";

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        onSubmit(isSignup ? {name, email, password} : {email, password} )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignup  && (
                <div className="flex flex-col gap-1">
                    <Label>Full name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <ul>
                    {verificationRules.map((r, i) => (
                        <li
                            key={i}
                            className={cn(
                                "flex items-center gap-2 transition-colors duration-150",
                                r.valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}
                        >
                            {r.valid ? (
                                <CircleCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950/50"/>
                            ) : (
                                <CircleX className="w-4 h-4 text-red-600 fill-red-100 dark:fill-red-950/50"/>
                            )}
                            <span className={r.valid ? "line-through opacity-60" : ""}>
                                {r.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {error && <span className="text-xs text-red-500">{error}</span>}

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wiat..." : isSignup ? "Creat account" : "Log in"}
            </Button>
        </form>
    )
}