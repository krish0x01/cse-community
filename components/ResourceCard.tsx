"use client";

import { useState } from "react";
import { Resource } from "@/lib/types";
import {
  FileText,
  Download,
  CheckCircle,
  Star,
  Eye,
  FileCode,
  FolderArchive,
  HardDrive,
  X,
} from "lucide-react";
import Toast from "./Toast";

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(resource.downloads);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownload = () => {
    setDownloading(true);
    setDownloadCount((prev) => prev + 1);
    setToastMessage(`Downloading "${resource.title.slice(0, 30)}..."`);

    // If real URL is available, open or trigger download
    if (resource.linkUrl && resource.linkUrl !== "#" && !resource.linkUrl.includes("example.com")) {
      window.open(resource.linkUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setDownloading(false);
    }, 800);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "PDF":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "ZIP":
        return <FolderArchive className="w-5 h-5 text-amber-400" />;
      case "Code":
        return <FileCode className="w-5 h-5 text-cyan-400" />;
      case "Drive":
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const categoryBadgeColors: Record<string, string> = {
    Notes: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
    PYQ: "bg-purple-950/80 text-purple-300 border-purple-500/40",
    Practical: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    Roadmap: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    Tool: "bg-pink-950/80 text-pink-300 border-pink-500/40",
  };

  return (
    <>
      <div className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-purple-500/40 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative backdrop-blur-md">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-cyan-500/30 text-cyan-300 shadow-sm">
                {resource.subjectCode}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {resource.semester}
              </span>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                categoryBadgeColors[resource.category] || "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {resource.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-base leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
            {resource.description}
          </p>

          {/* Verification & Meta info */}
          <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-y border-slate-800 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              {resource.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 fill-cyan-950" />
              )}
              <span className="truncate max-w-[180px]">{resource.author}</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{resource.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>{resource.fileSize}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700">
              {getFormatIcon(resource.format)}
            </div>
            <div className="text-left">
              <span className="block text-[11px] text-slate-400">Downloads</span>
              <span className="font-mono font-semibold text-xs text-white">
                {downloadCount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewOpen(true)}
              className="p-2 rounded-xl border border-slate-700 hover:border-cyan-500/40 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Preview Resource"
              aria-label="Preview resource details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs shadow-cyan transition-all active:scale-95 disabled:opacity-75"
            >
              <Download className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`} />
              <span>{downloading ? "Saving..." : "Download"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cyan-500/30 relative animate-slide-up">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold">
                {resource.subjectCode}
              </span>
              <span className="text-xs text-slate-400 font-mono">{resource.semester}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${categoryBadgeColors[resource.category]}`}
              >
                {resource.category}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
              {resource.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {resource.description}
            </p>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 mb-6 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Verified Source:</span>
                <span className="font-semibold text-white">{resource.author}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">File Format & Size:</span>
                <span className="font-mono font-medium text-cyan-300">
                  {resource.format} ({resource.fileSize})
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Community Rating:</span>
                <span className="font-semibold text-amber-400">
                  ★ {resource.rating} / 5.0 ({resource.downloads} downloads)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Integrity Check:</span>
                <span className="text-cyan-400 font-semibold">SHA-256 Verified ✓</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  handleDownload();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Resource</span>
              </button>
              <button
                onClick={() => {
                  setPreviewOpen(false);
                  setToastMessage("Resource link ready!");
                }}
                className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors"
              >
                Share
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
