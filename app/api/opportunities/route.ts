import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_OPPORTUNITIES } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const search = searchParams.get("search");

    if (!isSupabaseConfigured() || !supabase) {
      let data = [...MOCK_OPPORTUNITIES];
      if (type && type !== "All Types") {
        data = data.filter((o) => o.type === type);
      }
      if (location && location !== "All Locations") {
        data = data.filter((o) => o.location === location);
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((o) => o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q));
      }
      return NextResponse.json({ data, source: "mock" });
    }

    let query = supabase.from("opportunities").select("*");

    if (type && type !== "All Types") {
      query = query.eq("type", type);
    }
    if (location && location !== "All Locations") {
      query = query.eq("location", location);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data, error } = await query.order("is_featured", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch opportunities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      company,
      type,
      location,
      stipendPrize,
      deadline,
      applyUrl,
      description,
      eligibility,
      tags,
    } = body;

    if (!title || !company || !applyUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(/\s+/).filter(Boolean)
      : [];

    if (!isSupabaseConfigured() || !supabase) {
      const mockOpp = {
        id: `opp-${Date.now()}`,
        title: title.trim(),
        company: company.trim(),
        type: type || "Hackathon",
        location: location || "Remote",
        stipendOrPrize: stipendPrize || "Exciting Prizes",
        deadline: deadline || "Upcoming",
        daysRemaining: 14,
        tags: parsedTags,
        description: description || "",
        eligibility: eligibility || "Open to all students",
        applyUrl,
        isFeatured: false,
      };
      return NextResponse.json({ data: mockOpp, source: "mock", message: "Opportunity posted successfully" });
    }

    const { data, error } = await supabase
      .from("opportunities")
      .insert([
        {
          title: title.trim(),
          company: company.trim(),
          type: type || "Hackathon",
          location: location || "Remote",
          stipend_prize: stipendPrize || "Exciting Prizes",
          deadline: deadline || "Upcoming",
          tags: parsedTags,
          description: description || "",
          eligibility: eligibility || "Open to all students",
          apply_url: applyUrl,
          is_featured: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, source: "supabase", message: "Opportunity posted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post opportunity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
