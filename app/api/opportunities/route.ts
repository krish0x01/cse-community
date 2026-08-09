import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_OPPORTUNITIES } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const includeAll = searchParams.get("all") === "true" || searchParams.get("includePending") === "true";

    if (!isSupabaseConfigured() || !supabase) {
      let data = [...MOCK_OPPORTUNITIES];
      if (!includeAll) {
        data = data.filter((o) => o.isApproved === true || o.status === "APPROVED");
      }
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
      return NextResponse.json({ data, source: "mock", isConnected: false });
    }

    let query = supabase.from("opportunities").select("*");

    if (!includeAll) {
      query = query.or("is_approved.eq.true,status.eq.APPROVED");
    }

    if (type && type !== "All Types") {
      query = query.eq("type", type);
    }
    if (location && location !== "All Locations") {
      query = query.eq("location", location);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }

    let { data, error } = await query.order("is_featured", { ascending: false });

    // Graceful fallback if is_approved column doesn't exist yet
    if (error && (error.message?.includes("is_approved") || error.message?.includes("schema cache"))) {
      let fallbackQuery = supabase.from("opportunities").select("*");
      if (type && type !== "All Types") fallbackQuery = fallbackQuery.eq("type", type);
      if (location && location !== "All Locations") fallbackQuery = fallbackQuery.eq("location", location);
      if (search) fallbackQuery = fallbackQuery.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
      const fallbackRes = await fallbackQuery.order("is_featured", { ascending: false });
      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) throw error;

    interface RawOpp {
      id: string;
      title: string;
      company: string;
      type: string;
      location: string;
      location_detail?: string;
      locationDetail?: string;
      stipend_prize?: string;
      stipendOrPrize?: string;
      deadline: string;
      days_remaining?: number;
      daysRemaining?: number;
      tags?: string[];
      description?: string;
      eligibility?: string;
      apply_url?: string;
      applyUrl?: string;
      is_featured?: boolean;
      isFeatured?: boolean;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      is_approved?: boolean;
      isApproved?: boolean;
    }

    const normalized = (data as RawOpp[]).map((o) => ({
      id: o.id,
      title: o.title,
      company: o.company,
      type: o.type as "Hackathon" | "Internship" | "Scholarship" | "Workshop",
      location: o.location as "Remote" | "On-site" | "Hybrid",
      locationDetail: o.location_detail || o.locationDetail || o.location,
      stipendOrPrize: o.stipend_prize || o.stipendOrPrize || "Competitive",
      deadline: o.deadline,
      daysRemaining: o.days_remaining ?? o.daysRemaining ?? 14,
      tags: o.tags || [],
      description: o.description || "",
      eligibility: o.eligibility || "Open to all students",
      applyUrl: o.apply_url || o.applyUrl || "#",
      isFeatured: o.is_featured ?? o.isFeatured ?? false,
      status: o.status || (o.is_approved ? "APPROVED" : "PENDING"),
      isApproved: o.is_approved ?? (o.status === "APPROVED" || Boolean(o.isApproved)),
    }));

    return NextResponse.json({ data: normalized, source: "supabase", isConnected: true });
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
        status: "PENDING" as const,
        isApproved: false,
      };
      return NextResponse.json({
        data: mockOpp,
        source: "mock",
        isConnected: false,
        message: "🛡️ Opportunity submitted for moderator authorization! It will go live once approved by the Council.",
      });
    }

    let insertRes = await supabase
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
      message: "🛡️ Opportunity submitted for moderator authorization! It will go live once approved by the Council.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post opportunity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
