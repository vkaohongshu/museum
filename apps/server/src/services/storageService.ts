import { randomUUID } from "node:crypto";
import { S3Client, CreateBucketCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";

const s3 = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  }
});

let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: config.s3.bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: config.s3.bucket }));
  }
  bucketReady = true;
}

export async function uploadImage(file: Express.Multer.File, userId: string, scope = "images") {
  await ensureBucket();
  const extension = file.originalname.split(".").pop() ?? "bin";
  const key = `uploads/${userId}/${scope}/${randomUUID()}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: encodeURIComponent(file.originalname)
      }
    })
  );
  return {
    url: `${config.apiBaseUrl.replace(/\/$/, "")}/media/${key}`,
    key,
    bucket: config.s3.bucket,
    contentType: file.mimetype
  };
}

export async function getStoredImage(key: string) {
  const result = await s3.send(new GetObjectCommand({ Bucket: config.s3.bucket, Key: key }));
  return {
    body: result.Body,
    contentType: result.ContentType,
    contentLength: result.ContentLength,
    cacheControl: result.CacheControl
  };
}
