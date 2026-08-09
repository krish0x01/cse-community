"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquareQuote,
  FileCode2,
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Flame,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  MOCK_CONFESSIONS,
  MOCK_RESOURCES,
  MOCK_OPPORTUNITIES,
  MOCK_EVENTS,
  COMMUNITY_STATS,
} from "@/lib/mock-data";
import { Confession, Resource, Opportunity, EventItem } from "@/lib/types";
import ConfessionCard from "@/components/ConfessionCard";
import ResourceCard from "@/components/ResourceCard";
import OpportunityCard from "@/components/OpportunityCard";
import EventCard from "@/components/EventCard";

export default function HomePage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [resConf, resRes, resOpp, resEvt] = await Promise.all([
          fetch("/api/confessions").then((r) => r.json()).catch(() => null),
          fetch("/api/resources").then((r) => r.json()).catch(() => null),
          fetch("/api/opportunities").then((r) => r.json()).catch(() => null),
          fetch("/api/events").then((r) => r.json()).catch(() => null),
        ]);

        if (resConf?.data && Array.isArray(resConf.data)) {
          setConfessions(resConf.data);
        } else if (resConf?.source === "mock") {
          setConfessions(MOCK_CONFESSIONS.filter((c) => c.isApproved === true || c.status === "APPROVED"));
        }

        if (resRes?.data && Array.isArray(resRes.data)) {
          setResources(resRes.data);
        } else if (resRes?.source === "mock") {
          setResources(MOCK_RESOURCES);
        }

        if (resOpp?.data && Array.isArray(resOpp.data)) {
          setOpportunities(resOpp.data);
        } else if (resOpp?.source === "mock") {
          setOpportunities(MOCK_OPPORTUNITIES);
        }

        if (resEvt?.data && Array.isArray(resEvt.data)) {
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

          const normalizedEvents: EventItem[] = (resEvt.data as RawEvent[]).map((e) => {
            const d = new Date(e.date || Date.now());
            const month = !isNaN(d.getTime())
              ? d.toLocaleString("en-US", { month: "short" }).toUpperCase()
              : "OCT";
            const day = !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, "0") : "24";

            return {
              id: e.id,
              title: e.title,
              category: (e.category as EventItem["category"]) || "Tech Talk",
              date: e.date,
              month,
              day,
              time: e.time,
              venue: e.venue,
              isOnline: e.is_online ?? e.isOnline ?? false,
              speaker: e.speaker || {
                name: e.speaker_name || "Campus Speaker",
                role: e.speaker_role || "Tech Lead",
                company: e.speaker_company || "CSE Community",
              },
              totalSeats: e.max_capacity ?? e.maxCapacity ?? 100,
              registeredCount: e.registered_count ?? e.registeredCount ?? 0,
              tags: e.tags || [],
              description: e.description || "",
            };
          });
          setEvents(normalizedEvents);
        } else if (resEvt?.source === "mock") {
          setEvents(MOCK_EVENTS);
        }
      } catch {
        // Keep fallback
      }
    }
    loadLiveData();
  }, []);

  const trendingConfessions = confessions.filter((c) => c.isTrending).slice(0, 3).length > 0
    ? confessions.filter((c) => c.isTrending).slice(0, 3)
    : confessions.slice(0, 3);
  const featuredOpportunities = opportunities.slice(0, 2);
  const topResources = resources.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="space-y-20 sm:space-y-28 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-28 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#080b14] via-[#0d1326] to-[#080b14]">
        {/* Cyber grid and ambient glow */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Live Campus Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-cyan text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-cyan" />
              <span>Campus Digital Commons • Live 2026</span>
              <span className="text-slate-700">|</span>
              <span className="text-cyan-300 font-semibold">100% Anonymized</span>
            </div>

            {/* Main Cyber Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Our campus.{" "}
              <span className="relative inline-block bg-gradient-to-r from-cyan-400 via-cyan-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                Unfiltered<span className="text-cyan-400">.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              The honest, all-in-one ecosystem for Computer Science & Engineering students.
              Real confessions, verified exam vaults, hackathon squads, and vetted opportunities.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/confessions"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 shadow-lg hover:border-cyan-500/40 hover:shadow-cyan transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Explore Confessions</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/resources"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan hover:shadow-cyan-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <FileCode2 className="w-4 h-4" />
                <span>Access Resource Vault</span>
              </Link>
            </div>

            {/* Quick badges ticker */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Zero signup required to read
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Verified PYQs & Notes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Strict Anti-Doxxing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {COMMUNITY_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 hover:border-cyan-500/40 shadow-card hover:shadow-cyan transition-all backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-cyan" />
              </div>
              <div className="font-extrabold text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-mono tracking-tight mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 font-medium leading-normal">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRENDING CONFESSIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 fill-purple-400" />
              <span>Campus Buzz</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trending Confessions
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Top upvoted raw stories, hilarious lab moments, and late-night thoughts.
            </p>
          </div>

          <Link
            href="/confessions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group self-start sm:self-auto"
          >
            <span>View All Confessions</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingConfessions.map((confession) => (
            <ConfessionCard key={confession.id} confession={confession} />
          ))}
        </div>
      </section>

      {/* 4. MAIN COMMUNITY FEATURES (Bento Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full inline-block mb-3 shadow-cyan">
            Core Pillars
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for every phase of your degree
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Everything you need from your 1st year &apos;Hello World&apos; to final year placement offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Confessions */}
          <Link
            href="/confessions"
            className="group bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-pink-500/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between backdrop-blur-md"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-950/80 border border-pink-500/40 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Anonymous Confessions
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Share relatable struggles, semester rants, crushes, and triumphs without identity baggage.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-pink-400 group-hover:text-pink-300 transition-colors gap-1">
              <span>Read confessions feed</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Feature 2: Resources */}
          <Link
            href="/resources"
            className="group bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-cyan-500/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between backdrop-blur-md"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileCode2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Academic Resource Vault
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Handwritten topper notes, verified 5-year solved PYQs, lab manuals, and interview roadmaps.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors gap-1">
              <span>Browse study vault</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Feature 3: Opportunities */}
          <Link
            href="/opportunities"
            className="group bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-purple-500/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between backdrop-blur-md"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Opportunity Radar
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Curated national hackathons, high-stipend remote internships, fellowships, and tech grants.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors gap-1">
              <span>Explore opportunities</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Feature 4: Events */}
          <Link
            href="/events"
            className="group bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-cyan-500/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between backdrop-blur-md"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Hackathons & Meetups
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Hands-on workshops, system design tech talks by alumni, and pizza networking evenings.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors gap-1">
              <span>View upcoming events</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* 5. OPPORTUNITIES SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Career & Bounties</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              High-value hackathons, paid internships, and open-source grants closing soon.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group self-start sm:self-auto"
          >
            <span>All Opportunities</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </section>

      {/* 6. ACADEMIC VAULT PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <FileCode2 className="w-4 h-4" />
              <span>Study Materials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top-Rated Academic Resources
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Hand-annotated notes, solved question banks, and complete lab manuals.
            </p>
          </div>

          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group self-start sm:self-auto"
          >
            <span>Browse Full Vault</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* 7. UPCOMING CAMPUS EVENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" />
              <span>Community Gatherings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Upcoming Workshops & Talks
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Register free to secure your seat for upcoming system design and open-source sessions.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group self-start sm:self-auto"
          >
            <span>All Campus Events</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-2">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No upcoming events scheduled right now.</p>
            <p className="text-xs text-slate-400">Propose a tech talk or check back soon for updates!</p>
          </div>
        )}
      </section>

      {/* 8. CALL-TO-ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900/90 text-white p-8 sm:p-12 md:p-16 overflow-hidden border border-cyan-500/30 shadow-2xl backdrop-blur-md">
          {/* Neon cyan & purple decorative ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-cyan">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero logs • Safe Anonymity</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Got something on your mind?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Speak freely.
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Whether it&apos;s an engineering confession, a handwritten notes PDF that saved your semester,
              or a team recruitment call for an upcoming hackathon: CSE Community is your megaphone.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/submit"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan hover:shadow-cyan-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Make a Submission</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/rules"
                className="px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center hover:border-purple-500/40"
              >
                Review Honor Code
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
