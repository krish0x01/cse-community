"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-purple-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  const bgColors = {
    success: "bg-slate-900/95 border-cyan-500/40 text-slate-100 shadow-cyan",
    info: "bg-slate-900/95 border-purple-500/40 text-slate-100 shadow-purple",
    error: "bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-lg",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium animate-slide-up backdrop-blur-md transition-all ${bgColors[type]}`}
      role="alert"
    >
      {icons[type]}
      <span className="text-xs sm:text-sm">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors ml-2"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
