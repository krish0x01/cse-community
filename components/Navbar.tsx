"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageSquareQuote,
  FileCode2,
  Sparkles,
  Calendar,
  ShieldCheck,
  PlusCircle,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/confessions", label: "Confessions", icon: MessageSquareQuote },
    { href: "/resources", label: "Resources", icon: FileCode2 },
    { href: "/opportunities", label: "Opportunities", icon: Sparkles },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/rules", label: "Rules", icon: ShieldCheck },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav border-b border-cyan-500/20 shadow-lg shadow-black/50 py-3"
          : "bg-[#080b14]/90 border-b border-slate-800/60 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-cyan group-hover:border-purple-500/60 group-hover:shadow-purple transition-all duration-300 relative overflow-hidden">
              <span className="text-cyan-400 font-extrabold group-hover:text-purple-400 transition-colors">&gt;</span>
              <span className="text-white">_</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-lg leading-none font-mono group-hover:text-cyan-300 transition-colors">
                  CSE<span className="text-cyan-400">.</span>Community
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950/70 text-purple-300 border border-purple-500/30">
                  v2.6
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Your campus. Unfiltered.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Login & Submit Button */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                pathname === "/login"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Login</span>
            </Link>

            <Link
              href="/submit"
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-sm shadow-cyan hover:shadow-cyan-lg transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              <span>Submit</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-bold text-xs shadow-cyan"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none border border-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-500/20 bg-[#080b14]/98 px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Login to Account</span>
            </Link>
            <Link
              href="/submit"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 shadow-cyan"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Post or Resource</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
