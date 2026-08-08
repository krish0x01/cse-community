"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Toast from "@/components/Toast";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [batch, setBatch] = useState("CSE '26");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setToastMessage(
        isSignUp
          ? "🎉 Student account created! Verification email simulated."
          : "Logged in successfully! Welcome back."
      );
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastMessage("Authenticated via Google Workspace (Campus SSO)");
    }, 700);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm shadow-cyan">
              &gt;_
            </div>
            <span className="font-bold text-xl text-white font-mono tracking-tight">
              CSE<span className="text-cyan-400">.</span>Community
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? "Create Student Account" : "Sign in to your campus hub"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isSignUp
              ? "Join verified peers, curate resource vaults & track hackathons."
              : "Read confessions anonymously or manage your student uploads."}
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-slate-900/85 rounded-3xl border border-slate-800 shadow-card p-6 sm:p-8 space-y-6 backdrop-blur-md">
          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-slate-600 text-white text-sm font-semibold shadow-subtle transition-all active:scale-98 disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google / College Mail</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider relative">
              or credentials
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                    Full Name (Optional for anonymous posting)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                    Batch Year
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                  >
                    <option value="CSE '25" className="bg-slate-900">CSE &apos;25 (Final Year)</option>
                    <option value="CSE '26" className="bg-slate-900">CSE &apos;26 (3rd Year)</option>
                    <option value="CSE '27" className="bg-slate-900">CSE &apos;27 (2nd Year)</option>
                    <option value="CSE '28" className="bg-slate-900">CSE &apos;28 (Freshers)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu or personal"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setToastMessage("Password reset email simulated!")}
                    className="text-xs text-cyan-400 hover:underline font-medium"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:bg-slate-900 focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? "Signing in..." : isSignUp ? "Create Account" : "Sign In"}</span>
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-bold text-cyan-300 hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to the platform?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-cyan-300 hover:underline"
                >
                  Create Student Account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Verification benefits note */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Why verify with college email?</span>
          </div>
          <p className="leading-relaxed">
            College email domains unlock the <strong className="text-cyan-300">Verified Contributor Badge</strong> for sharing notes,
            access to alumni placement mocks, and priority hackathon squad matchmaking.
          </p>
        </div>

        {/* Guest continue link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 font-medium inline-flex items-center gap-1"
          >
            <span>Continue browsing as guest</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </Link>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
