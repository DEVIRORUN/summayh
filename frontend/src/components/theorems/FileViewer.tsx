"use client";

import React, { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { Button } from "../ui/button";
import { FileText, ImageIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { resolveFileTypeAndName } from "@/lib/file-validation";


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
                console.error("Failed to parse file message:", err)
            }
        }

        room.on(RoomEvent.DataReceived, handleData);
        return () => { room.off(RoomEvent.DataReceived, handleData) }
    }, [room])
    
        function selectMaterial(id: string) {
            onSelect(id); // pushes up to paarent - a single source of truth
            room?.localParticipant?.publishData(
                new TextEncoder().encode(JSON.stringify({ type: "MATERIAL_SELECTED", materialId: id })),
                { reliable: true }
            );
        }

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

            const  saveRes = await fetch(`/api/calls/${callSessionId}/materials`, {
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
            selectMaterial(material.id)

            room?.localParticapant?.publishData(
                new TextEncoder().encode(JSON.stringify({ type: "MATERIAL_UPLOADED", material })),
                { reliable: true }
            )
        } catch (err) {
            console.error("Material upload failed: ", err);
        } finally {
            setIsUploading(false);
        }
    }

    const activeMaterial = materials.find((m) => m.id === activeMaterialId);

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
                    {isUploading ? <Loader2 className="h-3 w-2 animate-spin"/> : <Upload className="h-3 w-3"/>}
                    Add file
                    <Input type="file" accept="image/*, application/pdf" className="hidden" onChange={handleUpload} disabled={isUploading}/>
                </Label>
            </div>

            {/* Viewer */}
            <div className="flex-1 min-h-0 relative">
                {!activeMaterial ? (
                    <p className="text-xs text-muted-foreground">No file seleceted</p>
                ) : activeMaterial.fileType === "application/pdf" ? (
                    <iframe src={activeMaterial.fileUrl} className="w-full h-full" title={activeMaterial.fileName}/>
                ) : (
                    <Image src={activeMaterial.fileUrl} alt={activeMaterial.fileName} fill className="max-w-full max-h-full object-contain" />
                )}
            </div>
        </div>
    );
}