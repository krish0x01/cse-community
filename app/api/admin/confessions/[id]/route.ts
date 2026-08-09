import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, getServiceSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const confessionId = params.id;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: confessionId, source: "mock" });
    }

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: confessionId, source: "mock" });
    }

    const { error } = await client
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
    const { isTrending, status, isApproved } = body;

    const updates: Record<string, unknown> = {};
    if (isTrending !== undefined) {
      updates.is_trending = Boolean(isTrending);
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (isApproved !== undefined) {
      updates.is_approved = Boolean(isApproved);
      if (status === undefined) {
        updates.status = isApproved ? "APPROVED" : "PENDING";
      }
    }

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({
        success: true,
        id: confessionId,
        updates,
        source: "mock",
      });
    }

    const { data, error } = await client
      .from("confessions")
      .update(updates)
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
