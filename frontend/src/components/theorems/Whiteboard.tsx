"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RemoteParticipant, Room, RoomEvent } from "livekit-client";
import { cn } from "@/lib/utils";
import { Minimize, Maximize, Lock, Undo2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Point { x: number; y: number; }

type BoardMessage =
    | { type: "stroke"; strokeId: string; from: Point; to: Point; color: string; size: number }
    | { type: "stroke_commit"; strokeId: string; points: Point[]; color: string; size: number }
    | { type: "permission"; canDraw: boolean }
    | { type: "history_bulk"; strokes: StoredSegment[] }
    | { type: "history_request" } 
    | { type: "clear" }
    | { type: "undo" }

interface StoredSegment {
    strokeId: string; 
    from: Point; 
    to: Point;
    color: string;
    size: number; 
}

const WORLD_W = 1600;
const WORLD_H = 900;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default function Whiteboard({
    room,
    isEnlarged,
    onToggleEnlarge,
    isHost,
    isReconnecting,
    callSessionId,
}: {
    room: Room | null;
    isEnlarged: boolean;
    onToggleEnlarge: () => void;
    isHost: boolean;
    isReconnecting?: boolean;
    callSessionId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const activeTouches = useRef<Map<number, Point>>(new Map());
    const pinchStartDistance = useRef<number | null>(null);
    const pinchStartZoom = useRef(1);
    const pinchStartPan = useRef<{ x: number; y: number } | null>(null);
    const pinchStartMidpoint = useRef<Point | null>(null);

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
    const storageKey = `whiteboard:${callSessionId}`;
    const [canDraw, setCanDraw] = useState(isHost);

    // Camera: zoom + pan (pan is in screen pixels, offset of world origin)
    const [camera, setCamera] = useState({ zoom: 1, panX: 0, panY: 0 });
    const cameraRef = useRef(camera);
    useEffect(() => { cameraRef.current = camera; }, [camera]);

    // Tracked for the minimap + centering math and kept in sync via ResizeObserver
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const currentStrokePoints = useRef<Point[]>([]);
    const COLOR_SWATCHES = ["#000000", "#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#A855F7", "#FFFFFF"];

    const hasCenteredOnce = useRef(false);

    function persistHistory() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(strokeHistory.current));
        } catch (err) {
            console.warn("Failed to persist whiteboard to localStorage: ", err);
        }
    }

    // Load sesison from localstorage wipe old
    useEffect(() => {
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith("whiteboard:") && key !== storageKey) {
                    localStorage.removeItem(key);
                }
            }

            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed: StoredSegment[] = JSON.parse(saved);
                strokeHistory.current = parsed;
                redrawAll();
            }
        } catch (err) {
            console.warn("Failed to restore/wipe whiteboard localStorage:", err);
        }
    }, [callSessionId]);

    // "Contain" fit tatics
    function getBaseScale(): number {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.clientWidth || !canvas.clientHeight) return 1;
        const scaleX = canvas.clientWidth / WORLD_W;
        const scaleY = canvas.clientHeight / WORLD_H;
        return Math.min(scaleX, scaleY);
    }

    // Center the world in the canvas.
    function centerCamera(preserveZoom = true) {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.clientWidth || !canvas.clientHeight) return;

        const baseScale = getBaseScale();
        const zoom = preserveZoom ? cameraRef.current.zoom : 1;
        const scale = baseScale * zoom;
        const worldPixelW = WORLD_W * scale;
        const worldPixelH = WORLD_H * scale;

        setCamera((cam) => ({
            zoom,
            panX: (canvas.clientWidth - worldPixelW) / 2,
            panY: (canvas.clientHeight - worldPixelH) / 2,
        }));
    }

    function screenToWorld(p: Point): Point {
        const cam = cameraRef.current;
        const baseScale = getBaseScale();
        const scale = baseScale * cam.zoom;
        return {
            x: (p.x - cam.panX) / scale,
            y: (p.y - cam.panY) / scale,
        };
    }

    function worldToScreen(p: Point): Point {
        const cam = cameraRef.current;
        const baseScale = getBaseScale();
        const scale = baseScale * cam.zoom;
        return {
            x: p.x * scale + cam.panX,
            y: p.y * scale + cam.panY,
        };
    }

    function worldSizeToScreen(worldSize: number): number {
        const cam = cameraRef.current;
        const baseScale = getBaseScale();
        return worldSize * baseScale * cam.zoom;
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

    function redrawAll() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const topLeft = worldToScreen({ x: 0, y: 0 });
        const bottomRight = worldToScreen({ x: WORLD_W, y: WORLD_H });
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

        for (const seg of strokeHistory.current) {
            const from = worldToScreen(seg.from);
            const to = worldToScreen(seg.to);
            drawSegmentScreen(from, to, seg.color, worldSizeToScreen(seg.size));
        }
    }

    useEffect(() => {
        cameraRef.current = camera;
        redrawAll();
        
    }, [camera]);

    function getScreenPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    const MAX_CHUNK_BYTES = 60000;
    function sendHistoryBulk(room: Room, strokes: StoredSegment[]) {
        let chunk: StoredSegment[] = [];
        let chunkBytes = 0;

        function flush() {
            if (chunk.length === 0) return;
            const message: BoardMessage = { type: "history_bulk", strokes: chunk };
            room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true });
            chunk = [];
            chunkBytes = 0;
        }

        for (const seg of strokes) {
            const segBytes = encoder.encode(JSON.stringify(seg)).length;
            if (chunkBytes + segBytes > MAX_CHUNK_BYTES) flush();
            chunk.push(seg);
            chunkBytes += segBytes;
        }
        flush();
    }

    const sendStroke = useCallback((strokeId: string, from: Point, to: Point) => {
        if (!room) {
            console.warn("sendStroke skipped: room not ready yet");
            return;
        }
        const message: BoardMessage = {
            type: "stroke", strokeId, from, to,
            color: colorRef.current,
            size: brushSizeRef.current,
        };

        const payload = encoder.encode(JSON.stringify(message));
        room.localParticipant.publishData(payload, { reliable: false });
    }, [room]);

    const sendPermissin = useCallback((allow: boolean) => {
        if (!room) return;
        const message: BoardMessage = { type: "permission", canDraw: allow };
        const payload = encoder.encode(JSON.stringify(message));
        room.localParticipant.publishData(payload, { reliable: true });
        if (isHost) setGuestCanDraw(allow);
    }, [room, isHost]);

    // Late-join catch-up
    useEffect(() => {
        if (!room) return;
        const message: BoardMessage = { type: "history_request" };
        room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true });
    }, [room]);

    useEffect(() => {
        if (!room || isHost) return;
        const message: BoardMessage = { type: "history_request" };
        room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true });
    }, [room, isHost]);

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
                        });
                    }
                    redrawAll();
                    persistHistory();
                }

                if (message.type === "permission" && !isHost) {
                    setCanDraw(message.canDraw);
                }

                if (message.type === "history_bulk") {
                    const existingIds = new Set(strokeHistory.current.map(s => s.strokeId));
                    const newSegs = message.strokes.filter(s => !existingIds.has(s.strokeId));
                    if (newSegs.length > 0) {
                        strokeHistory.current = [...strokeHistory.current, ...message.strokes];
                        redrawAll();
                        persistHistory();
                    }
                }

                if (message.type === "history_request") {
                    if (strokeHistory.current.length > 0) {
                        sendHistoryBulk(room!, strokeHistory.current);
                    }
                }

                if (message.type === "clear" && !isHost) {
                    strokeHistory.current = [];
                    redrawAll();
                    persistHistory();
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
        currentStrokePoints.current = [worldPoint];
        canvasRef.current?.setPointerCapture(e.pointerId);
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
            from: lastPoint.current, to: newWorldPoint,
            color: currentColor, size: currentSize
        });
        currentStrokePoints.current.push(newWorldPoint);

        sendStroke(strokeId, lastPoint.current, newWorldPoint);
        lastPoint.current = newWorldPoint;
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
        if (isDrawing.current && currentStrokeId.current && currentStrokePoints.current.length > 1) {
            if (room) {
                const message: BoardMessage = {
                    type: "stroke_commit",
                    strokeId: currentStrokeId.current,
                    points: currentStrokePoints.current,
                    color: colorRef.current,
                    size: brushSizeRef.current,
                };
                room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true });
            }
            persistHistory();
        }
        isDrawing.current = false;
        lastPoint.current = null;
        currentStrokeId.current = null;
        currentStrokePoints.current = [];
        canvasRef.current?.releasePointerCapture(e.pointerId);
    }

    function clearBoard() {
        if (!isHost) return;
        strokeHistory.current = [];
        redrawAll();
        persistHistory();

        if (room && isHost) {
            const message: BoardMessage = { type: "clear" };
            room.localParticipant.publishData(encoder.encode(JSON.stringify(message)));
        }
    }

    function applyUndo() {
        const history = strokeHistory.current;
        if (history.length === 0) return;
        const lastId = history[history.length - 1].strokeId;
        strokeHistory.current = history.filter(seg => seg.strokeId !== lastId);
        redrawAll();
        persistHistory();
    }

    function undoLast() {
        if (!canDraw) return;
        applyUndo();

        if (room) {
            const message: BoardMessage = { type: "undo" };
            room.localParticipant.publishData(encoder.encode(JSON.stringify(message)), { reliable: true });
        }
    }

    function zoomIn() {
        setCamera(cam => ({ ...cam, zoom: Math.min(MAX_ZOOM, Math.round((cam.zoom + 0.25) * 100) / 100) }));
    }

    function zoomOut() {
        setCamera(cam => ({ ...cam, zoom: Math.max(MIN_ZOOM, Math.round((cam.zoom - 0.25) * 100) / 100) }));
    }

    function resetView() {
        centerCamera(false);
    }

    function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
        const rect = canvasRef.current!.getBoundingClientRect();
        for (const touch of Array.from(e.touches)) {
            activeTouches.current.set(touch.identifier, {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            });
        }

        if (activeTouches.current.size === 2) {
            isDrawing.current = false;
            lastPoint.current = null;
            currentStrokeId.current = null;
            currentStrokePoints.current = [];

            const pts = Array.from(activeTouches.current.values());
            pinchStartDistance.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            pinchStartZoom.current = cameraRef.current.zoom;
            pinchStartPan.current = { x: cameraRef.current.panX, y: cameraRef.current.panY };
            pinchStartMidpoint.current = {
                x: (pts[0].x + pts[1].x) / 2,
                y: (pts[0].y + pts[1].y) / 2,
            };
            e.preventDefault();
        }
    }

    function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
        if (activeTouches.current.size < 2) return;
        e.preventDefault();

        const rect = canvasRef.current!.getBoundingClientRect();
        for (const touch of Array.from(e.touches)) {
            activeTouches.current.set(touch.identifier, {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            });
        }

        if (e.touches.length === 2 && pinchStartDistance.current && pinchStartPan.current && pinchStartMidpoint.current) {
            const pts = Array.from(activeTouches.current.values());
            const newDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const scaleFactor = newDistance / pinchStartDistance.current;
            const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(pinchStartZoom.current * scaleFactor * 100) / 100));

            const zoomRatio = newZoom / pinchStartZoom.current;
            const anchor = pinchStartMidpoint.current;
            const newPanX = anchor.x - (anchor.x - pinchStartPan.current.x) * zoomRatio;
            const newPanY = anchor.y - (anchor.y - pinchStartPan.current.y) * zoomRatio;

            setCamera({ zoom: newZoom, panX: newPanX, panY: newPanY });
        }
    }

    function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
        for (const touch of Array.from(e.changedTouches)) {
            activeTouches.current.delete(touch.identifier);
        }
        if (activeTouches.current.size < 2) {
            pinchStartDistance.current = null;
            pinchStartPan.current = null;
            pinchStartMidpoint.current = null;
        }
    }
    function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        e.preventDefault();
        const rect = canvasRef.current!.getBoundingClientRect();
        const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const cam = cameraRef.current;

        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((cam.zoom + delta) * 100) / 100));
        const zoomRatio = newZoom / cam.zoom;

        const newPanX = cursor.x - (cursor.x - cam.panX) * zoomRatio;
        const newPanY = cursor.y - (cursor.y - cam.panY) * zoomRatio;

        setCamera({ zoom: newZoom, panX: newPanX, panY: newPanY });
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

                setCanvasSize({ width: rect.width, height: rect.height });

                if (!hasCenteredOnce.current) {
                    hasCenteredOnce.current = true;
                    centerCamera(false);
                } else {
                    redrawAll();
                }
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
                <div className="flex items-center gap-1.5">
                    {COLOR_SWATCHES.map((swatch) => (
                        <button
                            key={swatch}
                            type="button"
                            onClick={() => setColor(swatch)}
                            disabled={!canDraw}
                            aria-label={`Select color ${swatch}`}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 shrink-0 transition-transform disabled:opacity-40 disabled:cursor-not-allowed",
                                color === swatch ? "border-foreground scale-110" : "border-slate-600"
                            )}
                            style={{ backgroundColor: swatch }}
                        />
                    ))}
                </div>
                <Input type="range" min={1} max={20} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} disabled={!canDraw} className="w-28 cursor-pointer disabled:opacity-40" />
                <Button onClick={clearBoard} disabled={!canDraw} className="text-sm border px-2 py-1 rounded">Clear</Button>
                <Button onClick={undoLast} disabled={!canDraw} variant="secondary" size="icon" className="w-9 h-9" title="Undo last stroke">
                    <Undo2 className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1 border border-slate-700 pl-2 ml-1">
                    <Button onClick={zoomOut} variant="secondary" size="icon" className="w-9 h-9" title="Zoom out"><ZoomOut className="w-4 h-4" /></Button>
                    <span className="text-xs text-slate-300 w-10 text-center">{Math.round(camera.zoom * 100)}%</span>
                    <Button onClick={zoomIn} variant="secondary" size="icon" className="w-9 h-9" title="Zoom in"><ZoomIn className="w-4 h-4" /></Button>
                    <Button onClick={resetView} variant="secondary" size="icon" className="w-9 h-9" title="Reset view"><RotateCcw className="w-4 h-4" /></Button>
                </div>

                {isHost && (
                    <Button
                        onClick={() => sendPermissin(!guestCanDraw)} variant="secondary" size="sm" className="text-xs ml-1 cursor-pointer">
                        {guestCanDraw ? "Lock guest drawing" : "Allow guest to draw"}
                    </Button>
                )}

                {!isHost && !canDraw && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> View only
                    </span>
                )}

                <Button
                    onClick={onToggleEnlarge} variant="secondary" size="icon" className="h-9 w-9 shrink-0 ml-auto" title={isEnlarged ? "Minimize Board" : "Enlarge Board"}>
                    {isEnlarged ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
            </div>

            <div className="flex-1 w-full min-h-0 relative bg-slate-100">
                {isReconnecting && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow animate-pulse">
                        Reconnecting...
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="relative w-full h-full overflow-hidden"
                >
                    <canvas
                        ref={canvasRef}
                        className={cn("absolute inset-0 w-full h-full touch-none bg-slate-200", canDraw ? "cursor-crosshair" : "cursor-not-allowed")}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        onWheel={handleWheel}
                    />
                    <Minimap camera={camera} canvasSize={canvasSize} />
                </div>
                {!canDraw && !isHost && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                        <span className="bg-slate-900/80 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> View only
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function Minimap({
    camera,
    canvasSize,
}: {
    camera: { zoom: number; panX: number; panY: number };
    canvasSize: { width: number; height: number };
}) {
    const MINIMAP_W = 110;
    const MINIMAP_H = MINIMAP_W * (WORLD_H / WORLD_W);

    if (!canvasSize.width || !canvasSize.height) return null;

    const baseScale = Math.min(canvasSize.width / WORLD_W, canvasSize.height / WORLD_H);
    const scale = baseScale * camera.zoom;
    if (!scale) return null;

    const visibleWorldX = -camera.panX / scale;
    const visibleWorldY = -camera.panY / scale;
    const visibleWorldW = canvasSize.width / scale;
    const visibleWorldH = canvasSize.height / scale;

    const mmScale = MINIMAP_W / WORLD_W;

    const rawLeft = visibleWorldX * mmScale;
    const rawTop = visibleWorldY * mmScale;
    const rawW = visibleWorldW * mmScale;
    const rawH = visibleWorldH * mmScale;

    const left = Math.max(0, Math.min(MINIMAP_W, rawLeft));
    const top = Math.max(0, Math.min(MINIMAP_H, rawTop));
    const width = Math.max(4, Math.min(MINIMAP_W - left, rawLeft < 0 ? rawW + rawLeft : rawW));
    const height = Math.max(4, Math.min(MINIMAP_H - top, rawTop < 0 ? rawH + rawTop : rawH));

    return (
        <div
            className="absolute bottom-2 right-2 bg-slate-900/80 border border-slate-600 rounded pointer-events-none overflow-hidden"
            style={{ width: MINIMAP_W, height: MINIMAP_H }}
        >
            <div className="absolute inset-0 bg-white/90" />
            <div
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{ left, top, width, height }}
            />
        </div>
    );
}