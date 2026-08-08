"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  Upload,
  CheckCircle,
  FileText,
  RefreshCw,
  Database,
} from "lucide-react";
import { MOCK_RESOURCES } from "@/lib/mock-data";
import { Resource } from "@/lib/types";
import ResourceCard from "@/components/ResourceCard";

const RESOURCE_CATEGORIES = [
  "All Resources",
  "Notes",
  "PYQ",
  "Practical",
  "Roadmap",
];

const SEMESTERS = [
  "All Semesters",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources");
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        interface RawResource {
          id: string;
          title: string;
          subject_code?: string;
          subjectCode?: string;
          subject_name?: string;
          subjectName?: string;
          semester: string;
          category: string;
          author?: string;
          verified?: boolean;
          format?: string;
          file_size?: string;
          fileSize?: string;
          downloads?: number;
          rating?: number;
          link_url?: string;
          linkUrl?: string;
          description?: string;
        }

        const normalized: Resource[] = (json.data as RawResource[]).map((r) => ({
          id: r.id,
          title: r.title,
          subjectCode: r.subject_code || r.subjectCode || "CS-GEN",
          subjectName: r.subject_name || r.subjectName || "Computer Science",
          semester: r.semester,
          category: r.category as "Notes" | "PYQ" | "Practical" | "Roadmap" | "Tool",
          author: r.author || "Student Contributor",
          verified: r.verified ?? true,
          format: (r.format as "PDF" | "ZIP" | "Code" | "Drive") || "PDF",
          fileSize: r.file_size || r.fileSize || "4.5 MB",
          downloads: r.downloads ?? 0,
          rating: Number(r.rating) || 5.0,
          linkUrl: r.link_url || r.linkUrl || "#",
          description: r.description || "",
        }));
        setResources(normalized);
      }
      setIsLiveConnected(json.source === "supabase");
    } catch {
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesCategory =
        selectedCategory === "All Resources" || res.category === selectedCategory;
      const matchesSemester =
        selectedSemester === "All Semesters" ||
        res.semester.toLowerCase().includes(selectedSemester.toLowerCase());
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSemester && matchesSearch;
    });
  }, [resources, selectedCategory, selectedSemester, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-cyan-500/30 shadow-card relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-cyan">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Vault • Verified Notes & PYQs</span>
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
            Academic Resources & PYQ Vault
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Curated, peer-reviewed engineering study materials. Topper handwritten notes,
            5-year solved previous year question papers, verified lab practical codes, and placement tracks.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/submit?type=resource"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs sm:text-sm shadow-cyan transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF / Contribute Notes</span>
            </Link>

            <button
              onClick={fetchResources}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh Vault"}</span>
            </button>

            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              SHA-256 Verified Clean
            </span>
          </div>
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-4">
        {/* Search Bar + Semester Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject code (e.g. CS-301), topic, or exam..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 shadow-subtle focus:border-cyan-400"
            />
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm font-medium text-slate-200 shadow-subtle focus:border-cyan-400 cursor-pointer"
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem} className="bg-slate-900 text-white">
                  {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {RESOURCE_CATEGORIES.map((cat) => {
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

      {/* Resources Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/80 rounded-3xl border border-slate-800 p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No resources found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No study material matched &quot;{searchQuery}&quot; in {selectedSemester} ({selectedCategory}).
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Resources");
              setSelectedSemester("All Semesters");
            }}
            className="px-4 py-2 rounded-full bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
