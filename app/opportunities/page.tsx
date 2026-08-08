"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  PlusCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { MOCK_OPPORTUNITIES } from "@/lib/mock-data";
import { Opportunity } from "@/lib/types";
import OpportunityCard from "@/components/OpportunityCard";

const OPPORTUNITY_TYPES = [
  "All Types",
  "Hackathon",
  "Internship",
  "Scholarship",
  "Workshop",
];

const LOCATIONS = ["All Locations", "Remote", "On-site", "Hybrid"];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
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
        }

        const normalized: Opportunity[] = (json.data as RawOpp[]).map((o) => ({
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
        }));
        setOpportunities(normalized);
      }
      setIsLiveConnected(json.source === "supabase");
    } catch {
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesType =
        selectedType === "All Types" || opp.type === selectedType;
      const matchesLocation =
        selectedLocation === "All Locations" || opp.location === selectedLocation;
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesType && matchesLocation && matchesSearch;
    });
  }, [opportunities, selectedType, selectedLocation, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-purple-500/30 shadow-card relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold shadow-purple">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Opportunity Radar • Active Grants & Bounties</span>
            </div>

            {isLiveConnected !== null && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                  isLiveConnected
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                }`}
              >
                <Database className="w-3 h-3" />
                <span>{isLiveConnected ? "Supabase Live Connected" : "Local Mock Mode"}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Hackathons, Internships & Grants
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Hand-curated tech opportunities specifically for CSE students. Discover high-stipend
            summer internships, international hackathons with travel grants, and open source fellowships.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit?type=opportunity"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs sm:text-sm shadow-cyan transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Opportunity / Job Listing</span>
            </Link>

            <button
              onClick={fetchOpportunities}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh Radar"}</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              ⚡ Updated daily by community scouts
            </span>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-4">
        {/* Search Bar + Location dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, companies, tech stacks (e.g. Go, Python)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 shadow-subtle focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm font-medium text-slate-200 shadow-subtle focus:border-cyan-400 cursor-pointer"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-900 text-white">
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {OPPORTUNITY_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-cyan"
                    : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No opportunities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No opportunities matched &quot;{searchQuery}&quot; under {selectedType} ({selectedLocation}).
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedType("All Types");
              setSelectedLocation("All Locations");
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
