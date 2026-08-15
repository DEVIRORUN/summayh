"use client";

import { useEffect, useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import Link from "next/link";

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
            const res = await fetch("/api/notifications", { credentials: "include" })
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data.notifications ?? []);
            console.log("Notification: ", data);
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
            await fetch(`/api/notifications/${id}`, { method: "PATCH", credentials: "include" });
        } catch (err) {
            console.error("[NotificationBell] mark read failed", err);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="group relative" aria-label="Notifications">
                    <Bell className="h-5 w-5 cursor-pointer hover:bg-card" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 gap-0 max-h-96 overflow-y-auto">
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
                            className={`flex items-start gap-2 border-b px-3 py-2.5 text-sm hover:bg-muted last:border-b-0 ${
                                !n.read ? "bg-muted/85" : ""
                            }`}
                        >
                            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                            <div>
                                <p className="font-medium">{n.title}</p>
                                <p className="text-muted-foreground text-xs mt-0.5">{n.body}</p>
                            </div>
                        </Link>
                    ))
                )}
            </PopoverContent>
        </Popover>
    );
}