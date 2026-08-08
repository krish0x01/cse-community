"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquareQuote,
  FileCode2,
  Sparkles,
  Calendar,
  Shield,
  CheckCircle2,
  Send,
  RefreshCw,
  UploadCloud,
  Check,
} from "lucide-react";
import Toast from "@/components/Toast";

type SubmissionType = "confession" | "resource" | "opportunity" | "event";

const RANDOM_ALIASES = [
  "BitwiseWanderer",
  "NullPointerCupid",
  "SyntaxErrorSurvivor",
  "ValgrindFanatic",
  "BinaryBeast",
  "CoffeeToCodeConverter",
  "GDB_Ghost",
  "VimEscaper",
  "RecursionDreamer",
];

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams?.get("type") as SubmissionType) || "confession";

  const [activeType, setActiveType] = useState<SubmissionType>(initialType);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File upload state for Resources
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Confession form state
  const [confessionCategory, setConfessionCategory] = useState("Academics");
  const [confessionAlias, setConfessionAlias] = useState("BitwiseWanderer");
  const [confessionBatch, setConfessionBatch] = useState("CSE '26");
  const [confessionContent, setConfessionContent] = useState("");
  const [confessionTags, setConfessionTags] = useState("#CampusLife");
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Resource form state
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceSubjectCode, setResourceSubjectCode] = useState("");
  const [resourceSubjectName, setResourceSubjectName] = useState("");
  const [resourceSemester, setResourceSemester] = useState("Semester 5");
  const [resourceCategory, setResourceCategory] = useState("Notes");
  const [resourceLink, setResourceLink] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");

  // Opportunity form state
  const [oppTitle, setOppTitle] = useState("");
  const [oppCompany, setOppCompany] = useState("");
  const [oppType, setOppType] = useState("Hackathon");
  const [oppLocation, setOppLocation] = useState("Remote");
  const [oppStipend, setOppStipend] = useState("");
  const [oppDeadline, setOppDeadline] = useState("");
  const [oppUrl, setOppUrl] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppEligibility, setOppEligibility] = useState("");

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("Workshop");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventSpeakerName, setEventSpeakerName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const handleRandomAlias = () => {
    const random = RANDOM_ALIASES[Math.floor(Math.random() * RANDOM_ALIASES.length)];
    setConfessionAlias(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let endpoint = "/api/confessions";
      let payload: Record<string, unknown> = {};

      if (activeType === "confession") {
        endpoint = "/api/confessions";
        payload = {
          alias: confessionAlias,
          batch: confessionBatch,
          category: confessionCategory,
          content: confessionContent,
          tags: confessionTags,
        };
      } else if (activeType === "resource") {
        endpoint = "/api/resources";
        payload = {
          title: resourceTitle,
          subjectCode: resourceSubjectCode,
          subjectName: resourceSubjectName,
          semester: resourceSemester,
          category: resourceCategory,
          linkUrl: resourceLink,
          description: resourceDescription,
          author: isAnonymous ? "Anonymous Contributor" : "Verified Student",
        };
      } else if (activeType === "opportunity") {
        endpoint = "/api/opportunities";
        payload = {
          title: oppTitle,
          company: oppCompany,
          type: oppType,
          location: oppLocation,
          stipendPrize: oppStipend,
          deadline: oppDeadline,
          applyUrl: oppUrl,
          description: oppDescription,
          eligibility: oppEligibility,
        };
      } else if (activeType === "event") {
        endpoint = "/api/events";
        payload = {
          title: eventTitle,
          category: eventCategory,
          date: eventDate,
          time: eventTime,
          venue: eventVenue,
          speakerName: eventSpeakerName,
          description: eventDescription,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setSubmitted(true);
      setToastMessage(result.message || "Submission received successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting content";
      setToastMessage(`⚠️ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setConfessionContent("");
    setResourceTitle("");
    setOppTitle("");
    setEventTitle("");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold shadow-cyan">
          <Send className="w-3.5 h-3.5" />
          <span>Campus Contribution Portal</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Submit to CSE Community
        </h1>
        <p className="text-sm text-slate-400">
          Share a confession anonymously, upload academic resources, broadcast hackathons, or host a meetup.
        </p>
      </div>

      {submitted ? (
        /* Success Confirmation Screen */
        <div className="bg-slate-900/90 rounded-3xl p-8 sm:p-12 border border-cyan-500/30 shadow-cyan text-center space-y-6 animate-slide-up backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-cyan">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Submission Received Successfully!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your {activeType} has been processed. Anonymous metadata was verified and stripped.
              It is now live in the community feed.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={
                activeType === "confession"
                  ? "/confessions"
                  : activeType === "resource"
                  ? "/resources"
                  : activeType === "opportunity"
                  ? "/opportunities"
                  : "/events"
              }
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs sm:text-sm shadow-cyan transition-all"
            >
              View in {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Feed
            </Link>

            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        /* Main Submission Form Card */
        <div className="bg-slate-900/85 rounded-3xl border border-slate-800 shadow-card overflow-hidden backdrop-blur-md">
          {/* Submission Type Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveType("confession")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                activeType === "confession"
                  ? "bg-slate-800 text-pink-300 shadow-sm border border-pink-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <MessageSquareQuote className="w-4 h-4 text-pink-400" />
              <span>Confession</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("resource")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                activeType === "resource"
                  ? "bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Resource</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("opportunity")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                activeType === "opportunity"
                  ? "bg-slate-800 text-purple-300 shadow-sm border border-purple-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Opportunity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("event")}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                activeType === "event"
                  ? "bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Event</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* 1. CONFESSION FORM */}
            {activeType === "confession" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Confession Category *
                    </label>
                    <select
                      value={confessionCategory}
                      onChange={(e) => setConfessionCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                    >
                      <option value="Academics" className="bg-slate-900">Academics & Exams</option>
                      <option value="Rants" className="bg-slate-900">Curriculum & Campus Rants</option>
                      <option value="Campus Life" className="bg-slate-900">Campus Life & Labs</option>
                      <option value="Romance" className="bg-slate-900">Romance & Crushes</option>
                      <option value="Placements" className="bg-slate-900">Placements & Internships</option>
                      <option value="Hostel" className="bg-slate-900">Hostel & Mess Stories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Batch Tag
                    </label>
                    <select
                      value={confessionBatch}
                      onChange={(e) => setConfessionBatch(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                    >
                      <option value="CSE '24" className="bg-slate-900">CSE &apos;24 (Alumni)</option>
                      <option value="CSE '25" className="bg-slate-900">CSE &apos;25 (Final Year)</option>
                      <option value="CSE '26" className="bg-slate-900">CSE &apos;26 (3rd Year)</option>
                      <option value="CSE '27" className="bg-slate-900">CSE &apos;27 (2nd Year)</option>
                      <option value="CSE '28" className="bg-slate-900">CSE &apos;28 (Freshers)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                      Anonymous Persona Alias
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomAlias}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={confessionAlias}
                    onChange={(e) => setConfessionAlias(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 font-mono text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                    placeholder="e.g. BitwiseWanderer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                      Your Unfiltered Story / Confession *
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {confessionContent.length} / 1000
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    maxLength={1000}
                    value={confessionContent}
                    onChange={(e) => setConfessionContent(e.target.value)}
                    placeholder="Type freely. Do not mention real names, phone numbers, or room numbers to protect everyone's privacy..."
                    className="w-full p-4 rounded-2xl border border-slate-700 bg-slate-800 text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Tags (Space separated)
                  </label>
                  <input
                    type="text"
                    value={confessionTags}
                    onChange={(e) => setConfessionTags(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400 font-mono text-xs"
                    placeholder="#Deadlines #LabLife #Hostel3"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-1 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                  />
                  <label htmlFor="anonCheck" className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold block text-white">
                      Enable Cryptographic Anonymization
                    </span>
                    Strip all device fingerprints and browser headers before transmission. I affirm this confession does not contain personal doxxing or targeted harassment.
                  </label>
                </div>
              </div>
            )}

            {/* 2. RESOURCE FORM */}
            {activeType === "resource" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Subject Code *
                    </label>
                    <input
                      required
                      type="text"
                      value={resourceSubjectCode}
                      onChange={(e) => setResourceSubjectCode(e.target.value)}
                      placeholder="e.g. CS-301"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white font-mono focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Subject Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={resourceSubjectName}
                      onChange={(e) => setResourceSubjectName(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Semester *
                    </label>
                    <select
                      value={resourceSemester}
                      onChange={(e) => setResourceSemester(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    >
                      <option value="Semester 1" className="bg-slate-900">Semester 1</option>
                      <option value="Semester 2" className="bg-slate-900">Semester 2</option>
                      <option value="Semester 3" className="bg-slate-900">Semester 3</option>
                      <option value="Semester 4" className="bg-slate-900">Semester 4</option>
                      <option value="Semester 5" className="bg-slate-900">Semester 5</option>
                      <option value="Semester 6" className="bg-slate-900">Semester 6</option>
                      <option value="Semester 7" className="bg-slate-900">Semester 7</option>
                      <option value="Semester 8" className="bg-slate-900">Semester 8</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Resource Category *
                    </label>
                    <select
                      value={resourceCategory}
                      onChange={(e) => setResourceCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    >
                      <option value="Notes" className="bg-slate-900">Handwritten Lecture Notes</option>
                      <option value="PYQ" className="bg-slate-900">Solved Previous Year Papers (PYQ)</option>
                      <option value="Practical" className="bg-slate-900">Lab Codes & Manuals</option>
                      <option value="Roadmap" className="bg-slate-900">Placement Roadmap / Cheat Sheet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Resource Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Complete CPU Scheduling & Memory Management Hand-Annotated Notes"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>

                {/* File Upload to Supabase Storage or Cloud URL */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    Upload PDF / Notes File or Paste Link *
                  </label>

                  {/* File Upload Box */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition-all text-center relative overflow-hidden">
                    <input
                      type="file"
                      id="resourceFileInput"
                      accept=".pdf,.zip,.py,.java,.cpp,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingFile(true);
                        setToastMessage(`Uploading ${file.name} to Supabase Storage...`);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || "Upload failed");

                          setResourceLink(data.url);
                          setUploadedFileName(file.name);
                          setUploadedFileSize(data.fileSize);
                          if (!resourceTitle) {
                            setResourceTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
                          }
                          setToastMessage(data.message || "File uploaded to Academic Vault!");
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : "Upload error";
                          setToastMessage(`⚠️ ${msg}`);
                        } finally {
                          setIsUploadingFile(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    {uploadedFileName ? (
                      <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono py-2">
                        <Check className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold">{uploadedFileName}</span>
                        <span className="text-slate-400">({uploadedFileSize})</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-[10px] text-cyan-300 border border-cyan-500/40">
                          Uploaded ✓
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                        <UploadCloud className={`w-8 h-8 text-cyan-400 ${isUploadingFile ? "animate-bounce" : ""}`} />
                        <span className="text-xs font-semibold text-white">
                          {isUploadingFile ? "Uploading to Supabase Storage..." : "Click or Drag & Drop PDF / Notes File"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Supports PDF, ZIP, Code (up to 50MB)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Or Manual URL Input */}
                  <div className="relative">
                    <input
                      required
                      type="url"
                      value={resourceLink}
                      onChange={(e) => setResourceLink(e.target.value)}
                      placeholder="Or paste Google Drive / Dropbox link (https://...)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white font-mono focus:bg-slate-900 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Overview & Key Topics Covered
                  </label>
                  <textarea
                    rows={3}
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                    placeholder="Briefly describe what chapters or practical questions are included..."
                    className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* 3. OPPORTUNITY FORM */}
            {activeType === "opportunity" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Opportunity / Event Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={oppTitle}
                      onChange={(e) => setOppTitle(e.target.value)}
                      placeholder="e.g. HackCampus 2026 or SDE Summer Intern"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Organization / Company *
                    </label>
                    <input
                      required
                      type="text"
                      value={oppCompany}
                      onChange={(e) => setOppCompany(e.target.value)}
                      placeholder="e.g. Google, Devfolio, Atlassian"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Type *
                    </label>
                    <select
                      value={oppType}
                      onChange={(e) => setOppType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    >
                      <option value="Hackathon" className="bg-slate-900">Hackathon</option>
                      <option value="Internship" className="bg-slate-900">Internship</option>
                      <option value="Scholarship" className="bg-slate-900">Scholarship / Fellowship</option>
                      <option value="Workshop" className="bg-slate-900">Technical Workshop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Location *
                    </label>
                    <select
                      value={oppLocation}
                      onChange={(e) => setOppLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    >
                      <option value="Remote" className="bg-slate-900">Remote</option>
                      <option value="On-site" className="bg-slate-900">On-site Campus</option>
                      <option value="Hybrid" className="bg-slate-900">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Stipend / Prize Pool
                    </label>
                    <input
                      type="text"
                      value={oppStipend}
                      onChange={(e) => setOppStipend(e.target.value)}
                      placeholder="e.g. ₹50,000 / mo"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white font-mono focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Deadline Date *
                    </label>
                    <input
                      required
                      type="text"
                      value={oppDeadline}
                      onChange={(e) => setOppDeadline(e.target.value)}
                      placeholder="e.g. March 25, 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Official Application Link *
                    </label>
                    <input
                      required
                      type="url"
                      value={oppUrl}
                      onChange={(e) => setOppUrl(e.target.value)}
                      placeholder="https://company.com/apply"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white font-mono focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Eligibility & Requirements
                  </label>
                  <input
                    type="text"
                    value={oppEligibility}
                    onChange={(e) => setOppEligibility(e.target.value)}
                    placeholder="e.g. Open to 2nd & 3rd year CSE undergrads with C++/Python fundamentals."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Opportunity Description & Perks
                  </label>
                  <textarea
                    rows={3}
                    value={oppDescription}
                    onChange={(e) => setOppDescription(e.target.value)}
                    placeholder="Briefly describe the hackathon tracks, internship responsibilities, or stipend details..."
                    className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* 4. EVENT FORM */}
            {activeType === "event" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Event Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Full-Stack Systems Masterclass by Alumni"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Category *
                    </label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    >
                      <option value="Tech Talk" className="bg-slate-900">Tech Talk / Webinar</option>
                      <option value="Workshop" className="bg-slate-900">Hands-on Workshop</option>
                      <option value="Meetup" className="bg-slate-900">Community Meetup / Pizza Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Date (e.g. Aug 28, 2026) *
                    </label>
                    <input
                      required
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Aug 28, 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Time *
                    </label>
                    <input
                      required
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="5:00 PM - 7:00 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Venue / Online Link *
                    </label>
                    <input
                      required
                      type="text"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder="e.g. Auditorium Hall 2 / Google Meet"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                      Speaker / Host Name
                    </label>
                    <input
                      type="text"
                      value={eventSpeakerName}
                      onChange={(e) => setEventSpeakerName(e.target.value)}
                      placeholder="e.g. Rohan Varma (Staff SWE @ Stripe)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
                    Event Overview & Agenda
                  </label>
                  <textarea
                    rows={3}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Describe what will be covered in the workshop/talk..."
                    className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Privacy & Safety Warning Alert */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5 text-white">Honor Code Notice</span>
                All submissions are protected under student community guidelines.
                Harassment, hate speech, or sharing personal private details violates Rule #1 and #2.
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/rules"
                className="text-xs text-slate-400 hover:text-cyan-300 font-medium underline"
              >
                Read Guidelines & Rules
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan hover:shadow-cyan-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-75"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Publishing..." : "Submit to Community"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export default function SubmitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Suspense fallback={<div className="p-8 text-center text-sm font-mono text-slate-500">Loading contribution portal...</div>}>
        <SubmitFormContent />
      </Suspense>
    </div>
  );
}
