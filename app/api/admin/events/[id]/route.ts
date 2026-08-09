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

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: eventId, source: "mock" });
    }

    const { data, error } = await client
      .from("events")
      .update(body)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
