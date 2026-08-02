import { S3Client } from "@aws-sdk/client-s3";


export  const r2Client = new S3Client({
    region: "auto", // R2 doesn't use region but since we're using AWS SDK it requires this field
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
});