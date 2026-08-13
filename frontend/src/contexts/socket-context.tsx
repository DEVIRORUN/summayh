"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface NotificationPayload {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: string;
}

interface SocketContextValue {
    socket: Socket | null;
}

const SocketContext  = createContext<SocketContextValue>({ socket: null });

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user  } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
            withCredentials: true, // sends token along with handshale
        });

        socket.on("notification:new", (notification: NotificationPayload) => {
            const id = toast.custom((toastId) => (
                <div
                    onClick={() => {
                        markAsRead(notification.id)
                        if (notification.link) {
                            window.location.href = notification.link;
                        }
                        toast.dismiss(toastId)
                    }}
                    className="w-full cursor-pointer rounded-md border bg-background p-3 shadow-lg flex flex-col gap-1"
                >
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                                toast.dismiss(toastId);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                        >
                            Dismiss
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.body}</p>
                </div>
            ), {
                duration: 6000,
                onAutoClose: () => {
                    markAsRead(notification.id)
                },
            });
        });

        socket.connect();
        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
}

async function markAsRead(id: string) {
    try {
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    } catch (err: any) {
        console.error("[SocketProvider] failed to mark notification read: ", err)
    }
}