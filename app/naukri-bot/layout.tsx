import React from 'react';
import Link from 'next/link';
import { 
  Bot, 
  BarChart3, 
  UserCheck, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';

export const metadata = {
  title: 'NaukriPilot — Naukrigulf Easy Apply Bot & Standing Analytics',
  description: 'Automated job search, CV match scoring, 1-Click Easy Apply, and applicant standing rank analyzer for Naukrigulf.'
};

export default function NaukriBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
              <Bot className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  NaukriPilot
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Gulf Bot
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Globe className="h-3 w-3 text-emerald-400" />
                Targeting <span className="text-slate-300 font-medium">Naukrigulf.com</span> Easy Apply
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/naukri-bot"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition"
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Dashboard & Standing
            </Link>
            <Link 
              href="/naukri-bot/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              <UserCheck className="h-4 w-4 text-teal-400" />
              CV & Matching Rules
            </Link>
          </nav>

          {/* Quick Actions & Live Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/60 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Daily Auto-Apply Active</span>
            </div>

            <a
              href="https://www.naukrigulf.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20"
            >
              <span>Naukrigulf</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NaukriPilot Automation. Built for high-conversion Gulf job hunting.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Rate-Limit Protection
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Top 30% Standing Optimizer
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
