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
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const includeAll = searchParams.get("all") === "true" || searchParams.get("includePending") === "true";

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ data: [], source: "supabase", isConnected: false });
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
    const ip = getClientIP(request);
    // Rate limit: Max 5 opportunity submissions per 5 minutes per IP
    const limit = checkRateLimit(`post_opp_${ip}`, 5, 5 * 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const body = await request.json();
    const title = sanitizeString(body?.title || "");
    const company = sanitizeString(body?.company || "");
    const type = sanitizeString(body?.type || "Hackathon");
    const location = sanitizeString(body?.location || "Remote");
    const stipendPrize = sanitizeString(body?.stipendPrize || "Competitive");
    const deadline = sanitizeString(body?.deadline || "Upcoming");
    const applyUrl = sanitizeString(body?.applyUrl || "");
    const description = sanitizeString(body?.description || "");
    const eligibility = sanitizeString(body?.eligibility || "Open to all students");
    const tags = body?.tags;

    if (!title || !company || !applyUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^https?:\/\/.+/i.test(applyUrl)) {
      return NextResponse.json({ error: "Invalid application URL. Must start with http:// or https://" }, { status: 400 });
    }

    const parsedTags = (
      Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(/\s+/)
        : []
    )
      .map((t) => sanitizeString(String(t)))
      .filter(Boolean)
      .slice(0, 10);

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: "Supabase database is not configured in .env.local" },
        { status: 400 }
      );
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
