"use client";

import { useState } from "react";
import { EventItem } from "@/lib/types";
import {
  Clock,
  MapPin,
  Video,
  UserCheck,
  CheckCircle2,
  Users,
  Share2,
} from "lucide-react";
import Toast from "./Toast";

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const [registered, setRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(event.registeredCount);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleRSVP = () => {
    if (registered) {
      setRegistered(false);
      setRegisteredCount((prev) => prev - 1);
      setToastMessage("RSVP cancelled for " + event.title.slice(0, 24) + "...");
    } else {
      setRegistered(true);
      setRegisteredCount((prev) => prev + 1);
      setToastMessage("🎉 RSVP Confirmed! Calendar invite simulated.");
    }
  };

  const percentageFilled = Math.min(
    100,
    Math.round((registeredCount / event.totalSeats) * 100)
  );

  return (
    <>
      <div className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-purple-500/40 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* Header Row: Date Block + Tag */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Calendar Date Block */}
              <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center font-mono shadow-cyan border border-cyan-500/40 shrink-0">
                <span className="text-[10px] uppercase font-bold text-cyan-400 leading-none">
                  {event.month}
                </span>
                <span className="text-xl font-black text-white leading-tight">
                  {event.day}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 inline-block mb-1">
                  {event.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>

            {event.isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <Video className="w-3 h-3 text-cyan-400" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <MapPin className="w-3 h-3 text-emerald-400" /> On Campus
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-base sm:text-lg leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
            {event.title}
          </h3>

          {/* Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{event.venue}</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            {event.description}
          </p>

          {/* Speaker Profile Block */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-sm">
              {event.speaker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="text-xs">
              <span className="block font-semibold text-white">
                {event.speaker.name}
              </span>
              <span className="text-slate-400">
                {event.speaker.role} • {event.speaker.company}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: RSVP progress & CTA */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{registeredCount} / {event.totalSeats} registered</span>
            </span>
            <span className="font-mono font-medium text-cyan-300">{percentageFilled}% Full</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-500 ${
                percentageFilled > 80 ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-cyan-400 to-purple-400"
              }`}
              style={{ width: `${percentageFilled}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRSVP}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                registered
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-sm"
                  : "bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold shadow-cyan"
              }`}
            >
              {registered ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RSVP Confirmed (Registered)</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Register Free (RSVP)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`${window.location.origin}/events#${event.id}`);
                }
                setToastMessage("Event link copied to clipboard!");
              }}
              className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Share Event"
              aria-label="Share event"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
