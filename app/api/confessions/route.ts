import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  sanitizeString,
  containsPrivateInformation,
} from "@/lib/security";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "trending";
    const includePending = searchParams.get("all") === "true" || searchParams.get("admin") === "true";

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ data: [], source: "supabase", isConnected: false });
    }

    let query = supabase.from("confessions").select("*, comments(*)");

    if (!includePending) {
      query = query.or("is_approved.eq.true,status.eq.APPROVED");
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.ilike("content", `%${search}%`);
    }

    if (sortBy === "trending") {
      query = query.order("is_trending", { ascending: false }).order("likes", { ascending: false });
    } else if (sortBy === "liked") {
      query = query.order("likes", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    let { data, error } = await query;
    if (error && (error.message?.includes("is_approved") || error.message?.includes("schema cache"))) {
      // Fallback: column doesn't exist in Supabase table yet, query without is_approved filter
      let fallbackQuery = supabase.from("confessions").select("*, comments(*)");
      if (category && category !== "All") fallbackQuery = fallbackQuery.eq("category", category);
      if (search) fallbackQuery = fallbackQuery.ilike("content", `%${search}%`);
      if (sortBy === "trending") {
        fallbackQuery = fallbackQuery.order("is_trending", { ascending: false }).order("likes", { ascending: false });
      } else if (sortBy === "liked") {
        fallbackQuery = fallbackQuery.order("likes", { ascending: false });
      } else {
        fallbackQuery = fallbackQuery.order("created_at", { ascending: false });
      }
      const fallbackRes = await fallbackQuery;
      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }
    if (error) throw error;

    // Normalize snake_case fields to camelCase
    interface RawComment {
      id: string;
      author: string;
      text: string;
      created_at?: string;
    }
    interface RawConfession {
      id: string;
      alias: string;
      batch: string;
      category: string;
      content: string;
      likes?: number;
      is_trending?: boolean;
      isTrending?: boolean;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      is_approved?: boolean;
      isApproved?: boolean;
      tags?: string[];
      created_at?: string;
      timestamp?: string;
      comments?: RawComment[];
    }

    const normalizedData = (data as RawConfession[]).map((item) => ({
      id: item.id,
      alias: item.alias,
      batch: item.batch,
      category: item.category,
      content: item.content,
      likes: item.likes ?? 0,
      isTrending: item.is_trending ?? item.isTrending ?? false,
      status: item.status || (item.is_approved ? "APPROVED" : "PENDING"),
      isApproved: item.is_approved ?? (item.status === "APPROVED" || Boolean(item.isApproved)),
      tags: item.tags || [],
      timestamp: item.created_at
        ? new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : item.timestamp || "Recently",
      comments: (item.comments || []).map((c) => ({
        id: c.id,
        author: c.author,
        text: c.text,
        timestamp: c.created_at
          ? new Date(c.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "Recently",
      })),
    }));

    return NextResponse.json({ data: normalizedData, source: "supabase", isConnected: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch confessions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    // Rate limit: Max 5 confession posts per minute per IP
    const limit = checkRateLimit(`post_confession_${ip}`, 5, 60 * 1000);
    if (!limit.allowed) {
      return rateLimitResponse(limit.resetInSec);
    }

    const body = await request.json();

    const alias = sanitizeString(body?.alias || "");
    const content = sanitizeString(body?.content || "");
    const category = sanitizeString(body?.category || "");
    const batch = sanitizeString(body?.batch || "CSE '26");
    const tags = body?.tags;

    if (!content || !category || !alias) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (alias.length > 50) {
      return NextResponse.json({ error: "Alias must be 50 characters or less." }, { status: 400 });
    }

    if (content.length > 2500) {
      return NextResponse.json({ error: "Confession content must be 2500 characters or less." }, { status: 400 });
    }

    // Comprehensive Anti-Doxxing Privacy Safeguard
    const privacyCheck = containsPrivateInformation(content) || containsPrivateInformation(alias);
    if (privacyCheck.containsPrivate) {
      return NextResponse.json(
        { error: `Submission blocked: ${privacyCheck.reason}` },
        { status: 422 }
      );
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
        {
          error:
            "Supabase credentials not detected in .env.local! Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart dev server.",
          isConnected: false,
        },
        { status: 400 }
      );
    }

    let insertRes = await supabase
      .from("confessions")
      .insert([
        {
          alias: alias.trim(),
          batch: batch || "CSE '26",
          category,
          content: content.trim(),
          tags: parsedTags,
          likes: 0,
          is_trending: false,
          status: "PENDING",
          is_approved: false,
        },
      ])
      .select()
      .single();

    // Fallback if is_approved / status column has not been added to Supabase table yet
    if (
      insertRes.error &&
      (insertRes.error.message?.includes("is_approved") ||
        insertRes.error.message?.includes("status") ||
        insertRes.error.message?.includes("schema cache"))
    ) {
      insertRes = await supabase
        .from("confessions")
        .insert([
          {
            alias: alias.trim(),
            batch: batch || "CSE '26",
            category,
            content: content.trim(),
            tags: parsedTags,
            likes: 0,
            is_trending: false,
          },
        ])
        .select()
        .single();
    }

    if (insertRes.error) {
      return NextResponse.json(
        {
          error: `Supabase database error: ${insertRes.error.message}. Please run supabase/migration_add_approval.sql in the Supabase SQL Editor.`,
          details: insertRes.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: insertRes.data,
      source: "supabase",
      isConnected: true,
      message: "🛡️ Confession submitted for moderator authorization! It will go live once approved by the Council.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post confession";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
