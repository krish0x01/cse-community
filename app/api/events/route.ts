import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_EVENTS } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (!isSupabaseConfigured() || !supabase) {
      let data = [...MOCK_EVENTS];
      if (category && category !== "All Events") {
        data = data.filter((e) => e.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((e) => e.title.toLowerCase().includes(q) || e.speaker.name.toLowerCase().includes(q));
      }
      return NextResponse.json({ data, source: "mock" });
    }

    let query = supabase.from("events").select("*");

    if (category && category !== "All Events") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,speaker_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ data, source: "supabase" });
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
      };
      return NextResponse.json({ data: mockEvent, source: "mock", message: "Event registered successfully" });
    }

    const { data, error } = await supabase
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

    if (error) throw error;

    return NextResponse.json({ data, source: "supabase", message: "Event registered successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
