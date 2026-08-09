"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RemoteParticipant, Room, RoomEvent } from "livekit-client";
import { cn } from "@/lib/utils";
import { Minimize, Maximize, Lock, Undo2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Point { x: number;  y: number; } // WORLD CORD ALWAYS

type BoardMessage = 
    | { type: "stroke"; strokeId: string; from: Point; to: Point; color: string; size: number }
    | { type: "stroke_commit"; strokeId: string; points: Point[]; color: string; size: number }
    | { type: "permission"; canDraw: boolean }
    | { type: "history_bulk"; strokes: StoredSegment[] } // catch-up for last joiners
    | { type: "history_request" } // late joiner ask host for state
    | { type: "clear" }
    | { type: "undo" }

interface StoredSegment {
    strokeId: string; // Goruping for undo
    from: Point; // normalized 0-1
    to: Point; // normalized 0-1
    color: string;
    size: number; // normalized relative to width
}

const WORLD_W = 1600;
const WORLD_H = 900;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default function Whiteboard({ 
    room, 
    isEnlarged, 
    onToggleEnlarge,
    isHost,
    isReconnecting,
 }: { room: Room | null; 
    isEnlarged: boolean; 
    onToggleEnlarge: () => void; 
    isHost: boolean
    isReconnecting?: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const outerRef = useRef<HTMLDivElement | null>(null);

    const isDrawing = useRef(false);
    const lastPoint = useRef<Point | null>(null);
    const currentStrokeId = useRef<string | null>(null);
    const [guestCanDraw, setGuestCanDraw] = useState(false);

    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(4);

    const colorRef = useRef(color);
    const brushSizeRef = useRef(brushSize);
    useEffect(() => { colorRef.current = color; }, [color]);
    useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);

    const strokeHistory = useRef<StoredSegment[]>([]);
    const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
    const [canDraw, setCanDraw] = useState(isHost);

    // Camera: zoom + pan
    const [camera, setCamera] = useState({ zoom: 1, panX: 0, panY: 0 });
    const cameraRef = useRef(camera);
    useEffect(() => { cameraRef.current = camera; }, [camera]);

    const currentStrokePoints = useRef<Point[]>([]);

    // fit outer box to 16:9 (pxs board occupies)
    useEffect(() => {
        const outer = outerRef.current;
        if (!outer) return;
        const ASPECT = WORLD_W / WORLD_H;

        const fit = () => {
            const rect = outer.getBoundingClientRect();
            let width = rect.width;
            let height = width / ASPECT;
            if (height > rect.height) {
                height = rect.height;
                width = height * ASPECT;
            }
            setBoardSize({ width: Math.floor(width), height: Math.floor(height) });
        };

        const ro = new ResizeObserver(fit);
        ro.observe(outer);
        fit();

        return () => ro.disconnect();
    }, []);

    // Screenn to world
    function screenToWorld(p: Point): Point {
        const canvas = canvasRef.current!;
        const cam = cameraRef.current;

        const baseScale = canvas.clientWidth / WORLD_W;
        const scale = baseScale * cam.zoom;
        return {
            x: (p.x - cam.panX) / scale,
            y: (p.y - cam.panY) / scale,
        }
    }
    
    function worldToScreen(p: Point): Point {
        const canvas = canvasRef.current!;
        const cam = cameraRef.current;

        const baseScale = canvas.clientWidth / WORLD_W;
        const scale = baseScale * cam.zoom;
        return {
            x: p.x * scale + cam.panX,
            y: p.y * scale + cam.panY,
        };
    }

    function drawSegmentScreen(fromScreen: Point, toScreen: Point, strokeColor: string, screenSize: number) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = screenSize;
        ctx.beginPath();
        ctx.moveTo(fromScreen.x, fromScreen.y);
        ctx.lineTo(toScreen.x, toScreen.y);
        ctx.stroke();
    }

    function worldSizeToScreen(worldSize: number): number {
        const canvas = canvasRef.current!;
        const cam = cameraRef.current;
        const baseScale = canvas.clientWidth / WORLD_W;
        return worldSize * baseScale * cam.zoom
    }

    // Replay the Entire stored history
    function redrawAll() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const seg of strokeHistory.current) {
            const from = worldToScreen(seg.from);
            const to = worldToScreen(seg.to);
            drawSegmentScreen(from, to, seg.color, worldSizeToScreen(seg.size));
        }
    }

    useEffect(() => { 
        cameraRef.current = camera;
        redrawAll(); 
    }, [camera]) // re-render whenever camera changes (zoom/pan)

    function getScreenPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    const sendStroke = useCallback((strokeId: string, from: Point, to: Point) => {
        if (!room) {
            console.warn("sendStroke skipped: room not ready yet");
            return;
        };
        const message: BoardMessage = { 
            type: "stroke", strokeId, from, to,
            color: colorRef.current, 
            size: brushSizeRef.current,
        };

        const payload = encoder.encode(JSON.stringify(message)); // Send message
        room.localParticipant.publishData(payload, { reliable: false });
    }, [room]);

    const sendPermissin = useCallback((allow: boolean) => {
        if (!room) return;
        const message: BoardMessage = { type: "permission", canDraw: allow };
        const payload = encoder.encode(JSON.stringify(message));
        room.localParticipant.publishData(payload, { reliable: true }); // reliable: permission must arrive
        if (isHost) setGuestCanDraw(allow);
    }, [room, isHost]);

    // Late-join catch-up: host broadcast full history
    useEffect(() => {
        if (!room || !isHost) return;

        function handleParticipantConnected() {
            const message: BoardMessage = { type: "history_bulk", strokes: strokeHistory.current };
            room!.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true })
        }

        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        return () => { room.off(RoomEvent.ParticipantConnected, handleParticipantConnected); };
    }, [room, isHost]);

    // Guest:  on mount/join, ask host for current state (cover refresh-mid-call)
    useEffect(() => {
        if (!room || !isHost) return;
        const message: BoardMessage = { type: "history_request" };
        room.localParticipant.publishData(encoder.encode(JSON.stringify(message)))
    }, [room]);

    // Incoming message to draw and store, and resize replays em
    useEffect(() => {
        if (!room) return;

        function handleData(payload: Uint8Array, participant?: RemoteParticipant) {
            try {
                const message = JSON.parse(decoder.decode(payload)) as BoardMessage;

                if (message.type === "stroke") {
                    strokeHistory.current.push({
                        strokeId: message.strokeId,
                        from: message.from, to: message.to, 
                        color: message.color, size: message.size
                    });
                    const from = worldToScreen(message.from);
                    const to = worldToScreen(message.to);
                    drawSegmentScreen(from, to, message.color, worldSizeToScreen(message.size));
                }

                if (message.type === "stroke_commit") {
                    strokeHistory.current = strokeHistory.current.filter(seg => seg.strokeId !== message.strokeId);

                    for (let i = 0; i < message.points.length - 1; i++) {
                        strokeHistory.current.push({
                            strokeId: message.strokeId,
                            from: message.points[i],
                            to: message.points[i + 1],
                            color: message.color,
                            size: message.size,
                        })
                    }
                    redrawAll();
                }

                if (message.type === "permission" && !isHost) {
                    setCanDraw(message.canDraw); // Only gyest listens to permission
                }

                if (message.type === "history_bulk") {
                    if (message.strokes.length > strokeHistory.current.length) {
                        strokeHistory.current = message.strokes;
                        redrawAll();
                    }
                }

                if (message.type === "history_request") {
                    if (strokeHistory.current.length > 0) {
                        const reply: BoardMessage = { type: "history_bulk", strokes: strokeHistory.current };
                        room!.localParticipant.publishData(encoder.encode(JSON.stringify(reply)), { reliable: true })
                    }
                }

                if (message.type === "clear" && !isHost) {
                    strokeHistory.current = [];
                    redrawAll();
                }

                if (message.type === "undo") {
                    applyUndo();
                }
                
            } catch (err) {
                console.error("Failed to parse whiteboard message:", err);
            }
        }

        room.on(RoomEvent.DataReceived, handleData);
        return () => { room.off(RoomEvent.DataReceived, handleData); };
    }, [room, isHost]);

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!canDraw) return;
        isDrawing.current = true;
        currentStrokeId.current = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const worldPoint = screenToWorld(getScreenPoint(e));
        lastPoint.current = worldPoint;
        currentStrokePoints.current = [worldPoint]; // start accumulating
        canvasRef.current?.setPointerCapture(e.pointerId)
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!canDraw || !isDrawing.current || !lastPoint.current || !currentStrokeId.current) return;
        
        const strokeId = currentStrokeId.current;
        const newWorldPoint = screenToWorld(getScreenPoint(e));
        const currentColor = colorRef.current;
        const currentSize = brushSizeRef.current;

        drawSegmentScreen(worldToScreen(lastPoint.current), worldToScreen(newWorldPoint), currentColor, worldSizeToScreen(currentSize));

        strokeHistory.current.push({
            strokeId,
            from:lastPoint.current, to: newWorldPoint,
            color: currentColor, size: currentSize
        });
        currentStrokePoints.current.push(newWorldPoint); // accumalte locally too

        sendStroke(strokeId, lastPoint.current, newWorldPoint);
        lastPoint.current = newWorldPoint;
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
        if (isDrawing.current && currentStrokeId.current && currentStrokePoints.current.length > 1) {
            // Commit FULL stroke - sharpest complete version
            if (room) {
                const message: BoardMessage = {
                    type: "stroke_commit",
                    strokeId: currentStrokeId.current,
                    points: currentStrokePoints.current,
                    color: colorRef.current,
                    size: brushSizeRef.current,
                };
                room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true })
            }
        }
        isDrawing.current = false;
        lastPoint.current = null;
        currentStrokeId.current = null;
        currentStrokePoints.current = [];
        canvasRef.current?.releasePointerCapture(e.pointerId)
    }

    function clearBoard() {
        if (!isHost) return;
        strokeHistory.current = [];
        redrawAll();

        if (room && isHost) {
            const message: BoardMessage = { type: "clear" };;
            room.localParticipant.publishData(encoder.encode(JSON.stringify(message)))
        }
    }

    function applyUndo() {
        const history = strokeHistory.current;
        if (history.length === 0) return;
        const lastId = history[history.length - 1].strokeId;
        strokeHistory.current = history.filter(seg => seg.strokeId !== lastId);
        redrawAll()
    }

    function undoLast() {
        if (!canDraw) return;
        applyUndo();

        if (room) {
            const message: BoardMessage = { type: "undo" }
            room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true })
        }
    }

    function zoomIn() {
        setCamera(cam => ({ ...cam, zoom: Math.min(4, Math.round((cam.zoom + 0.25) * 100) / 100) }));
    }

    function zoomOut() {
        setCamera(cam => ({ ...cam, zoom: Math.max(0.5, Math.round((cam.zoom - 0.25) * 100) / 100) }));
    }

    function resetView() {
        setCamera({ zoom: 1, panX: 0, panY: 0 })
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const newWidth = Math.floor(rect.width * dpr);
            const newHeight = Math.floor(rect.height * dpr);

            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                // Replay from stored history, not streching old pixels
                redrawAll();
            }
        };

        const resizeObserver = new ResizeObserver(() => resize());
        resizeObserver.observe(container);

        resize();
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b shrink-0 bg-slate-900 border-slate-800 flex-wrap">
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={!canDraw} className="w-28 cursor-pointer disabled:opacity-40" />
                <Input type="range" min={1} max={20} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} disabled={!canDraw} className="w-28 cursor-pointer disabled:opacity-40" />
                <Button onClick={clearBoard} disabled={!canDraw} className="text-sm border px-2 py-1 rounded">Clear</Button>
                <Button onClick={undoLast} disabled={!canDraw} variant="secondary" size="icon" className="w-9 h-9" title="Undo last stroke">
                    <Undo2 className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1 border-1 border-slate-700 pl-2 ml-1">
                    <Button onClick={zoomIn} variant="secondary" size="icon" className="w-9 h-9" title="Zoom Out"><ZoomIn className="w-4 h-4" /></Button>
                    <span className="text-xs text-slate-300 w-10 text-center">{Math.round(camera.zoom * 100)}%</span>
                    <Button onClick={zoomOut} variant="secondary" size="icon" className="w-9 h-9" title="Zoom in"><ZoomOut className="w-4 h-4" /></Button>
                    <Button onClick={resetView} variant="secondary" size="icon" className="w-9 h-9" title="Reset view"><RotateCcw className="w-4 h-4" /></Button>
                </div>

                {isHost && (
                    <Button
                        onClick={() => sendPermissin(!guestCanDraw)} variant="secondary" size="sm"className="text-xs ml-1 cursor-pointer">
                        {guestCanDraw  ? "Lock guest drawing" : "Allow guest to draw"}
                    </Button>
                )}

                {!isHost && !canDraw && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> View O
                    </span>
                )}

                <Button
                    onClick={onToggleEnlarge} variant="secondary" size="icon" className="h-9 w-9 shrink-0 ml-auto" title={isEnlarged ? "Minimize Board" : "Enlarge Board"}>
                    {isEnlarged ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4"/>}
                </Button>
            </div>

            
            <div ref={outerRef} className="flex-1 w-full min-h-0 flex items-center justify-center bg-slate-100 p-2">
                {isReconnecting && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow aniamte-pulse">
                        Reconnecting...
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="relative bg-white border rounded overflow-hidden shadow-sm"
                    style={{ width: boardSize.width || "100%", height: boardSize.height || "100%" }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                            backgroundSize: `${20 * camera.zoom}px ${20 * camera.zoom}px`,
                            backgroundPosition: `${camera.panX}px ${camera.panY}px`
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        className={cn("absolute inset-0 w-full h-full touch-none cursor-crosshair", canDraw ? "cursor-crosshair" : "cursor-not-allowed")}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    />
                </div>
                {!canDraw && !isHost && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                        <span className="bg-slate-900/80 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5"/> View only
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}