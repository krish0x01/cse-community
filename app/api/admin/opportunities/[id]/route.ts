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
    const { isFeatured } = body;

    const client = getServiceSupabase() || supabase;
    if (!client) {
      return NextResponse.json({ success: true, id: oppId, isFeatured, source: "mock" });
    }

    const { data, error } = await client
      .from("opportunities")
      .update({ is_featured: Boolean(isFeatured) })
      .eq("id", oppId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update opportunity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
