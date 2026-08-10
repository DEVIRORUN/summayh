const EXTENSION_MIME_FALLBACK: Record<string, string> = {
    pdf: "application/pdf",
    png: "images/png",
    jpg: "images/jpg",
    jpeg: "images/jpeg",
    webp: "images/webp",
    heic: "images/heic",
    gif: "images/gif",
};

export function resolveFileTypeAndName(file: File): { fileType: string; fileName: string } | null {
    const fileName = file.name?.trim();
    if (!fileName || !fileName.includes(".")) return null; // no usable/extension

    let fileType = file.type?.trim()

    if (!fileType) {
        const ext = fileName.split(".").pop()?.toLowerCase();
        fileType = ext ? EXTENSION_MIME_FALLBACK[ext] : "";
    }

    if (!fileType) return null; // could not resolve - let reject


    return { fileType, fileName }
}