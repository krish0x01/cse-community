import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postUrl, reason, details } = body;

    if (!postUrl || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: true,
        source: "mock",
        message: "Report received and queued for moderation review.",
      });
    }

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          post_url: postUrl.trim(),
          reason,
          details: details || "",
          status: "PENDING_REVIEW",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      source: "supabase",
      message: "Report received and queued for moderation review.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
