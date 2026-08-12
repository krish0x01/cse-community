import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  sanitizeString,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 5 violation reports per 10 minutes per IP
    const limit = checkRateLimit(`submit_report_${ip}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const body = await request.json();
    const postUrl = sanitizeString(body?.postUrl || "");
    const reason = sanitizeString(body?.reason || "");
    const details = sanitizeString(body?.details || "");

    if (!postUrl || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (details.length > 1000) {
      return NextResponse.json({ error: "Details must be 1000 characters or less." }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: true,
        source: "supabase",
        message: "Report received and queued for moderation review.",
      });
    }

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          post_url: postUrl.trim(),
          reason,
          details,
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
