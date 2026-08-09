import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, getServiceSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const oppId = params.id;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, id: oppId, source: "mock" });
    }

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: oppId, source: "mock" });
    }

    const { error } = await client
      .from("opportunities")
      .delete()
      .eq("id", oppId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Opportunity deleted from database", source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete opportunity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const oppId = params.id;
    const body = await request.json();
    const { isFeatured, isApproved, status } = body;

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: oppId, isFeatured, isApproved, status, source: "mock" });
    }

    const updates: Record<string, unknown> = {};
    if (typeof isFeatured !== "undefined") updates.is_featured = Boolean(isFeatured);
    if (typeof isApproved !== "undefined") updates.is_approved = Boolean(isApproved);
    if (typeof status !== "undefined") updates.status = status;

    let { data, error } = await client
      .from("opportunities")
      .update(updates)
      .eq("id", oppId)
      .select()
      .single();

    if (error && (error.message?.includes("is_approved") || error.message?.includes("status") || error.message?.includes("schema cache"))) {
      const cleanUpdates = { ...updates };
      delete cleanUpdates.is_approved;
      delete cleanUpdates.status;
      if (Object.keys(cleanUpdates).length > 0) {
        const retry = await client
          .from("opportunities")
          .update(cleanUpdates)
          .eq("id", oppId)
          .select()
          .single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      } else {
        error = null;
        data = { id: oppId, ...updates };
      }
    }

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update opportunity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
