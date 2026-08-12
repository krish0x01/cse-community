import { NextResponse } from "next/server";
import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  sanitizeString,
} from "@/lib/security";

const DISALLOWED_EXTENSIONS = [
  "EXE",
  "DLL",
  "SH",
  "BAT",
  "CMD",
  "JS",
  "MJS",
  "PHP",
  "PY",
  "HTML",
  "HTM",
  "SVG",
  "VBS",
  "PS1",
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 5 file uploads per 10 minutes per IP
    const limit = checkRateLimit(`upload_file_${ip}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. File Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum allowed size of 15 MB." },
        { status: 400 }
      );
    }

    // 2. Extension Validation & Path Traversal Prevention
    const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
    if (DISALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: `Executable or script file formats (.${fileExt}) are strictly prohibited.` },
        { status: 400 }
      );
    }

    const rawName = file.name.replace(/\\/g, "/").split("/").pop() || "upload";
    const cleanFileName = sanitizeString(rawName.replace(/[^a-zA-Z0-9.-]/g, "_"));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const filePath = `notes/${Date.now()}_${cleanFileName}`;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase storage is not configured in .env.local" },
        { status: 400 }
      );
    }

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 });
    }

    // Attempt to auto-create bucket if missing
    try {
      const { data: buckets } = await client.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === "academic-vault" || b.id === "academic-vault");
      if (!hasBucket) {
        await client.storage.createBucket("academic-vault", {
          public: true,
        });
      }
    } catch {
      // Continue if bucket listing is restricted
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage 'academic-vault' bucket
    const { data: uploadData, error: uploadError } = await client.storage
      .from("academic-vault")
      .upload(filePath, buffer, {
        contentType: file.type || "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: `Storage Error: ${uploadError.message}. In Supabase Dashboard -> Storage -> Create bucket named 'academic-vault' and set Public = ON.`,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = client.storage
      .from("academic-vault")
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: fileSizeMB,
      format: fileExt,
      source: "supabase",
      message: "🎉 File uploaded successfully to Supabase Storage!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
