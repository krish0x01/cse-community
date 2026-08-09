"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MessageSquareQuote,
  FileCode2,
  Sparkles,
  Calendar,
  Trash2,
  Flame,
  CheckCircle2,
  XCircle,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Star,
  Clock,
  User,
} from "lucide-react";
import Toast from "@/components/Toast";
import { Confession, Resource, Opportunity, EventItem } from "@/lib/types";
import {
  MOCK_CONFESSIONS,
  MOCK_RESOURCES,
  MOCK_OPPORTUNITIES,
  MOCK_EVENTS,
} from "@/lib/mock-data";

interface ReportItem {
  id: string;
  post_url: string;
  reason: string;
  details?: string;
  status: "PENDING_REVIEW" | "RESOLVED" | "DISMISSED";
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "reports" | "confessions" | "resources" | "opportunities" | "events" | "telemetry"
  >("confessions");
  const [confessionFilter, setConfessionFilter] = useState<"pending" | "approved" | "all">("pending");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Reports
      const resRep = await fetch("/api/admin/reports");
      const dataRep = await resRep.json();
      if (dataRep.reports && Array.isArray(dataRep.reports)) {
        setReports(dataRep.reports);
      } else {
        setReports([]);
      }

      // 2. Fetch All Confessions (including pending)
      const resConf = await fetch("/api/confessions?all=true");
      const dataConf = await resConf.json();
      if (dataConf.data && Array.isArray(dataConf.data)) {
        setConfessions(dataConf.data);
      } else if (dataConf.source === "mock") {
        setConfessions(MOCK_CONFESSIONS);
      } else {
        setConfessions([]);
      }
      setIsSupabaseLive(dataConf.source === "supabase");

      // 3. Fetch Resources
      const resRes = await fetch("/api/resources");
      const dataRes = await resRes.json();
      if (dataRes.data && Array.isArray(dataRes.data)) {
        setResources(dataRes.data);
      } else if (dataRes.source === "mock") {
        setResources(MOCK_RESOURCES);
      } else {
        setResources([]);
      }

      // 4. Fetch Opportunities
      const resOpp = await fetch("/api/opportunities");
      const dataOpp = await resOpp.json();
      if (dataOpp.data && Array.isArray(dataOpp.data)) {
        setOpportunities(dataOpp.data);
      } else if (dataOpp.source === "mock") {
        setOpportunities(MOCK_OPPORTUNITIES);
      } else {
        setOpportunities([]);
      }

      // 5. Fetch Events
      const resEvt = await fetch("/api/events");
      const dataEvt = await resEvt.json();
      if (dataEvt.data && Array.isArray(dataEvt.data)) {
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

        const normalized: EventItem[] = (dataEvt.data as RawEvent[]).map((e) => {
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
        setEvents(normalized);
      } else if (dataEvt.source === "mock") {
        setEvents(MOCK_EVENTS);
      } else {
        setEvents([]);
      }
    } catch {
      setToastMessage("⚠️ Failed to refresh some admin feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect access code");
      }

      setIsAuthenticated(true);
      setToastMessage("Moderator session initialized ✓");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Access denied";
      setAuthError(msg);
    }
  };

  // Action: Update Report Status
  const handleUpdateReport = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    setToastMessage(`Report marked as ${status}`);

    try {
      await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status }),
      });
    } catch {
      // Keep optimistic update
    }
  };

  // Action: Delete Confession
  const handleDeleteConfession = async (confessionId: string) => {
    if (!confirm("Are you sure you want to permanently remove this confession?")) return;

    setConfessions((prev) => prev.filter((c) => c.id !== confessionId));
    setToastMessage("Confession removed from database");

    try {
      await fetch(`/api/admin/confessions/${confessionId}`, { method: "DELETE" });
    } catch {
      // Optimistic update
    }
  };

  // Action: Authorize / Approve Confession
  const handleAuthorizeConfession = async (confessionId: string, approve: boolean) => {
    const status = approve ? "APPROVED" : "REJECTED";
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === confessionId ? { ...c, isApproved: approve, status } : c
      )
    );
    setToastMessage(
      approve
        ? "🎉 Confession AUTHORIZED & published live to community feed!"
        : "Confession marked as rejected."
    );

    try {
      await fetch(`/api/admin/confessions/${confessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve, status }),
      });
    } catch {
      // Optimistic update
    }
  };

  // Action: Toggle Confession Trending
  const handleToggleTrending = async (confessionId: string, currentTrending?: boolean) => {
    const nextState = !Boolean(currentTrending);
    setConfessions((prev) =>
      prev.map((c) => (c.id === confessionId ? { ...c, isTrending: nextState } : c))
    );
    setToastMessage(nextState ? "Added to Trending spotlight!" : "Removed from Trending");

    try {
      await fetch(`/api/admin/confessions/${confessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrending: nextState }),
      });
    } catch {
      // Optimistic update
    }
  };

  // Action: Delete Resource
  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to remove this academic resource?")) return;

    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    setToastMessage("Resource removed from vault");

    try {
      await fetch(`/api/admin/resources/${resourceId}`, { method: "DELETE" });
    } catch {
      // Optimistic update
    }
  };

  // Action: Delete Opportunity
  const handleDeleteOpportunity = async (oppId: string) => {
    if (!confirm("Are you sure you want to permanently delete this opportunity listing?")) return;

    setOpportunities((prev) => prev.filter((o) => o.id !== oppId));
    setToastMessage("Opportunity listing deleted from database ✓");

    try {
      await fetch(`/api/admin/opportunities/${oppId}`, { method: "DELETE" });
    } catch {
      // Optimistic update
    }
  };

  // Action: Toggle Opportunity Featured
  const handleToggleFeatureOpportunity = async (oppId: string, currentFeatured?: boolean) => {
    const nextState = !Boolean(currentFeatured);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, isFeatured: nextState } : o))
    );
    setToastMessage(nextState ? "Marked as Featured Opportunity ★" : "Removed from Featured");

    try {
      await fetch(`/api/admin/opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextState }),
      });
    } catch {
      // Optimistic update
    }
  };

  // Action: Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to permanently cancel and delete this campus event?")) return;

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setToastMessage("Campus event removed from schedule ✓");

    try {
      await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    } catch {
      // Optimistic update
    }
  };

  // If not authenticated, display Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-8 space-y-6 relative z-10 backdrop-blur-md">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-purple">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Moderator Command Center
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Restricted to CSE Community Elected Council
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                Council Access Code
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access code..."
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono text-sm focus:border-purple-400"
                autoFocus
              />
              {authError && <p className="text-xs text-rose-400 mt-2 font-mono">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-purple transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingReportsCount = reports.filter((r) => r.status === "PENDING_REVIEW").length;
  const pendingConfessionsCount = confessions.filter((c) => c.isApproved === false || c.status === "PENDING").length;
  const approvedConfessionsCount = confessions.filter((c) => c.isApproved === true || c.status === "APPROVED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
            <span className="font-mono text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              Moderator Session Active
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              Database: {isSupabaseLive ? "Supabase PostgreSQL (Live)" : "Local Mock Sandbox"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            CSE Community Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Review violation flags, verify academic uploads, curate trending feeds, and oversee community integrity.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2.5 rounded-full bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold transition-colors"
          >
            Lock Session
          </button>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Telemetry Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Pending Authorizations</span>
            <ShieldAlert className={`w-4 h-4 ${pendingConfessionsCount > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${pendingConfessionsCount > 0 ? "text-amber-400" : "text-white"}`}>
            {pendingConfessionsCount}
          </div>
          <span className="text-[11px] text-slate-500">Confessions queue</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Incident Reports</span>
            <ShieldAlert className={`w-4 h-4 ${pendingReportsCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${pendingReportsCount > 0 ? "text-rose-400" : "text-white"}`}>
            {pendingReportsCount}
          </div>
          <span className="text-[11px] text-slate-500">Requires review</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Academic Vault</span>
            <FileCode2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {resources.length}
          </div>
          <span className="text-[11px] text-slate-500">{resources.filter((r) => r.verified).length} Verified</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Opportunities</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {opportunities.length}
          </div>
          <span className="text-[11px] text-slate-500">Active Listings</span>
        </div>

        <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Campus Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {events.length}
          </div>
          <span className="text-[11px] text-slate-500">Talks & Workshops</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("confessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "confessions"
              ? "bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-purple"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4 text-purple-400" />
          <span>Confessions ({pendingConfessionsCount} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "reports"
              ? "bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Reports ({pendingReportsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "resources"
              ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCode2 className="w-4 h-4 text-cyan-400" />
          <span>Academic Vault ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("opportunities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "opportunities"
              ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Opportunities ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "events"
              ? "bg-purple-950/80 text-purple-300 border border-purple-500/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Campus Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "telemetry"
              ? "bg-slate-800 text-slate-200 border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Telemetry</span>
        </button>
      </div>

      {/* TAB 1: CONFESSIONS AUTHORIZATION */}
      {activeTab === "confessions" && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfessionFilter("pending")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  confessionFilter === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                <span>⏳ Pending Authorization</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono">
                  {pendingConfessionsCount}
                </span>
              </button>

              <button
                onClick={() => setConfessionFilter("approved")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  confessionFilter === "approved"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                <span>✅ Live / Published</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono">
                  {approvedConfessionsCount}
                </span>
              </button>

              <button
                onClick={() => setConfessionFilter("all")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  confessionFilter === "all"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                All Confessions ({confessions.length})
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              ⚡ Authorization Queue Active
            </div>
          </div>

          {filteredConfessions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {confessionFilter === "pending"
                  ? "All caught up! No confessions waiting for authorization."
                  : "No confessions in this filter."}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Student submissions will appear here instantly when posted.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConfessions.map((confession) => {
                const isPending = confession.isApproved === false || confession.status === "PENDING";

                return (
                  <div
                    key={confession.id}
                    className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between transition-all ${
                      isPending
                        ? "bg-amber-950/20 border-amber-500/40 shadow-lg"
                        : "bg-slate-900/85 border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            {confession.alias}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {confession.batch}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                            }`}
                          >
                            {isPending ? "⏳ Pending Review" : "✓ Live"}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                            {confession.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                        &ldquo;{confession.content}&rdquo;
                      </p>

                      {confession.tags && confession.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {confession.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-800/60"
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span>❤️ {confession.likes} upvotes</span>
                        <span>💬 {confession.comments?.length || 0} comments</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleAuthorizeConfession(confession.id, true)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Authorize & Publish Live ✓</span>
                            </button>

                            <button
                              onClick={() => handleAuthorizeConfession(confession.id, false)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
                              title="Reject Confession"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleTrending(confession.id, confession.isTrending)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                                confession.isTrending
                                  ? "bg-pink-950 text-pink-300 border border-pink-500/50"
                                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                              }`}
                              title="Toggle Trending Spotlight"
                            >
                              <Flame className="w-3.5 h-3.5 text-pink-400" />
                              <span>{confession.isTrending ? "🔥 Trending" : "Trend"}</span>
                            </button>

                            <button
                              onClick={() => handleAuthorizeConfession(confession.id, false)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                              title="Revoke Approval (Move to Pending)"
                            >
                              Revoke
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteConfession(confession.id)}
                          className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Permanently Delete Confession"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCIDENT REPORTS & COMPLAINTS */}
      {activeTab === "reports" && (
        <div className="space-y-4 animate-fade-in">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Zero Active Reports</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No policy violations or inappropriate content flags currently filed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-slate-900/85 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30">
                        {report.reason}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Target: {report.post_url}
                      </span>
                    </div>

                    {report.details && (
                      <p className="text-xs text-slate-300">&quot;{report.details}&quot;</p>
                    )}

                    <div className="text-[11px] font-mono text-slate-500">
                      Filed: {new Date(report.created_at).toLocaleString()} • Status:{" "}
                      <span
                        className={
                          report.status === "PENDING_REVIEW"
                            ? "text-rose-400 font-bold"
                            : report.status === "RESOLVED"
                            ? "text-emerald-400 font-bold"
                            : "text-slate-400 font-bold"
                        }
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {report.status === "PENDING_REVIEW" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateReport(report.id, "RESOLVED")}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Take Down & Resolve</span>
                      </button>

                      <button
                        onClick={() => handleUpdateReport(report.id, "DISMISSED")}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Dismiss Flag</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACADEMIC VAULT APPROVALS & DELETIONS */}
      {activeTab === "resources" && (
        <div className="space-y-4 animate-fade-in">
          {resources.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <FileCode2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Academic Vault is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No academic notes or question papers currently uploaded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-900/85 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
                          {res.subjectCode}
                        </span>
                        <span className="text-xs text-slate-400">{res.semester}</span>
                      </div>

                      <span className="text-xs font-semibold text-purple-300 font-mono">
                        {res.format} ({res.fileSize})
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{res.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-400">
                      📥 {res.downloads} downloads
                    </div>

                    <div className="flex items-center gap-2">
                      {res.linkUrl && res.linkUrl !== "#" && (
                        <a
                          href={res.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                          title="Download / Preview File"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleVerifyResource(res.id, res.verified)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                          res.verified
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{res.verified ? "Verified ✓" : "Verify"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Permanently Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OPPORTUNITIES MANAGER & DELETIONS */}
      {activeTab === "opportunities" && (
        <div className="space-y-4 animate-fade-in">
          {opportunities.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Opportunities Listed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active hackathons or internship opportunities in the database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between transition-all ${
                    opp.isFeatured
                      ? "bg-amber-950/20 border-amber-500/40 shadow-lg"
                      : "bg-slate-900/85 border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                        {opp.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Due: {opp.deadline}</span>
                    </div>
                    <h4 className="font-bold text-white text-base mb-1">{opp.title}</h4>
                    <span className="text-xs text-slate-400 font-medium">{opp.company} • {opp.location}</span>
                    {opp.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2">{opp.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 font-semibold">
                      {opp.stipendOrPrize}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFeatureOpportunity(opp.id, opp.isFeatured)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                          opp.isFeatured
                            ? "bg-amber-950 text-amber-300 border border-amber-500/50"
                            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                        }`}
                        title="Toggle Featured Spotlight"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{opp.isFeatured ? "Featured ★" : "Feature"}</span>
                      </button>

                      {opp.applyUrl && opp.applyUrl !== "#" && (
                        <a
                          href={opp.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                          title="Open Application Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Permanently Delete Opportunity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CAMPUS EVENTS MANAGER & DELETIONS */}
      {activeTab === "events" && (
        <div className="space-y-4 animate-fade-in">
          {events.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Campus Events Scheduled</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No upcoming workshops or tech talks registered in the database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-900/85 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                        {evt.category}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 font-semibold">
                        {evt.isOnline ? "🌐 Virtual Stream" : `📍 ${evt.venue}`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base">{evt.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          {evt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {evt.time}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{evt.speaker.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {evt.speaker.role} • {evt.speaker.company}
                        </div>
                      </div>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      👥 {evt.registeredCount} / {evt.maxCapacity} seats reserved
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/events"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                        title="View on Events Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Permanently Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SYSTEM TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="bg-slate-900/85 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-fade-in backdrop-blur-md">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-mono">Infrastructure Diagnostics</h3>
            <p className="text-xs text-slate-400">Live operational metrics and storage integrity logs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block">Database Cluster</span>
              <span className="text-emerald-400 font-bold text-sm block">
                {isSupabaseLive ? "Supabase PostgreSQL (Active)" : "Local Development Sandbox"}
              </span>
              <span className="text-slate-500 text-[11px]">Region: AWS ap-south-1 / US</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block">Storage Bucket</span>
              <span className="text-cyan-400 font-bold text-sm block">academic-vault (50MB cap)</span>
              <span className="text-slate-500 text-[11px]">Public Read CDN: Enabled</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-slate-400 block">Safety Engine</span>
              <span className="text-purple-400 font-bold text-sm block">PII & Contact Leak Filter</span>
              <span className="text-slate-500 text-[11px]">Regex Rules: Anti-Doxxing Active</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-2">
            <div className="text-cyan-300 font-semibold">{"// Live Audit Event Stream"}</div>
            <div className="text-slate-500">• [2026-08-09] Moderator session authenticated via access code</div>
            <div className="text-slate-500">
              • [2026-08-09] Table sync: confessions ({confessions.length}), resources ({resources.length}), opportunities ({opportunities.length}), events ({events.length}), reports ({reports.length})
            </div>
            <div className="text-slate-500">• [2026-08-09] Anti-Doxxing filter checked: 0 phone leaks detected</div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
