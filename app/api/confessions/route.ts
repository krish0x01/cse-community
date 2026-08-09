import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_CONFESSIONS } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort") || "trending";
    const includePending = searchParams.get("all") === "true" || searchParams.get("admin") === "true";

    if (!isSupabaseConfigured() || !supabase) {
      let data = [...MOCK_CONFESSIONS];

      if (!includePending) {
        data = data.filter((c) => c.isApproved === true || (c.status !== "PENDING" && c.isApproved !== false));
      }

      if (category && category !== "All") {
        data = data.filter((c) => c.category === category);
      }
      if (search) {
        const query = search.toLowerCase();
        data = data.filter(
          (c) =>
            c.content.toLowerCase().includes(query) ||
            c.alias.toLowerCase().includes(query) ||
            c.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      if (sortBy === "trending") {
        data.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.likes - a.likes);
      } else if (sortBy === "liked") {
        data.sort((a, b) => b.likes - a.likes);
      }
      return NextResponse.json({ data, source: "mock", isConnected: false });
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

    const { data, error } = await query;
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
    const body = await request.json();
    const { alias, batch, category, content, tags } = body;

    if (!content || !category || !alias) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Safety / Anti-Doxxing filter: block phone numbers (10 digits)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    if (phoneRegex.test(content)) {
      return NextResponse.json(
        { error: "Submission blocked: Phone numbers / personal contact details violate Rule #2 (Anti-Doxxing)." },
        { status: 422 }
      );
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(/\s+/).filter(Boolean)
      : [];

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

    const { data, error } = await supabase
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

    if (error) {
      return NextResponse.json(
        {
          error: `Supabase database error: ${error.message}. Did you run supabase/schema.sql in the SQL Editor?`,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      source: "supabase",
      isConnected: true,
      message: "🛡️ Confession submitted for moderator authorization! It will go live once approved by the Council.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post confession";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
