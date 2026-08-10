"use client";

import React, { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleX, Eye, EyeOff } from "lucide-react";
import { isSchoolDomainValid, SchoolEmailInput } from "./SchoolEmalInput";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (values: {
    name?: string;
    email: string;
    password: string;
  }) => void;
  isSubmitting?: boolean;
  error?: string; // SS errors bruh
}

export function AuthForm({
  mode,
  onSubmit,
  isSubmitting,
  error,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const verificationRules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(password) },
    { label: "At least One numerical digit", valid: /[0-9]/.test(password) },
    {
      label: "At least One special character (e.g. , _, /, !)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const isSignup = mode === "signup";
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailValidationError(null)
    
    if (isSignup && !isSchoolDomainValid(email)) {
        setEmailValidationError(
            "Please use your school email address (e.g. yourname@unilag.edu.ng). If your school isn't listed, contact support."
        );
        return;    
    }

    onSubmit(isSignup ? { name, email, password } : { email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full min-w-0">
      {isSignup && (
        <div className="flex flex-col gap-1.5 w-full">
          <Label className="text-xs font-medium text-foreground">Full name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abdulmalik Idan"
            required
            className="text-sm bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 w-full min-w-0">
        <SchoolEmailInput
            value={email}
            onChange={setEmail}
            error={emailValidationError}
            onErrorChange={setEmailValidationError}
            onSchoolSelected={() => passwordRef.current?.focus()}
        />
      </div>

      <div className="flex flex-col gap-1.5  w-full">
        <Label htmlFor="password" className="text-xs font-medium text-foreground">
          Password
        </Label>
        <div className="relative w-full">   
          <Input
            id="password"
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="........"
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            required
            minLength={8}
            className="bg-background"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev)
            }}
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} /> }
          </button>
        </div>
       {isPasswordFocused && password.length > 1 && (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
                {verificationRules.map((r, i) => (
                    <li
                    key={i}
                    className={cn(
                        "flex items-center gap-2 transition-colors duration-150",
                        r.valid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                    >
                    {r.valid ? (
                        <CircleCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950/50" />
                    ) : (
                        <CircleX className="w-4 h-4 text-red-600 fill-red-100 dark:fill-red-950/50" />
                    )}
                    <span className={r.valid ? "line-through opacity-60" : ""}>
                        {r.label}
                    </span>
                    </li>
                ))}
            </ul>
        )}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Please wait..."
          : isSignup
            ? "Create account"
            : "Log in"}
      </Button>
    </form>
  );
}
