import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

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

export async function POST(request: NextRequest) {
  const token = request.cookies.get("oc_admin")?.value;
  if (!token || !(await verifySession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, and AVIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2Client().send(
    new PutObjectCommand({
      Bucket: process.env.CF_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return NextResponse.json({ url: `/api/image/${key}` });
}
