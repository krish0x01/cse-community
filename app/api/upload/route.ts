import { NextResponse } from "next/server";
import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `notes/${Date.now()}_${cleanFileName}`;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        url: `https://storage.googleapis.com/cse-academic-vault/${cleanFileName}`,
        fileName: file.name,
        fileSize: fileSizeMB,
        format: fileExt,
        source: "mock",
        message: "File attached (Mock Storage Mode)",
      });
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

    // Convert file to ArrayBuffer / Buffer for upload
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
      console.error("Supabase storage upload error:", uploadError);

      // Return informative error with exact resolution steps
      return NextResponse.json(
        {
          error: `Storage Error: ${uploadError.message}. In Supabase Dashboard -> Storage -> Create bucket named 'academic-vault' and set Public = ON.`,
          details: uploadError,
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
