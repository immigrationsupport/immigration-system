import "server-only";

import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET;

    if (!region) {
        throw new Error("AWS_REGION is not configured.");
    }

    if (!bucket) {
        throw new Error("AWS_S3_BUCKET is not configured.");
    }

    return { region, bucket };
}

function getS3Client() {
    const region = process.env.AWS_REGION;

    if (!region) {
        throw new Error("AWS_REGION is not configured.");
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    return new S3Client({
        region,
        credentials:
            accessKeyId && secretAccessKey
                ? {
                      accessKeyId,
                      secretAccessKey,
                  }
                : undefined,
    });
}

export async function createS3UploadUrl(
    key: string,
    contentType: string
) {
    const { bucket } = getS3Config();
    const s3 = getS3Client();

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300,
        signableHeaders: new Set(["content-type"]),
    });
}

export async function createS3DownloadUrl(key: string) {
    const { bucket } = getS3Config();
    const s3 = getS3Client();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return getSignedUrl(s3, command, {
        expiresIn: 300,
    });
}

export async function checkS3ObjectExists(key: string) {
    const { bucket } = getS3Config();
    const s3 = getS3Client();

    try {
        await s3.send(
            new HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        );

        return true;
    } catch {
        return false;
    }
}

export async function deleteS3Object(key: string) {
    const { bucket } = getS3Config();
    const s3 = getS3Client();

    await s3.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );
}