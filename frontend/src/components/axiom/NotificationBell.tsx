"use client";

import { useEffect, useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell } from "lucide-react";
import Link from "next/link";
import { proxyFetch } from "@/lib/proxyFetch"; // your existing BFF helper

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await proxyFetch("/notifications");
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch (err) {
            console.error("[NotificationBell] fetch failed", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await proxyFetch(`/notifications/${id}/read`, { method: "PATCH" });
        } catch (err) {
            console.error("[NotificationBell] mark read failed", err);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                        No notifications yet
                    </p>
                ) : (
                    notifications.map((n) => (
                        <Link
                            key={n.id}
                            href={n.link ?? "#"}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`block border-b px-3 py-2.5 text-sm hover:bg-muted last:border-b-0 ${
                                !n.read ? "bg-muted/50" : ""
                            }`}
                        >
                            <p className="font-medium">{n.title}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{n.body}</p>
                        </Link>
                    ))
                )}
            </PopoverContent>
        </Popover>
    );
}