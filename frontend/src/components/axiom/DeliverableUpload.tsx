import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import React, { useRef, useState } from "react";

interface DeliverableUploadProps {
    onUpload: (files: File[]) => void;
    uploadedFiles?: { name: string; url: string }[];
    maxFiles?: number;
}

export function DeliverableUplaod({ onUpload, uploadedFiles = [], maxFiles }: DeliverableUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) onUpload(Array.from(e.target.files));
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(Array.from(e.dataTransfer.files));

            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-6 text-center">
                <input ref={inputRef} type="file" multiple hidden onChange={handleChange}/>
                <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm mt-2">Drag file here or</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => inputRef.current?.click()}>
                    Browse files
                </Button>
                <p className="text-xs mt-1 text-muted-foreground">Up to {maxFiles}</p>

                {uploadedFiles.length > 0 && (
                    <div className="flex flex-col gap-1 mt-4 text-left">
                        {uploadedFiles.map((f, i) => (
                            <a key={i} href={f.url} className="text-xs text-blue-600 underline truncate">{f.name}</a>
                        ))}
                    </div>
                )}
        </div>
    )
}