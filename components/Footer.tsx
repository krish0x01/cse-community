import Link from "next/link";
import {
  Shield,
  Heart,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070d] text-slate-300 border-t border-slate-800/80 pt-16 pb-12 mt-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Highlight Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/20 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base">
                100% Anonymous & Zero Data Profiling
              </h4>
              <p className="text-slate-400 text-sm mt-0.5">
                Client headers are stripped at request time. No IP logs, cookies, or fingerprinting.
              </p>
            </div>
          </div>
          <Link
            href="/rules"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors border border-cyan-500/30 hover:border-cyan-400 whitespace-nowrap shadow-sm"
          >
            Read Community Rules
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm shadow-cyan">
                &gt;_
              </div>
              <span className="font-bold text-white tracking-tight text-xl font-mono">
                CSE<span className="text-cyan-400">.</span>Community
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier digital commons for Computer Science & Engineering students.
              Share unfiltered thoughts, discover study vaults, and crack top-tier tech opportunities.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs text-slate-300 font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-cyan" />
                <span className="text-cyan-300">Live Database Connected</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">v3.0 Release</span>
            </div>
          </div>

          {/* Quick Hubs */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-mono mb-4 text-cyan-400">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/confessions" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Anonymous Confessions
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Academic Resource Vault
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Opportunity Radar
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Hackathons & Meetups
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Submit Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Vault */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-mono mb-4 text-purple-400">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/resources?category=Notes" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Handwritten Notes
                </Link>
              </li>
              <li>
                <Link href="/resources?category=PYQ" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Solved PYQ Archive
                </Link>
              </li>
              <li>
                <Link href="/resources?category=Practical" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Lab Codes & Manuals
                </Link>
              </li>
              <li>
                <Link href="/resources?category=Roadmap" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Placement Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Honor Code & Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase font-mono mb-4 text-cyan-400">
              Governance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/rules" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  5 Core Rules
                </Link>
              </li>
              <li>
                <Link href="/rules#moderation" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Moderation Council
                </Link>
              </li>
              <li>
                <Link href="/rules#faq" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Privacy FAQ
                </Link>
              </li>
              <li>
                <Link href="/rules#appeals" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Content Appeals & Disputes
                </Link>
              </li>
              <li>
                <Link href="/rules#appeals" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Report Violation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 CSE Community. Created & engineered by{" "}
            <a
              href="https://github.com/krish0x01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline decoration-cyan-500/40 underline-offset-2"
            >
              krish0x01
            </a>
            .
          </p>
          <div className="flex items-center gap-6">
            <span>Independent & Non-Commercial</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400 inline" /> & Caffeine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
