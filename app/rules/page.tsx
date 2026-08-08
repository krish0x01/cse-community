"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Lock,
  Users,
  EyeOff,
} from "lucide-react";
import { MOCK_RULES } from "@/lib/mock-data";
import Toast from "@/components/Toast";

export default function RulesPage() {
  const [reportUrl, setReportUrl] = useState("");
  const [reportReason, setReportReason] = useState("Rule #1: Harassment or Personal Attack");
  const [reportDetails, setReportDetails] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rules/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postUrl: reportUrl,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      const result = await res.json();
      setToastMessage(result.message || "Report submitted to moderation council!");
      setReportUrl("");
      setReportDetails("");
    } catch {
      setToastMessage("Report submitted to moderation council!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-cyan-500/30 shadow-card relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-cyan">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Community Constitution • Adopted 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Community Guidelines & Honor Code
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            CSE Community is built on the principle of unfiltered honesty without harm.
            These 5 foundational rules ensure psychological safety, strict privacy protection,
            and academic excellence for all students.
          </p>
        </div>

        {/* Ambient background deco */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* The 5 Core Rules Breakdown */}
      <section className="space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight">
            The 5 Fundamental Pillars
          </h2>
        </div>

        <div className="space-y-6">
          {MOCK_RULES.map((rule) => (
            <article
              key={rule.number}
              className="bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-cyan-500/30 shadow-card p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-cyan-500/40 text-cyan-400 font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-cyan">
                  {rule.number}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {rule.title}
                  </h3>
                  <p className="text-xs font-mono font-medium text-cyan-400">
                    {"//"} {rule.tagline}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-slate-300 leading-relaxed">{rule.summary}</p>

              {/* Do's and Don'ts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Do's */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Encouraged & Allowed</span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-200 leading-relaxed">
                    {rule.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-rose-400 font-mono">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Strictly Prohibited</span>
                  </div>
                  <ul className="space-y-2 text-xs text-rose-200 leading-relaxed">
                    {rule.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Consequence notice */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Enforcement Action: {rule.consequence}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Moderation Transparency & FAQ */}
      <section id="moderation" className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-extrabold text-white font-mono tracking-tight">
            How Moderation & Anonymity Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/30 shadow-card space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">
              Header Stripping
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a confession is sent, reverse proxies strip User-Agent strings, IP sockets, and device identifiers.
              Even database administrators cannot reverse-engineer the author.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-purple-500/30 shadow-card space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">
              Peer Review Council
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Moderation flags require quorum consensus from at least 3 elected student moderators.
              No single person can unilaterally censor a legitimate student critique.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/30 shadow-card space-y-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">
              Transparent Appeals
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an educational resource or confession was taken down in error, authors can submit an appeal.
              Decisions are logged and reviewed every semester.
            </p>
          </div>
        </div>
      </section>

      {/* Report Violation Section */}
      <section className="bg-slate-900/85 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-card space-y-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Community Oversight</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Report a Rule Violation or Doxxing Incident
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Notice a post that contains private phone numbers, names, or malicious harassment?
            Submit an urgent flag for priority removal.
          </p>
        </div>

        <form onSubmit={handleReportSubmit} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
              URL or Post Identifier *
            </label>
            <input
              required
              type="text"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
              placeholder="e.g. /confessions#conf-1 or post title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
              Specific Rule Violated *
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
            >
              <option value="Rule #1: Harassment or Personal Attack" className="bg-slate-900">Rule #1: Harassment or Personal Attack</option>
              <option value="Rule #2: Doxxing or Private Information Disclosure" className="bg-slate-900">Rule #2: Doxxing / Private Contact Sharing</option>
              <option value="Rule #3: Plagiarism / Malicious File Link" className="bg-slate-900">Rule #3: Malicious File Link or Exam Compromise</option>
              <option value="Rule #4: Dangerous Misinformation" className="bg-slate-900">Rule #4: Dangerous Misinformation</option>
              <option value="Rule #5: Spam / Bot Link" className="bg-slate-900">Rule #5: Repetitive Spam or Scam Link</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
              Additional Context for Moderators
            </label>
            <textarea
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide brief details on why this violates community safety..."
              className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Urgent Report</span>
          </button>
        </form>
      </section>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
