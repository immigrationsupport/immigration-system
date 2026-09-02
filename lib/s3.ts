import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

if (!region) {
    throw new Error("AWS_REGION is not configured.");
}

if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not configured.");
}

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

export { s3 };

export async function createS3UploadUrl(
    key: string,
    contentType: string
) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300,
        signableHeaders: new Set(["content-type"])
    });
}

export async function createS3DownloadUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300
    });
}

export async function deleteS3Object(key: string) {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        })
    );
}