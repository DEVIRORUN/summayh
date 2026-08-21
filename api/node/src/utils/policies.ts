export const UPLOAD_POLICIES = {
    AVATAR: {
        prefix: "avatars",
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
        maxSizeBytes: 5 * 1024 * 1024,
        scope: "user"
    },
    GIG_GALLERY: {
        prefix: "gigs/gallery",
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mov"],
        maxSizeBytes: 50 * 1024 * 1024,
        scope: "user"
    },
    REQUIREMENTS_FILE: {
        prefix: "requirements",
        mimeTypes: ["image/jpeg", "image/png", "application/pdf", "application/zip"],
        maxSizeBytes: 25 * 1024 * 1024,
        scope: "user"
    },
    DELIVERY_FILE: {
        prefix: "deliveries",
        mimeTypes: ["image/jpeg", "image/png", "application/pdf", "application/zip", "video/mp4"],
        maxSizeBytes: 100 * 1024 * 1024,
        scope: "user"
    },
} as const;

export type UploadPolicyKey = keyof typeof UPLOAD_POLICIES;

export function isValidPolicyKey(key: string): key is UploadPolicyKey {
    return key in UPLOAD_POLICIES;
}