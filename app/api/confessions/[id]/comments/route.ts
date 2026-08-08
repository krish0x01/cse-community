import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ comments: [], source: "mock" });
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
    const confessionId = params.id;
    const body = await request.json();
    const { author, text } = body;

    if (!text) {
      return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      const mockComment = {
        id: `c-${Date.now()}`,
        author: author || "AnonymousEngineer",
        text: text.trim(),
        timestamp: "Just now",
      };
      return NextResponse.json({ data: mockComment, source: "mock" });
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
