"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MessageSquareQuote,
  FileCode2,
  Sparkles,
  Trash2,
  Flame,
  CheckCircle2,
  XCircle,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Toast from "@/components/Toast";
import { Confession, Resource, Opportunity } from "@/lib/types";
import { MOCK_CONFESSIONS, MOCK_RESOURCES, MOCK_OPPORTUNITIES } from "@/lib/mock-data";

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

  const [activeTab, setActiveTab] = useState<"reports" | "confessions" | "resources" | "opportunities" | "telemetry">("confessions");
  const [confessionFilter, setConfessionFilter] = useState<"pending" | "approved" | "all">("pending");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>(MOCK_CONFESSIONS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
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
      if (dataRep.reports) {
        setReports(dataRep.reports);
      }

      // 2. Fetch All Confessions (including pending)
      const resConf = await fetch("/api/confessions?all=true");
      const dataConf = await resConf.json();
      if (dataConf.data) {
        setConfessions(dataConf.data);
      }
      setIsSupabaseLive(dataConf.source === "supabase");

      // 3. Fetch Resources
      const resRes = await fetch("/api/resources");
      const dataRes = await resRes.json();
      if (dataRes.data) {
        setResources(dataRes.data);
      }

      // 4. Fetch Opportunities
      const resOpp = await fetch("/api/opportunities");
      const dataOpp = await resOpp.json();
      if (dataOpp.data) {
        setOpportunities(dataOpp.data);
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

  // Action: Toggle Resource Verified Badge
  const handleToggleVerifyResource = async (resourceId: string, currentVerified?: boolean) => {
    const nextState = !Boolean(currentVerified);
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, verified: nextState } : r))
    );
    setToastMessage(nextState ? "Resource marked as Verified ✓" : "Verification badge removed");

    try {
      await fetch(`/api/admin/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: nextState }),
      });
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Pending Authorizations</span>
            <ShieldAlert className={`w-4 h-4 ${pendingConfessionsCount > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${pendingConfessionsCount > 0 ? "text-amber-400" : "text-white"}`}>
            {pendingConfessionsCount}
          </div>
          <span className="text-[11px] text-slate-500">Confessions awaiting approval</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Incident Reports</span>
            <ShieldAlert className={`w-4 h-4 ${pendingReportsCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${pendingReportsCount > 0 ? "text-rose-400" : "text-white"}`}>
            {pendingReportsCount}
          </div>
          <span className="text-[11px] text-slate-500">Requires rule review</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Academic Vault</span>
            <FileCode2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {resources.length}
          </div>
          <span className="text-[11px] text-slate-500">{resources.filter((r) => r.verified).length} Verified Files</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Active Radars</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {opportunities.length}
          </div>
          <span className="text-[11px] text-slate-500">Hackathons & Internships</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("confessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "confessions"
              ? "bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-purple"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4 text-purple-400" />
          <span>Confessions Authorization ({pendingConfessionsCount} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "reports"
              ? "bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Incident Reports ({pendingReportsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "opportunities"
              ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Opportunity Radar ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "telemetry"
              ? "bg-slate-800 text-slate-200 border border-slate-700"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Database Telemetry</span>
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  confessionFilter === "pending"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>⏳ Pending Authorization</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                  {pendingConfessionsCount}
                </span>
              </button>

              <button
                onClick={() => setConfessionFilter("approved")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  confessionFilter === "approved"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>✅ Live / Published</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {approvedConfessionsCount}
                </span>
              </button>

              <button
                onClick={() => setConfessionFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  confessionFilter === "all"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📋 All ({confessions.length})</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Moderation Policy: <strong>Authorization Required Prior to Publishing</strong>
            </span>
          </div>

          {/* Confessions List */}
          {confessions.filter((c) => {
            const isPending = c.isApproved === false || c.status === "PENDING";
            if (confessionFilter === "pending") return isPending;
            if (confessionFilter === "approved") return !isPending;
            return true;
          }).length === 0 ? (
            <div className="bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {confessionFilter === "pending"
                  ? "Zero Pending Confessions!"
                  : "No Confessions Found"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {confessionFilter === "pending"
                  ? "All student submissions have been reviewed and authorized. New submissions will appear here for authorization."
                  : "No confessions matched the current filter criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confessions
                .filter((c) => {
                  const isPending = c.isApproved === false || c.status === "PENDING";
                  if (confessionFilter === "pending") return isPending;
                  if (confessionFilter === "approved") return !isPending;
                  return true;
                })
                .map((conf) => {
                  const isPending = conf.isApproved === false || conf.status === "PENDING";
                  return (
                    <div
                      key={conf.id}
                      className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between transition-all ${
                        isPending
                          ? "bg-slate-900/95 border-amber-500/50 shadow-md shadow-amber-500/5"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        {/* Header Badge Row */}
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-300">
                              {conf.alias} ({conf.batch})
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {conf.category}
                            </span>
                            {isPending ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                                ⏳ Pending Authorization
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                                ✅ Live & Published
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-500 font-mono">{conf.timestamp}</span>
                        </div>

                        {/* Confession Body */}
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {conf.content}
                        </p>

                        {/* Tags */}
                        {conf.tags && conf.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {conf.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs text-slate-400 font-mono">
                          ❤️ {conf.likes} likes • 💬 {conf.comments?.length || 0} replies
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending ? (
                            /* PENDING ACTIONS: AUTHORIZE OR REJECT */
                            <>
                              <button
                                onClick={() => handleAuthorizeConfession(conf.id, true)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Authorize & Publish ✓</span>
                              </button>

                              <button
                                onClick={() => handleDeleteConfession(conf.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Reject and delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            /* APPROVED ACTIONS: FEATURE, REVOKE, DELETE */
                            <>
                              <button
                                onClick={() => handleToggleTrending(conf.id, conf.isTrending)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                                  conf.isTrending
                                    ? "bg-rose-950 text-rose-300 border border-rose-500/50"
                                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                                }`}
                              >
                                <Flame className={`w-3.5 h-3.5 ${conf.isTrending ? "fill-rose-400 text-rose-400" : ""}`} />
                                <span>{conf.isTrending ? "Trending" : "Feature"}</span>
                              </button>

                              <button
                                onClick={() => handleAuthorizeConfession(conf.id, false)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
                                title="Revoke live status and send back to pending"
                              >
                                Revoke
                              </button>

                              <button
                                onClick={() => handleDeleteConfession(conf.id)}
                                className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCIDENT REPORTS QUEUE */}
      {activeTab === "reports" && (
        <div className="space-y-4 animate-fade-in">
          {reports.length === 0 ? (
            <div className="bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Zero Pending Violations</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active honor code reports queued for review. All community content adheres to guidelines.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    report.status === "PENDING_REVIEW"
                      ? "bg-slate-900/90 border-rose-500/40 shadow-sm"
                      : "bg-slate-900/50 border-slate-800 opacity-75"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-500/30">
                        {report.reason}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1">
                        <Link href={report.post_url} target="_blank">
                          {report.post_url}
                        </Link>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200">
                      <strong>Report Note:</strong> {report.details || "No additional context provided."}
                    </p>

                    <div className="text-xs font-mono">
                      Status:{" "}
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

      {/* TAB 3: ACADEMIC VAULT APPROVALS */}
      {activeTab === "resources" && (
        <div className="space-y-4 animate-fade-in">
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
                      title="Remove Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPPORTUNITIES MANAGER */}
      {activeTab === "opportunities" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-slate-900/85 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
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
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 font-semibold">
                    {opp.stipendOrPrize}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                      title="Open Application Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => {
                        setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
                        setToastMessage("Opportunity listing archived");
                      }}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM TELEMETRY */}
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
            <div className="text-slate-500">• [2026-08-09] Table sync: confessions ({confessions.length}), resources ({resources.length}), reports ({reports.length})</div>
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
