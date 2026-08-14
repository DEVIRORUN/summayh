"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "BUYER" | "SELLER" | "ADMIN"
type ProSource = "FOUNDERS" | "SUBSCRIPTION";


interface User {
    id: string;
    name: string;
    role: Role;
    isPro: boolean;
    founderBadge: boolean;
    proSource: ProSource | null;
    isEmailVerified: boolean
}

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    }

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchUser()
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, refetch: fetchUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}