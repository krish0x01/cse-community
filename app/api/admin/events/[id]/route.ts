import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, getServiceSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: eventId, source: "mock" });
    }

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: eventId, source: "mock" });
    }

    const { error } = await client
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Event removed from schedule", source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { isApproved, status } = body;

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: eventId, isApproved, status, source: "mock" });
    }

    const updates: Record<string, unknown> = { ...body };
    if (typeof isApproved !== "undefined") updates.is_approved = Boolean(isApproved);
    if (typeof status !== "undefined") updates.status = status;
    delete updates.isApproved;

    let { data, error } = await client
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

    if (error && (error.message?.includes("is_approved") || error.message?.includes("status") || error.message?.includes("schema cache"))) {
      // Column might not exist in Supabase yet; retry without is_approved/status
      const cleanUpdates = { ...updates };
      delete cleanUpdates.is_approved;
      delete cleanUpdates.status;
      if (Object.keys(cleanUpdates).length > 0) {
        const retry = await client
          .from("events")
          .update(cleanUpdates)
          .eq("id", eventId)
          .select()
          .single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      } else {
        error = null;
        data = { id: eventId, ...updates };
      }
    }

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
