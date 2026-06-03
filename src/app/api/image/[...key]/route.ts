import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

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
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  // Only images under "uploads/" are public; everything else requires admin auth.
  if (!objectKey.startsWith("uploads/")) {
    const token = request.cookies.get("oc_admin")?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const response = await r2Client().send(
      new GetObjectCommand({
        Bucket: process.env.CF_R2_BUCKET,
        Key: objectKey,
      })
    );

    const body = await response.Body?.transformToByteArray();
    if (!body) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(Buffer.from(body), {
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
