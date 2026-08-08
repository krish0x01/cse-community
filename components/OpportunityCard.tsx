"use client";

import { useState } from "react";
import { Opportunity } from "@/lib/types";
import {
  Sparkles,
  Bookmark,
  Calendar,
  MapPin,
  ArrowUpRight,
  Clock,
  CheckCircle,
  X,
  Send,
  Building2,
} from "lucide-react";
import Toast from "./Toast";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    setToastMessage(bookmarked ? "Removed from saved opportunities" : "Saved to your bookmarks!");
  };

  const handleApply = () => {
    setApplied(true);
    setToastMessage("Redirecting to official opportunity portal...");
    setTimeout(() => {
      setDetailsOpen(false);
    }, 1200);
  };

  const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
    Hackathon: { bg: "bg-purple-950/80", text: "text-purple-300", border: "border-purple-500/40" },
    Internship: { bg: "bg-cyan-950/80", text: "text-cyan-300", border: "border-cyan-500/40" },
    Scholarship: { bg: "bg-blue-950/80", text: "text-blue-300", border: "border-blue-500/40" },
    Workshop: { bg: "bg-amber-950/80", text: "text-amber-300", border: "border-amber-500/40" },
  };

  const style = typeStyles[opportunity.type] || {
    bg: "bg-slate-800",
    text: "text-slate-300",
    border: "border-slate-700",
  };

  return (
    <>
      <div className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/40 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
        {opportunity.isFeatured && (
          <div className="absolute top-0 right-0">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-bold text-[10px] font-mono px-3 py-1 rounded-bl-xl shadow-cyan">
              <Sparkles className="w-3 h-3" /> FEATURED
            </span>
          </div>
        )}

        <div>
          {/* Top category & company info */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
            >
              {opportunity.type}
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {opportunity.company}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-base sm:text-lg leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
            {opportunity.title}
          </h3>

          {/* Stipend & Location Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-cyan-500/30 text-cyan-300 shadow-sm">
              {opportunity.stipendOrPrize}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
              <MapPin className="w-3 h-3 text-slate-400" />
              {opportunity.location}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40">
              <Clock className="w-3 h-3 text-rose-400" />
              {opportunity.daysRemaining} days left
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
            {opportunity.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {opportunity.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono bg-slate-800/80 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Due: {opportunity.deadline}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl border transition-colors ${
                bookmarked
                  ? "bg-purple-950 border-purple-500/60 text-purple-300 shadow-purple"
                  : "border-slate-700 hover:border-purple-500/40 hover:bg-slate-800 text-slate-400"
              }`}
              title="Save Opportunity"
              aria-label="Save opportunity"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-purple-400 text-purple-400" : ""}`} />
            </button>

            <button
              onClick={() => setDetailsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs shadow-cyan transition-all active:scale-95"
            >
              <span>View & Apply</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cyan-500/30 relative animate-slide-up">
            <button
              onClick={() => setDetailsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                {opportunity.type}
              </span>
              <span className="text-xs font-semibold text-slate-300">{opportunity.company}</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 leading-snug">
              {opportunity.title}
            </h3>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 border border-cyan-500/30 text-cyan-300">
                {opportunity.stipendOrPrize}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                📍 {opportunity.locationDetail || opportunity.location}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40">
                ⏳ Due by {opportunity.deadline}
              </span>
            </div>

            <div className="space-y-4 mb-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-semibold text-cyan-400 text-xs uppercase tracking-wider font-mono mb-1">
                  About Opportunity
                </h4>
                <p className="text-slate-300">{opportunity.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-400 text-xs uppercase tracking-wider font-mono mb-1">
                  Eligibility & Requirements
                </h4>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{opportunity.eligibility}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleApply}
                disabled={applied}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{applied ? "Application Link Opened ✓" : "Apply on Official Site"}</span>
              </button>
              <button
                onClick={toggleBookmark}
                className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
              >
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
