"use client";

import { use, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, VideoPresets, ConnectionQuality, Participant } from "livekit-client";
import Whiteboard from "@/components/theorems/Whiteboard";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import ConnectionQualityBadge from "@/components/axiom/ConnectionQualityBadge";
import { getBookingDetails } from "@/lib/session";
import { cn } from "@/lib/utils";
import FileViewer from "@/components/theorems/FileViewer";
import { resolveFileTypeAndName } from "@/lib/file-validation";

interface Booking {
    id: string;
    callSession: {
        id: string;
        callerId: string;
        calleeId: string;
    } | null;
}

export default function CallSessionPage({
    params,
} : { params: Promise<{ bookingId: string }>; }) {
    const { bookingId } = use(params);
    const { user, isLoading } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState("connecting");
    const [remoteTrack, setRemoteTrack] = useState<RemoteTrack | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [activeMaterialId, setActiveMaterialId] = useState("");
    const [cameraState, setCameraState] = useState<"pending" | "granted" | "denied">("pending");
    const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown)
    const [viewMode, setViewMode] = useState<"BOARD" | "FILES">("BOARD");
    const [joinError, setJoinError] = useState<string | null>(null);

    useEffect(() => {
        if (!room) return;

        const localCamPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (localCamPub?.track && localVideoRef.current) {
            localCamPub.track.attach(localVideoRef.current);
        }
        if (remoteTrack && remoteVideoRef.current) {
            remoteTrack.attach(remoteVideoRef.current);
            remoteVideoRef.current.muted = false;
            remoteVideoRef.current.play().catch((err) => {
                console.warn("Remote video autoplay blocked, needs user interaction:", err);
            });
        }
    }, [isEnlarged, isDesktop, room, remoteTrack])

    useEffect(() => {
        if (!room) return;

        function handleQualityChanged(quality: ConnectionQuality, participant: Participant) {
            if (participant.identity === room!.localParticipant.identity) {
                setConnectionQuality(quality);
            }
        }

        room.on(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
        return () => { room.off(RoomEvent.ConnectionQualityChanged, handleQualityChanged); };
    }, [room]);

    const isSellerForThisBooking = !!user && !!booking && user.id === booking?.callSession?.calleeId;

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        setIsDesktop(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let roomInstance: Room | null = null;

        async function connect() {
            const res = await fetch(`/api/calls/bookings/${bookingId}/join`, { method: "POST" });
            
            if (!res.ok) {
                if (cancelled) return;
                if (res.status === 410) {
                    setJoinError("This session's time window has passed and can no longer be joined")
                } else if (res.status === 403) {
                    setJoinError("You don't have permission to join this session.");
                } else {
                    setJoinError("Couldn't join this session. Please try again.")
                }
                return;
            }
            const { token, url } = await res.json();

            if (cancelled) return; // effect was torn down while we were fetching — bail before connecting

            const fresh = await getBookingDetails(bookingId);
            if (!cancelled) setBooking(fresh);

            const newRoom = new Room({
                adaptiveStream: true, // degardes automatically on poor connection instead of failing
                dynacast: true, // reduces bandwidth by only sending active tracks
                videoCaptureDefaults: {
                    resolution: VideoPresets.h360.resolution,
                },
                reconnectPolicy: {
                    nextRetryDelayInMs: (context) => {
                        return Math.min(1000 * Math.pow(2, context.retryCount), 10000); // Gives flaky connection more time to recover
                    },
                }
            });

            await newRoom.connect(url, token, {
                autoSubscribe: true,
                rtcConfig: {
                    iceTransportPolicy: "relay", // "all" = try direct/STUN first, fall back to TURN only if needed
                }
            });

            if (cancelled) {
                // Torn down while connect() was in flight — disconnect immediately, don't leave it dangling
                newRoom.disconnect();
                return;
            }

            roomInstance = newRoom;
            setStatus("connected");

            newRoom.remoteParticipants.forEach((part) => {
                part.videoTrackPublications.forEach((pub) => {
                    if (pub.track) setRemoteTrack(pub.track);
                });
            });

            newRoom.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
                if (track.kind === Track.Kind.Video) setRemoteTrack(track);
            })

            newRoom.on(RoomEvent.DataReceived, (payload) => {
                const msg = JSON.parse(new TextDecoder().decode(payload));
                if (msg.type === "MATERIAL_SELECTED") {
                    setActiveMaterialId(msg.materialId)
                }
            })

            setRoom(newRoom);

            try {
                await newRoom.localParticipant.enableCameraAndMicrophone();
                setCameraState("granted");

                const localCamPub = newRoom.localParticipant.getTrackPublication(Track.Source.Camera);
                if (localCamPub?.track && localVideoRef.current) {
                    localCamPub.track.attach(localVideoRef.current);
                }
            } catch (err) {
                console.warn("Camera/mic permission denied or failed:", err);
                setCameraState("denied")
            }

        }

        connect();
        return () => { 
            cancelled = true;
            if (roomInstance) {
                roomInstance.localParticipant.trackPublications.forEach((pub) => {
                    pub.track?.stop();
                })
            }
            roomInstance?.disconnect(); 
        };
    }, [bookingId]);

    async function toggleEnlarge() {
        const next = !isEnlarged;
        setIsEnlarged(next);

        const isMobile = window.matchMedia("(max-width: 1023px)").matches; // FIXED paren
        if (!isMobile) return;

        if (next) {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
                if (screen.orientation && "lock" in screen.orientation) {
                    await (screen.orientation as any).lock("landscape");
                }
            } catch (err) {
                console.warn("Orientation lock unavailable:", err);
            }
        } else {
            try {
                if (screen.orientation && "unlock" in screen.orientation) {
                    (screen.orientation as any).unlock();
                }
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            } catch (err) {
                console.warn("Exit fullscreen failed:", err);
            }
        }
    }


    if (joinError) {
        return (
            <div className="h-full w-full flex items-center justify-center text-center p-4">
                <p className="text-sm text-muted-foreground">
                    {"This session's time window has passed and can no longer be joined."}
                </p>
            </div>
        )
    }
    
    if (isLoading || !booking) {
        return <div className="h-full w-full flex items-center justify-center animate-pulse">Loading session...</div>
    }

    if(!booking.callSession) {
        return (
            <div className="h-full w-full flex items-center justify-center text-center p-4">
                <p className="text-sm text-muted-foreground">
                    {"This session isn't ready to join yet. Check back closer to your scheduled start time."}
                </p>
            </div>
        )
    }

    if (isDesktop) {
        return (
            <div className="flex h-full w-full min-h-0 min-w-0 p-4 gap-4 bg-slate-50">
                <div className="flex flex-col min-h-0 min-w-0 border rounded-md relative flex-1">
                <div className="flex gap-1 p-1 border-b border-border">
                    <Button onClick={() => setViewMode("BOARD")} className={cn("text-xs px-2 py-1 rounded-xs cursor-pointer", viewMode === "BOARD" && "bg-muted")}>Board</Button>
                    <Button onClick={() => setViewMode("FILES")} className={cn("text-xs px-2 py-1 rounded-xs cursor-pointer", viewMode === "FILES" && "bg-muted")}>Files</Button>
                </div>
                <div className={cn("h-full", viewMode !== "BOARD" && "hidden")}>
                    <Whiteboard room={room} isEnlarged={isEnlarged} onToggleEnlarge={toggleEnlarge} isHost={isSellerForThisBooking} callSessionId={booking.callSession.id} />
                </div>
                <div className={cn("h-full", viewMode !== "FILES" && "hidden")}>
                    <FileViewer room={room} callSessionId={booking.callSession.id} activeMaterialId={activeMaterialId} onSelect={setActiveMaterialId}/>
                </div>
                </div>
                <div className="flex flex-col shrink-0 w-64 gap-4 min-h-0">
                    <div className="flex-1 min-h-0 flex flex-col border rounded p-2 relative overflow-hidden">
                        <p className="p-2 text-xs font-medium text-white shrink-0 relative z-10">You {status}</p>
                        {cameraState !== "granted" && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                {cameraState === "pending" ? "Waiting for camera access..." : "Camera access denied"}
                            </div>
                        )}
                        <video ref={localVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover bg-black"/>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col border rounded p-2 relative overflow-hidden">
                            <div className="shrink-0 relative z-10 px-1 py-0.5 flex items-center justify-between">
                                <p className="text-xs font-medium text-white">You {status}</p>
                                <ConnectionQualityBadge quality={connectionQuality} variant="pc"/>
                            </div>
                        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover bg-blue-800"/>
                    </div>
                </div>
            </div>
        );
    }

    if (!isEnlarged) {
        return ( // FIXED: was missing this return entirely
            <div className="flex flex-col bg-slate-50 h-full w-full min-h-0 p-3 gap-3">
                <div className="flex-1 min-h-0 flex flex-col border rounded-lg p-2 relative overflow-hidden bg-slate-900">
                    <div className="shrink-0 relative z-10 px-1 py-0.5 flex items-center justify-between">
                        <p className="text-xs font-medium text-white">You {status}</p>
                        <ConnectionQualityBadge quality={connectionQuality} variant="pc"/>
                    </div>
                    <video ref={localVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-h-0 flex flex-col border rounded-lg p-2 relative overflow-hidden bg-slate-900">
                    <p className="text-xs font-medium text-white shrink-0 relative z-10 px-1 py-0.5">Remote</p>
                    <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"/>
                </div>
                <Button onClick={toggleEnlarge} className="shrink-0 h-12 rounded-full flex items-center justify-center gap-2">
                    <PenSquare className="w-4 h-4"/> Open Whiteboard
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full w-full min-h-0 min-w-0 bg-slate-50 flex flex-row relative">
            <div className="flex-1 min-w-0 h-full w-full min-h-0 relative">
                <div className="flex gap-1 p-1 border-b border-border">
                    <Button onClick={() => setViewMode("BOARD")} className={cn("text-xs px-2 py-1 rounded-xs cursor-pointer", viewMode === "BOARD" && "bg-muted")}>Board</Button>
                    <Button onClick={() => setViewMode("FILES")} className={cn("text-xs px-2 py-1 rounded-xs cursor-pointer", viewMode === "FILES" && "bg-muted")}>Files</Button>
                </div>
                <div className={cn("h-full", viewMode !== "BOARD" && "hidden")}>
                    <Whiteboard room={room} isEnlarged={isEnlarged} onToggleEnlarge={toggleEnlarge} isHost={isSellerForThisBooking}  callSessionId={booking.callSession.id} />
                </div>
                <div className={cn("h-full", viewMode !== "FILES" && "hidden")}>
                    <FileViewer room={room} callSessionId={booking.callSession.id} activeMaterialId={activeMaterialId} onSelect={setActiveMaterialId}/>
                </div>
            </div>
            <div className="shrink-0 w-28 flex flex-col gap-2 p-2 bg-slate-900 overflow-y-auto">
                <div className="w-full h-20 shrink-0 relative rounded overflow-hidden border border-slate-700">
                      <div className="shrink-0 relative z-10 px-1 py-0.5 flex items-center justify-between">
                        <ConnectionQualityBadge quality={connectionQuality} variant="mobile"/>
                    </div>
                    <video ref={localVideoRef} muted autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="w-full h-20 shrink-0 relative rounded overflow-hidden border border-slate-700">
                    <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                </div>
            </div>
        </div>
    );
}