import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  sanitizeString,
  containsPrivateInformation,
} from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ comments: [], source: "supabase" });
    }

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("confession_id", confessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 10 comments per minute per IP
    const limit = checkRateLimit(`post_comment_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const confessionId = params.id;
    const body = await request.json();
    const author = sanitizeString(body?.author || "AnonymousEngineer");
    const text = sanitizeString(body?.text || "");

    if (!text) {
      return NextResponse.json({ error: "Comment text cannot be empty." }, { status: 400 });
    }

    if (author.length > 40) {
      return NextResponse.json({ error: "Author alias must be 40 characters or less." }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: "Comment text must be 500 characters or less." }, { status: 400 });
    }

    // Privacy & Anti-Doxxing filter
    const privacyCheck = containsPrivateInformation(text) || containsPrivateInformation(author);
    if (privacyCheck.containsPrivate) {
      return NextResponse.json(
        { error: `Comment blocked: ${privacyCheck.reason}` },
        { status: 422 }
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Supabase not configured in .env.local" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          confession_id: confessionId,
          author: author || "AnonymousEngineer",
          text: text.trim(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
