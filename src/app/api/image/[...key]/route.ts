import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  try {
    const result = await r2Client().send(
      new GetObjectCommand({
        Bucket: process.env.CF_R2_BUCKET,
        Key: objectKey,
      })
    );

    const body = result.Body as Readable;
    const chunks: Uint8Array[] = [];
    for await (const chunk of body) {
      chunks.push(chunk);
    }

    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        "Content-Type": result.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
