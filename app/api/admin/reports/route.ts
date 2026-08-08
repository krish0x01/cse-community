import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      const mockReports = [
        {
          id: "rep-1",
          post_url: "/confessions#conf-5",
          reason: "Rule #1: Harassment or Personal Attack",
          details: "Mentions specific professor name in complaint.",
          status: "PENDING_REVIEW",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "rep-2",
          post_url: "/resources#res-2",
          reason: "Rule #3: Plagiarism / Malicious File Link",
          details: "Page 4 has watermark from another coaching center.",
          status: "PENDING_REVIEW",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      return NextResponse.json({ reports: mockReports, source: "mock" });
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reports: data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing report id or status" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, id, status, source: "mock" });
    }

    const { data, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
