import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  sanitizeString,
} from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const semester = searchParams.get("semester");
    const search = searchParams.get("search");

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ data: [], source: "supabase", isConnected: false });
    }

    let query = supabase.from("resources").select("*");

    if (category && category !== "All Resources") {
      query = query.eq("category", category);
    }
    if (semester && semester !== "All Semesters") {
      query = query.ilike("semester", `%${semester}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,subject_code.ilike.%${search}%,subject_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order("downloads", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 5 resource uploads per 5 minutes per IP
    const limit = checkRateLimit(`post_resource_${ip}`, 5, 5 * 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const body = await request.json();
    const title = sanitizeString(body?.title || "");
    const subjectCode = sanitizeString(body?.subjectCode || "").toUpperCase();
    const subjectName = sanitizeString(body?.subjectName || "Computer Science");
    const semester = sanitizeString(body?.semester || "Semester 5");
    const category = sanitizeString(body?.category || "Notes");
    const author = sanitizeString(body?.author || "Student Contributor");
    const linkUrl = sanitizeString(body?.linkUrl || "");
    const description = sanitizeString(body?.description || "");

    if (!title || !subjectCode || !linkUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // URL Validation (must begin with http:// or https://)
    if (!/^https?:\/\/.+/i.test(linkUrl)) {
      return NextResponse.json({ error: "Invalid link URL. Must start with http:// or https://" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Supabase database is not configured in .env.local" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resources")
      .insert([
        {
          title: title.trim(),
          subject_code: subjectCode.trim(),
          subject_name: subjectName,
          semester,
          category,
          author,
          verified: true,
          format: "PDF",
          file_size: "5.0 MB",
          downloads: 0,
          rating: 5.0,
          link_url: linkUrl,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, source: "supabase", message: "Resource contributed successfully!" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
