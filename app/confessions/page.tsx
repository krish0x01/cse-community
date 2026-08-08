"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquareQuote,
  Search,
  Flame,
  PlusCircle,
  Clock,
  ThumbsUp,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";
import { MOCK_CONFESSIONS } from "@/lib/mock-data";
import { Confession } from "@/lib/types";
import ConfessionCard from "@/components/ConfessionCard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const CATEGORIES = [
  "All",
  "Academics",
  "Rants",
  "Campus Life",
  "Romance",
  "Placements",
  "Hostel",
];

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>(MOCK_CONFESSIONS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "liked">("trending");
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean | null>(null);
  const [realtimeEventsCount, setRealtimeEventsCount] = useState(0);

  const fetchConfessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/confessions");
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setConfessions(json.data);
      }
      setIsLiveConnected(json.isConnected || false);
    } catch {
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfessions();
  }, [fetchConfessions]);

  // Set up Supabase Realtime Channel for Instant Live Updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel("realtime_confessions_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "confessions" },
        (payload) => {
          interface RawInsert {
            id: string;
            alias: string;
            batch: string;
            category: string;
            content: string;
            likes?: number;
            is_trending?: boolean;
            tags?: string[];
            created_at?: string;
          }
          const raw = payload.new as RawInsert;
          const newConfession: Confession = {
            id: raw.id,
            alias: raw.alias,
            batch: raw.batch,
            category: (raw.category as Confession["category"]) || "Academics",
            content: raw.content,
            likes: raw.likes ?? 0,
            isTrending: raw.is_trending ?? false,
            tags: raw.tags || [],
            timestamp: "Just now",
            comments: [],
          };

          setConfessions((prev) => [newConfession, ...prev.filter((c) => c.id !== newConfession.id)]);
          setRealtimeEventsCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "confessions" },
        (payload) => {
          interface RawUpdate {
            id: string;
            likes?: number;
            is_trending?: boolean;
          }
          const updated = payload.new as RawUpdate;
          setConfessions((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? {
                    ...c,
                    likes: updated.likes !== undefined ? updated.likes : c.likes,
                    isTrending: updated.is_trending !== undefined ? updated.is_trending : c.isTrending,
                  }
                : c
            )
          );
          setRealtimeEventsCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "confessions" },
        (payload) => {
          const deletedId = (payload.old as { id: string })?.id;
          if (deletedId) {
            setConfessions((prev) => prev.filter((c) => c.id !== deletedId));
            setRealtimeEventsCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const filteredConfessions = useMemo(() => {
    return confessions
      .filter((conf) => {
        const matchesCategory =
          selectedCategory === "All" || conf.category === selectedCategory;
        const matchesSearch =
          conf.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conf.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conf.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "trending") {
          if (a.isTrending && !b.isTrending) return -1;
          if (!a.isTrending && b.isTrending) return 1;
          return b.likes - a.likes;
        }
        if (sortBy === "liked") {
          return b.likes - a.likes;
        }
        return 0;
      });
  }, [confessions, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-purple-500/30 shadow-card relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold shadow-purple">
              <Flame className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              <span>Campus Feed • 100% Anonymous</span>
            </div>

            {/* Supabase Live Realtime Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                isLiveConnected
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-cyan"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              <Zap className={`w-3 h-3 ${isLiveConnected ? "text-cyan-400 fill-cyan-400 animate-pulse" : "text-slate-500"}`} />
              <span>
                {isLiveConnected
                  ? `Realtime WebSockets Active (${realtimeEventsCount} live events)`
                  : "Local Sandbox Mode"}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Confessions & Campus Rants
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The unfiltered pulse of the department. Share exam traumas, lab romances,
            hostel hacks, and victory moments with zero identity risk.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs sm:text-sm shadow-cyan transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Anonymous Confession</span>
            </Link>

            <button
              onClick={fetchConfessions}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh Feed"}</span>
            </button>

            <Link
              href="/rules"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Confession Rules</span>
            </Link>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-4">
        {/* Search Bar + Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search confessions, #tags, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 shadow-subtle focus:border-cyan-400"
            />
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-subtle self-start sm:self-auto">
            <button
              onClick={() => setSortBy("trending")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                sortBy === "trending"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-pink-400" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setSortBy("liked")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                sortBy === "liked"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most Liked</span>
            </button>

            <button
              onClick={() => setSortBy("recent")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                sortBy === "recent"
                  ? "bg-slate-800 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Latest</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-cyan"
                  : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Confession Cards Grid */}
      {filteredConfessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConfessions.map((confession) => (
            <ConfessionCard key={confession.id} confession={confession} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 p-8 space-y-3">
          <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No confessions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No confessions matched your search &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
