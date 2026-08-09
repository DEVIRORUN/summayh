"use client";

import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdFormatSize } from "react-icons/md";
import { cn } from "@/lib/utils";
import { Download, Loader2, UploadCloud, XCircle } from "lucide-react";


interface DeliveryFile {
    id: string;
    fileName: string;
    fileSize: string | number;
}

interface Delivery {
    id: string;
    message: string | null;
    createdAt: string;
    files: DeliveryFile[];
}

interface DeliverySectionProps {
    orderId: string;
    deliveries: Delivery[];
    variant: "seller" | "buyer";
    canSubmit: boolean;
}

type FileStatus = "pending" | "uploading" | "done" | "error";

interface TrackedFile {
    file: File;
    status: FileStatus;
    fileKey?: string;
}

export function DeliverySection({ orderId, deliveries, variant, canSubmit }: DeliverySectionProps) {
    const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    function formatSize(bytes: number | string) {
        const numericBytes = typeof bytes === "string" ? Number(bytes) : bytes;
        if (isNaN(numericBytes) || numericBytes < 1024) return `${numericBytes} B`;
        if (numericBytes < 1024 * 1024) return `${(numericBytes / 1024).toFixed(1)} KB`
        return `${(numericBytes / (1024 *1024)).toFixed(1)} MB`
    }

    function addFiles(newFiles: File[]) {
        setTrackedFiles((prev) => [
            ...prev,
            ...newFiles.map((file) => ({ file, status: "pending" as FileStatus }))
        ]);
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDragDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);
        if(e.dataTransfer.files?.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    }

    
    async function uploadOne(index: number, file: File): Promise<{ fileKey: string; fileName: string; fileSize: number; } | null> {
        setTrackedFiles((prev) => 
            prev.map((tf, i) => (i === index ? { ...tf, status: "uploading" } : tf))
        );

        try {
            const urlRes = await fetch(`/api/orders/${orderId}/deliveries/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type || "application/octet-stream"
                }),
            });
            if (!urlRes.ok) {
                const errData = await urlRes.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || "Failed to get Upload URL")
            } 
            const resData = await urlRes.json();
            const { uploadUrl, fileKey } = resData.data ? resData.data : resData;

            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file
            });
            if (!putRes.ok) throw new Error("Upload failed");

            setTrackedFiles((prev) => 
                prev.map((tf, i) => (i === index ? { ...tf, status: "done", fileKey } : tf))
            )
            return { fileKey, fileName: file.name, fileSize: file.size }
        } catch {
            setTrackedFiles((prev) => 
                prev.map((tf, i) => (i === index ? { ...tf, status: "error" } : tf))
            );
            return null;
        }
    }

    async function handleSubmit() {
        // Generate Url 
        if (trackedFiles.length === 0) {
            setError("Attach at least one file.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            const results = await Promise.all(
                trackedFiles.map((tf, i) => uploadOne(i, tf.file))
            )

            const uploadedFiles = results.filter((r): r is NonNullable<typeof r> => r !== null); // if this el is true trust me r is not null | undefined

            if (uploadedFiles.length === 0) throw new Error("All uploads failed.")
            // 3. Submti teh delivery record
            const submitRes = await fetch(`/api/orders/${orderId}/deliveries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, files: uploadedFiles }),
            });

            if (!submitRes.ok) {
                const errData = await submitRes.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || "Failed to submit delivery")
            }

            // reset + let parent refresh order state
            setTrackedFiles([]);
            setMessage("");
            window.location.reload(); // simplest refresh; swap for router.refresh() if using RSC revalidation
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }

    }

    async function handleDownload(fileId: string, fileName: string) {
        setDownloadingId(fileId);
        try {
            const res = await fetch(`/api/orders/${orderId}/deliveries/download-url?fileId=${fileId}`);
            if (!res.ok) throw new Error("Failed to get download URL");
            const resData = await res.json();
            const data = resData.data ? resData.data : resData;

            const a = document.createElement("a");
            a.href = data.downloadUrl;
            a.download = fileName;
            a.click();
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to download file")
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <div className="w-full border rounded-md p-4 flex flex-col gap-4">
            <h3 className="text-sm font-medium">Deliveries</h3>

            {error && <p className="text-xs text-red-500">{error}</p>}
            
            {variant === "seller" && canSubmit && (
                <div className="flex flex-col gap-2 border-b pb-4">
                    <Textarea
                        placeholder="Add a message about this delivery.."
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="text-sm"
                    />
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDragDrop}
                        className={cn("border border-dashed rounded-lg p-6 text-center transition-colors bg-white/50",
                            isDragging ? "border-primary bg-muted/50" : ""
                        )}>   
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            onChange={(e) => {
                                addFiles(Array.from(e.target.files || []))
                                if (inputRef.current) inputRef.current.value = ""
                            }}
                            className="hidden"
                        />
                        <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground"/>
                        <p className="text-sm mt-2">Drag file here or</p>
                        <Button variant="outline" size="sm" className="mt-2 cursor-pointer" onClick={() => inputRef.current?.click()}>
                            Browse files
                        </Button>
                        <p className="text-xs mt-1 text-muted-foreground">Up to 10</p>
                        
                        {trackedFiles.length > 0 && (
                            <ul className="text-xs text-left mt-3 flex flex-col gap-1">
                                {trackedFiles.map((tf, i) => (
                                    <li 
                                        key={tf.file.name}
                                        className="flex items-center justify-between border rounded-sm px-2 py-1"    
                                    >
                                        <span className="truncate">
                                            {tf.file.name} ({formatSize(tf.file.size)})
                                        </span>
                                        <span className="shrink-0 ml-2">
                                            {tf.status === "pending" && (
                                                <span className="text-muted-foreground">Waiting</span>
                                            )}
                                            {tf.status === "uploading" && (
                                                <span className="w-4 h-4 animate-spin text-muted-foreground">Waiting</span>
                                            )}
                                            {tf.status === "done" && (
                                                <span className="w-4 h-4 text-green-500">Waiting</span>
                                            )}
                                            {tf.status === "error" && (
                                                <XCircle className="w-4 h-4 text-red-500"/>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={mounted ? Boolean(isSubmitting || trackedFiles.length === 0) : true}
                        suppressHydrationWarning
                        className="w-fit cursor-pointer"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Uploading...
                            </span>
                        ) : (
                            "Submit delivery"
                        )}
                    </Button>
                </div>
            )}

            {deliveries.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    {variant === "buyer" ? "No deliveries yet." : "No deliveries submitted yet."}
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {deliveries.map((delivery) => (
                        <li key={delivery.id} className="flex flex-col gap-1">
                            <p className="text-xs text-muted-foreground">
                                {new Date(delivery.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                            </p>
                            {delivery.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex justify-between items-center text-sm border rounded-sm px-2 py-1"
                                >
                                    <span className="truncate">{file.fileName}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-muted-foreground">
                                            {formatSize(file.fileSize)}
                                        </span>
                                        <Button
                                            variant="outline"
                                            className="w-fit cursor-pointer"
                                            size="sm"
                                            onClick={() => handleDownload(file.id, file.fileName)}
                                            disabled={mounted && Boolean(downloadingId === file.id)}
                                        >
                                            {downloadingId === file.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Download className="w-3.5 h-3.5"/>
                                                    Download
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {delivery.message && (
                                <p className="text-sm text-muted-foreground">{delivery.message}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}