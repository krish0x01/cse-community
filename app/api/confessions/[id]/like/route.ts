import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;
    const { increment } = await request.json().catch(() => ({ increment: 1 }));

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, source: "mock", id: confessionId });
    }

    const { data: current, error: fetchError } = await supabase
      .from("confessions")
      .select("likes")
      .eq("id", confessionId)
      .single();

    if (fetchError) throw fetchError;

    const newLikes = Math.max(0, (current?.likes || 0) + (increment || 1));

    const { data, error } = await supabase
      .from("confessions")
      .update({ likes: newLikes })
      .eq("id", confessionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, likes: data.likes, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update like";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
