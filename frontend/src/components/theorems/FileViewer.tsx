"use client";

import React, { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { Button } from "../ui/button";
import { FileText, ImageIcon, Loader2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { resolveFileTypeAndName } from "@/lib/file-validation";

// Load the PDF.js worker from a CDN matching the installed pdfjs-dist version —
// avoids extra webpack/next config to bundle the worker file ourselves.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface Material {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
}

export default function FileViewer({
    room,
    callSessionId,
    activeMaterialId,
    onSelect,
}: {
    room: any;
    callSessionId: string;
    activeMaterialId: string;
    onSelect: (id: string) => void;
}) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // PDF pagination state — reset whenever the active material changes
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/calls/${callSessionId}/materials`)
            .then((res) => res.json())
            .then(({ data }) => setMaterials(data || []));
    }, [callSessionId]);

    useEffect(() => {
        if (!room) return;

        function handleData(payload: Uint8Array) {
            try {
                const msg = JSON.parse(new TextDecoder().decode(payload));
                if (msg.type === "MATERIAL_UPLOADED") {
                    setMaterials((prev) =>
                        prev.some((m) => m.id === msg.material.id) ? prev : [...prev, msg.material]
                    );
                }
            } catch (err) {
                console.error("Failed to parse file message:", err);
            }
        }

        room.on(RoomEvent.DataReceived, handleData);
        return () => { room.off(RoomEvent.DataReceived, handleData); };
    }, [room]);

    function selectMaterial(id: string) {
        onSelect(id);
        room?.localParticipant?.publishData(
            new TextEncoder().encode(JSON.stringify({ type: "MATERIAL_SELECTED", materialId: id })),
            { reliable: true }
        );
    }

    // Reset PDF page state whenever a different material becomes active
    useEffect(() => {
        setNumPages(null);
        setPageNumber(1);
        setPdfLoadError(null);
    }, [activeMaterialId]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const resolved = resolveFileTypeAndName(file);
        if (!resolved) {
            console.error("Could not determine file type for:", file.name);
            alert("Couldn't read this file's type. Try renaming it with a proper extension (.pdf, .png, .jpg).");
            return;
        }
        const { fileType, fileName } = resolved;

        setIsUploading(true);
        try {
            const res = await fetch(`/api/calls/${callSessionId}/materials/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileType, fileName }),
            });

            const json = await res.json();

            if (!res.ok) {
                console.error("Material upload failed:", json?.error ?? json);
                alert(json?.error ?? "Upload failed. Please try again.");
                return;
            }
            const { uploadUrl, publicUrl } = json.data;

            await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });

            const saveRes = await fetch(`/api/calls/${callSessionId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: publicUrl, fileName: file.name, fileType: file.type }),
            });
            const saveJson = await saveRes.json();
            if (!saveRes.ok) {
                console.error("Save material failed:", saveJson?.error ?? saveJson?.message);
                alert(saveJson?.error ?? saveJson?.message ?? "Failed to save file.");
                return;
            }

            const material = saveJson.data;
            setMaterials((prev) => [...prev, material]);
            selectMaterial(material.id);

            room?.localParticipant?.publishData(
                new TextEncoder().encode(JSON.stringify({ type: "MATERIAL_UPLOADED", material })),
                { reliable: true }
            );
        } catch (err) {
            console.error("Material upload failed: ", err);
        } finally {
            setIsUploading(false);
        }
    }

    const activeMaterial = materials.find((m) => m.id === activeMaterialId);
    const isPdf = activeMaterial?.fileType === "application/pdf";

    return (
        <div className="flex flex-col h-full min-w-0 min-h-0">
            <div className="flex items-center gap-1.5 p-2 border-b border-border overflow-x-auto shrink-0">
                {materials.map((m) => (
                    <Button
                        key={m.id}
                        onClick={() => selectMaterial(m.id)}
                        className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded-xs border cursor-pointer shrink-0",
                            activeMaterialId === m.id ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                        )}
                    >
                        {m.fileType === "application/pdf" ? <FileText className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                        <span className="truncate max-w-[100px]">{m.fileName}</span>
                    </Button>
                ))}
                <Label>
                    {isUploading ? <Loader2 className="h-3 w-2 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Add file
                    <Input type="file" accept="image/*, application/pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
                </Label>
            </div>

            {/* Viewer */}
            <div className="flex-1 min-h-0 min-w-0 relative overflow-auto bg-slate-100">
                {!activeMaterial ? (
                    <p className="text-xs text-muted-foreground p-4">No file selected</p>
                ) : isPdf ? (
                    <div className="flex flex-col items-center h-full">
                        <div className="flex-1 min-h-0 w-full overflow-auto flex justify-center p-2">
                            {pdfLoadError ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">{pdfLoadError}</p>
                                    <a
                                        href={activeMaterial.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline text-blue-600"
                                    >
                                        Open file directly instead
                                    </a>
                                </div>
                            ) : (
                                <Document
                                    file={activeMaterial.fileUrl}
                                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                                    onLoadError={(err) => {
                                        console.error("PDF failed to load:", err);
                                        setPdfLoadError("This PDF couldn't be displayed here.");
                                    }}
                                    loading={
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-6">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading PDF...
                                        </div>
                                    }
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        width={Math.min(700, typeof window !== "undefined" ? window.innerWidth - 32 : 700)}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                    />
                                </Document>
                            )}
                        </div>

                        {numPages && numPages > 1 && !pdfLoadError && (
                            <div className="flex items-center gap-3 p-2 border-t border-border shrink-0 bg-background">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={pageNumber <= 1}
                                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Page {pageNumber} of {numPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={pageNumber >= numPages}
                                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <Zoom>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={activeMaterial.fileUrl}
                                alt={activeMaterial.fileName}
                                className="max-w-full max-h-full object-contain rounded"
                            />
                        </Zoom>
                    </div>
                )}
            </div>
        </div>
    );
}