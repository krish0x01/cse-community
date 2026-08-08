import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, id: confessionId, source: "mock" });
    }

    const { error } = await supabase
      .from("confessions")
      .delete()
      .eq("id", confessionId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Confession deleted from database", source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete confession";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;
    const body = await request.json();
    const { isTrending } = body;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, id: confessionId, isTrending, source: "mock" });
    }

    const { data, error } = await supabase
      .from("confessions")
      .update({ is_trending: Boolean(isTrending) })
      .eq("id", confessionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update confession";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
