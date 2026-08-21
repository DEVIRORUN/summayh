import { PutObjectCommand, HeadObjectCommand, DeleteObjectCommand, DeleteBucketLifecycle$ } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { r2Client } from "../utils/r2Client";
import { UPLOAD_POLICIES, UploadPolicyKey } from "../utils/policies";

export class UploadService {
    static async getUploadUrl(userId: string, policyKey: UploadPolicyKey, fileType: string) {
        const policy = UPLOAD_POLICIES[policyKey];

        if (!(policy.mimeTypes as readonly string[]).includes(fileType)) {
            throw new Error(`Unsupported file type for ${policyKey}: ${fileType}`);
        }

        const extension = fileType.split("/")[1];
        const key = `${policy.prefix}/${userId}/${Date.now()}-${randomUUID()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return { uploadUrl, publicUrl, key, maxSizeBytes: policy.maxSizeBytes };
    }

    static async veifyUpload(userId: string, policyKey: UploadPolicyKey, publicUrl: string) {
        const policy = UPLOAD_POLICIES[policyKey];
        const expectedPrefix = `${process.env.R2_PUBLIC_URL}/${policy.prefix}${userId}`

        if (!publicUrl.startsWith(expectedPrefix)) {
            throw new Error("File URL does not match expected upload location.");
        }

        const key = publicUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");

        let head;
        try {
            head = await r2Client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
        } catch {
            throw new Error("Uploaded file not found. Upload may have failed.");
        }

        if (!head.ContentLength || head.ContentLength > policy.maxSizeBytes) {
            throw new Error(`File exceeds maximum size of ${policy.maxSizeBytes / (1024 * 1024)}MB.`);
        }

        if (!head.ContentType && !policy.mimeTypes.includes(head.ContentType)) {
            throw new Error("Uploaded file type does not match allowed types.");
        }

        return { key, size: head.ContentLength, contentType: head.ContentType }
    }

    static async deleteFile(publicUrl: string) {
        const key = publicUrl.replace(`${process.env.R2_PUBLIC_URL}/`, "");
        await r2Client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })).catch((err) => {
            console.error("Failed to delete R2 object:", key, err);
        })
    }
}
