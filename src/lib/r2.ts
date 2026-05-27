import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

function r2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.CF_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
    },
  });
}

/** Converts a stored proxy URL like /api/image/uploads/foo.jpg → R2 key uploads/foo.jpg */
function urlToKey(url: string): string | null {
  const prefix = "/api/image/";
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function deleteFromR2(urls: string[]): Promise<void> {
  const keys = urls.map(urlToKey).filter((k): k is string => k !== null);
  if (!keys.length) return;

  await r2Client().send(
    new DeleteObjectsCommand({
      Bucket: process.env.CF_R2_BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}
