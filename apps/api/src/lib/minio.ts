import { Client as MinioClient, type UploadedObjectInfo } from "minio";

const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
const port = parseInt(process.env.MINIO_PORT ?? "9000", 10);
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKey = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const secretKey = process.env.MINIO_SECRET_KEY ?? "minioadmin";

export const minio = new MinioClient({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

const BUCKETS = {
  avatars: "avatars",
  logos: "logos",
  documents: "documents",
  images: "images",
} as const;

type BucketName = keyof typeof BUCKETS;

export async function ensureBuckets(): Promise<void> {
  for (const bucket of Object.values(BUCKETS)) {
    const exists = await minio.bucketExists(bucket).catch(() => false);
    if (!exists) {
      await minio.makeBucket(bucket);
      console.log(`[MinIO] Created bucket: ${bucket}`);
    }
  }
}

export async function uploadFile(
  bucket: BucketName,
  objectName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await ensureBuckets();
  const bucketName = BUCKETS[bucket];
  await minio.putObject(bucketName, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });
  return `${bucketName}/${objectName}`;
}

export async function getSignedUrl(
  bucket: BucketName,
  objectName: string,
  expirySeconds = 3600
): Promise<string> {
  const bucketName = BUCKETS[bucket];
  return minio.presignedGetObject(bucketName, objectName, expirySeconds);
}

export async function deleteFile(bucket: BucketName, objectName: string): Promise<void> {
  const bucketName = BUCKETS[bucket];
  await minio.removeObject(bucketName, objectName);
}

export function parseObjectPath(path: string): { bucket: BucketName; objectName: string } | null {
  const [bucket, ...rest] = path.split("/");
  if (!bucket || !rest.length) return null;
  const objectName = rest.join("/");
  if (bucket in BUCKETS) {
    return { bucket: bucket as BucketName, objectName };
  }
  return null;
}

export { BUCKETS };
