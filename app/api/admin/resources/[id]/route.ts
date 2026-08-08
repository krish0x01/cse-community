import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resourceId = params.id;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, id: resourceId, source: "mock" });
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Resource removed", source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resourceId = params.id;
    const body = await request.json();
    const { verified } = body;

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, id: resourceId, verified, source: "mock" });
    }

    const { data, error } = await supabase
      .from("resources")
      .update({ verified: Boolean(verified) })
      .eq("id", resourceId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
