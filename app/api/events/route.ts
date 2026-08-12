import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeAll = searchParams.get("all") === "true" || searchParams.get("includePending") === "true";

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ data: [], source: "supabase", isConnected: false });
    }

    let query = supabase.from("events").select("*");

    if (!includeAll) {
      query = query.or("is_approved.eq.true,status.eq.APPROVED");
    }

    if (category && category !== "All Events") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,speaker_name.ilike.%${search}%`);
    }

    let { data, error } = await query.order("created_at", { ascending: false });

    // Graceful fallback if is_approved column doesn't exist yet
    if (error && (error.message?.includes("is_approved") || error.message?.includes("schema cache"))) {
      let fallbackQuery = supabase.from("events").select("*");
      if (category && category !== "All Events") fallbackQuery = fallbackQuery.eq("category", category);
      if (search) fallbackQuery = fallbackQuery.or(`title.ilike.%${search}%,speaker_name.ilike.%${search}%`);
      const fallbackRes = await fallbackQuery.order("created_at", { ascending: false });
      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) throw error;

    interface RawEvent {
      id: string;
      title: string;
      category: string;
      date: string;
      time: string;
      venue: string;
      is_online?: boolean;
      isOnline?: boolean;
      speaker_name?: string;
      speaker_role?: string;
      speaker_company?: string;
      speaker?: {
        name: string;
        role: string;
        company: string;
        avatar?: string;
      };
      registered_count?: number;
      registeredCount?: number;
      total_seats?: number;
      totalSeats?: number;
      tags?: string[];
      description?: string;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      is_approved?: boolean;
      isApproved?: boolean;
    }

    const normalized = (data as RawEvent[]).map((e) => {
      const d = new Date(e.date || Date.now());
      const month = !isNaN(d.getTime())
        ? d.toLocaleString("en-US", { month: "short" }).toUpperCase()
        : "OCT";
      const day = !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, "0") : "24";

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        month,
        day,
        time: e.time,
        venue: e.venue,
        isOnline: e.is_online ?? e.isOnline ?? false,
        speaker: e.speaker || {
          name: e.speaker_name || "Guest Speaker",
          role: e.speaker_role || "Tech Lead",
          company: e.speaker_company || "CSE Community",
        },
        totalSeats: e.total_seats ?? e.totalSeats ?? 100,
        registeredCount: e.registered_count ?? e.registeredCount ?? 0,
        tags: e.tags || [],
        description: e.description || "",
        status: e.status || (e.is_approved ? "APPROVED" : "PENDING"),
        isApproved: e.is_approved ?? (e.status === "APPROVED" || Boolean(e.isApproved)),
      };
    });

    return NextResponse.json({ data: normalized, source: "supabase", isConnected: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch events";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      date,
      time,
      venue,
      isOnline,
      speakerName,
      speakerRole,
      speakerCompany,
      description,
    } = body;

    if (!title || !date || !venue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      const mockEvent = {
        id: `evt-${Date.now()}`,
        title: title.trim(),
        category: category || "Workshop",
        date: date || "Upcoming",
        month: "TBA",
        day: "01",
        time: time || "5:00 PM",
        venue: venue || "Campus",
        isOnline: Boolean(isOnline),
        speaker: {
          name: speakerName || "Guest Speaker",
          role: speakerRole || "Developer",
          company: speakerCompany || "Tech Community",
        },
        totalSeats: 100,
        registeredCount: 1,
        description: description || "",
        tags: [],
        status: "PENDING" as const,
        isApproved: false,
      };
      return NextResponse.json({
        data: mockEvent,
        source: "mock",
        isConnected: false,
        message: "🛡️ Campus event submitted for moderator authorization! It will go live once approved by the Council.",
      });
    }

    let insertRes = await supabase
      .from("events")
      .insert([
        {
          title: title.trim(),
          category: category || "Workshop",
          date: date || "Upcoming",
          month: "TBA",
          day: "01",
          time: time || "5:00 PM",
          venue: venue || "Campus",
          is_online: Boolean(isOnline),
          speaker_name: speakerName || "Guest Speaker",
          speaker_role: speakerRole || "Developer",
          speaker_company: speakerCompany || "Tech Community",
          total_seats: 100,
          registered_count: 1,
          description: description || "",
          status: "PENDING",
          is_approved: false,
        },
      ])
      .select()
      .single();

    // Fallback if is_approved / status column hasn't been added yet
    if (
      insertRes.error &&
      (insertRes.error.message?.includes("is_approved") ||
        insertRes.error.message?.includes("status") ||
        insertRes.error.message?.includes("schema cache"))
    ) {
      insertRes = await supabase
        .from("events")
        .insert([
          {
            title: title.trim(),
            category: category || "Workshop",
            date: date || "Upcoming",
            month: "TBA",
            day: "01",
            time: time || "5:00 PM",
            venue: venue || "Campus",
            is_online: Boolean(isOnline),
            speaker_name: speakerName || "Guest Speaker",
            speaker_role: speakerRole || "Developer",
            speaker_company: speakerCompany || "Tech Community",
            total_seats: 100,
            registered_count: 1,
            description: description || "",
          },
        ])
        .select()
        .single();
    }

    if (insertRes.error) {
      return NextResponse.json(
        { error: `Supabase database error: ${insertRes.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: insertRes.data,
      source: "supabase",
      isConnected: true,
      message: "🛡️ Campus event submitted for moderator authorization! It will go live once approved by the Council.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
