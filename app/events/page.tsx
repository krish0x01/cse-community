"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Search,
  PlusCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { EventItem } from "@/lib/types";
import EventCard from "@/components/EventCard";

const EVENT_CATEGORIES = ["All Events", "Tech Talk", "Workshop", "Meetup"];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
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
          max_capacity?: number;
          maxCapacity?: number;
          tags?: string[];
          description?: string;
        }

        const normalized: EventItem[] = (json.data as RawEvent[]).map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category as "Tech Talk" | "Workshop" | "Meetup",
          date: e.date,
          time: e.time,
          venue: e.venue,
          isOnline: e.is_online ?? e.isOnline ?? false,
          speaker: e.speaker || {
            name: e.speaker_name || "Campus Speaker",
            role: e.speaker_role || "Tech Lead",
            company: e.speaker_company || "CSE Community",
          },
          registeredCount: e.registered_count ?? e.registeredCount ?? 0,
          maxCapacity: e.max_capacity ?? e.maxCapacity ?? 100,
          tags: e.tags || [],
          description: e.description || "",
        }));
        setEvents(normalized);
      } else if (json.source === "mock") {
        setEvents(MOCK_EVENTS);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory =
        selectedCategory === "All Events" || evt.category === selectedCategory;
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.speaker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-cyan-500/30 shadow-card relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-cyan">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Campus Gatherings & Workshops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Community Events & Tech Talks
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Attend high-impact tech workshops, peer code roasts, alumni speaker sessions,
            and hackathon team mixers. Free RSVP with limited auditorium & virtual seats.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit?type=event"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs sm:text-sm shadow-cyan transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host / Propose a Community Event</span>
            </Link>

            <button
              onClick={fetchEvents}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh Schedule"}</span>
            </button>

            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              Free entry for all registered students
            </span>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title, speaker name, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 shadow-subtle focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {EVENT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-purple"
                      : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Grid / Loading Skeletons */}
      {loading && events.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800 space-y-4 animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-800 rounded-full" />
              <div className="h-6 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-800 rounded" />
              <div className="h-16 bg-slate-800/60 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 p-8 space-y-3">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No events found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "All Events"
              ? `No events matched your search query in ${selectedCategory}.`
              : "No upcoming workshops or meetups scheduled at this moment."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Events");
            }}
            className="px-4 py-2 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
