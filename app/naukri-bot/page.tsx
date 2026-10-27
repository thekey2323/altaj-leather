'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  Briefcase, 
  Sliders, 
  ExternalLink, 
  Terminal, 
  Zap, 
  Clock, 
  Filter, 
  Search,
  CheckCircle,
  HelpCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
  X,
  Globe,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { ApplicationRecord, BotConfig, CandidateProfile, DashboardMetrics } from '@/lib/naukri/types';

export default function NaukriBotDashboard() {
  const [loading, setLoading] = useState(true);
  const [runningBot, setRunningBot] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [filterStanding, setFilterStanding] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'APPLICATIONS' | 'CONSOLE'>('DASHBOARD');

  // Connect Account Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isAutoPolling, setIsAutoPolling] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/naukri');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setApplications(data.applications);
        setProfile(data.profile);
        setConfig(data.config);
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBot = async (overrideMode?: 'SIMULATION' | 'LIVE') => {
    setRunningBot(true);
    try {
      const mode = overrideMode || config?.runMode || 'LIVE';
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', mode })
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setApplications(data.applications);
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Bot run failed', e);
    } finally {
      setRunningBot(false);
    }
  };

  const handleToggleMode = async () => {
    if (!config) return;
    const nextMode = config.runMode === 'SIMULATION' ? 'LIVE' : 'SIMULATION';
    try {
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          config: { runMode: nextMode }
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error('Mode toggle failed', e);
    }
  };

  const [edgeLaunched, setEdgeLaunched] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Automatic background polling when Edge is opened and waiting for login
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (showConnectModal && isAutoPolling && !verifying) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/naukri', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_edge' })
          });
          const data = await res.json();
          if (data.success) {
            setIsAutoPolling(false);
            setConnectionMessage(`🎉 Connected to ${data.candidateName || 'Naukrigulf'}! Fetched ${data.appliedCount ?? 0} applied jobs.`);
            setConfig(data.config);
            setMetrics(data.metrics);
            setLogs(data.logs);
            setTimeout(() => {
              setShowConnectModal(false);
            }, 2500);
          }
        } catch {
          // Ignore transient polling errors
        }
      }, 3500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showConnectModal, isAutoPolling, verifying]);

  const handleLaunchEdge = async () => {
    setConnecting(true);
    setConnectionMessage('Launching Microsoft Edge directly on your desktop to Naukrigulf.com...');
    try {
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'launch_edge',
          email: loginEmail.trim() || undefined,
          password: loginPassword || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setEdgeLaunched(true);
        setIsAutoPolling(true);
        setConnectionMessage('✅ Microsoft Edge is open! Log into Naukrigulf — this tool is actively listening and will auto-connect as soon as you sign in.');
      } else {
        setConnectionMessage(`Notice: ${data.message}`);
      }
    } catch (err: any) {
      setConnectionMessage(`Error: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleVerifyEdge = async () => {
    setVerifying(true);
    setConnectionMessage('Checking your Edge session and fetching candidate stats from Naukrigulf...');
    try {
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_edge' })
      });
      const data = await res.json();
      if (data.success) {
        setIsAutoPolling(false);
        setConnectionMessage(`🎉 Connected to ${data.candidateName || 'Naukrigulf'}! Fetched ${data.appliedCount ?? 0} applied jobs from your account.`);
        setConfig(data.config);
        setMetrics(data.metrics);
        setLogs(data.logs);
        setTimeout(() => setShowConnectModal(false), 2500);
      } else {
        setConnectionMessage(`⚠️ ${data.message || 'Please log in to your account in Edge first, then click verify.'}`);
      }
    } catch (err: any) {
      setConnectionMessage(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenConnectModal = () => {
    setShowConnectModal(true);
    setConnectionMessage('Enter your credentials (optional) and click "Launch Edge & Auto-Connect", or open Edge directly.');
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect_account' })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setMetrics(data.metrics);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Disconnect failed', err);
    }
  };

  const handleClearAllApplications = async () => {
    if (!confirm('Are you sure you want to clear all applications and reset metrics to 0?')) return;
    try {
      const res = await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_all_applications' })
      });
      const data = await res.json();
      if (data.success) {
        setApplications([]);
        setMetrics(data.metrics);
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Clear failed', err);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStanding === 'ALL') return matchesSearch;
    if (filterStanding === 'TOP_30') return matchesSearch && (app.applicantStanding === 'TOP_10' || app.applicantStanding === 'TOP_30');
    if (filterStanding === 'MID_40') return matchesSearch && app.applicantStanding === 'MID_40';
    if (filterStanding === 'BOTTOM_30') return matchesSearch && app.applicantStanding === 'BOTTOM_30';
    return matchesSearch;
  });

  // Chart data
  const pieData = metrics ? [
    { name: 'Top 10% (Elite)', value: applications.filter(a => a.applicantStanding === 'TOP_10').length, color: '#10B981' },
    { name: 'Top 30% (Competitive)', value: applications.filter(a => a.applicantStanding === 'TOP_30').length, color: '#06B6D4' },
    { name: 'Middle 40% (Average)', value: applications.filter(a => a.applicantStanding === 'MID_40').length, color: '#F59E0B' },
    { name: 'Bottom 30% (Low Fit)', value: applications.filter(a => a.applicantStanding === 'BOTTOM_30').length, color: '#EF4444' },
  ].filter(d => d.value > 0) : [];

  const barData = applications.slice(0, 7).map(app => ({
    name: app.company.length > 12 ? app.company.slice(0, 10) + '..' : app.company,
    score: app.matchScore,
    standing: app.applicantStanding === 'TOP_10' || app.applicantStanding === 'TOP_30' ? 'Top 30%' : 'Bottom/Mid'
  })).reverse();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RotateCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm">Connecting to Naukrigulf engine...</p>
      </div>
    );
  }

  const isConnected = config?.accountStatus === 'CONNECTED';

  return (
    <div className="space-y-8">
      {/* Real Account Connection Banner */}
      {!isConnected ? (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Connect via Microsoft Edge</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-amber-500/20 text-amber-300">
                  Required For Live Apply
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Opens an Edge tab to log into Naukrigulf. Once connected, it automatically fetches the number of applied jobs in your account to verify your connection!
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenConnectModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <Globe className="h-4 w-4" />
            <span>Connect via Microsoft Edge</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">
                  {config?.connectedName || profile?.name || 'Naukrigulf Account'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                  Microsoft Edge Verified
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {config?.connectedEmail || 'Candidate Account'}
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                Verified Account: <strong className="text-white text-sm font-bold">{metrics?.naukriAccountAppliedCount !== undefined ? metrics.naukriAccountAppliedCount : (config?.naukriAccountAppliedCount ?? 0)}</strong> Applied Jobs on Naukrigulf
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConnectModal(true)}
              className="text-slate-300 hover:text-white underline transition"
            >
              Re-sync Edge Tab
            </button>
            <button
              onClick={handleDisconnect}
              className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Hero Controls */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Naukrigulf 1-Click Easy Apply
              </span>
              <span className="text-xs text-slate-400">
                Targeting: <strong className="text-slate-200">HSE Officer & Engineer</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Daily Job Search & Standing Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Continuously searches Naukrigulf, matches jobs against your CV, submits Easy Apply applications, and tracks your rank standing (Top 30% vs Bottom 30%).
            </p>
          </div>

          {/* Action buttons & mode toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={handleToggleMode}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  config?.runMode === 'SIMULATION' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulation
              </button>
              <button
                onClick={handleToggleMode}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  config?.runMode === 'LIVE' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Auto-Apply
              </button>
            </div>

            {/* Run Button */}
            <button
              onClick={() => handleRunBot()}
              disabled={runningBot}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg ${
                runningBot
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {runningBot ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Processing Jobs...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run Daily Auto-Apply</span>
                </>
              )}
            </button>

            {/* Clear All Applications */}
            {applications.length > 0 && (
              <button
                onClick={handleClearAllApplications}
                className="p-2.5 rounded-xl bg-slate-850 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition"
                title="Clear All Applications"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/naukri-bot/profile"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Profile & Rules"
            >
              <Sliders className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Account Applied Jobs */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Account Applied Jobs</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metrics?.naukriAccountAppliedCount !== undefined ? metrics.naukriAccountAppliedCount : (config?.naukriAccountAppliedCount ?? metrics?.totalApplied ?? 0)}
            </span>
            <span className="text-xs text-slate-400">in Naukrigulf account</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {metrics?.appliedToday || 0} applied by bot today (Cap: {metrics?.dailyLimit || 25})
          </p>
        </div>

        {/* Card 2: TOP 30% Standing Rate */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top 30% Placements</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-300">{metrics?.top30Percentage || 0}%</span>
            <span className="text-xs text-slate-400">({metrics?.top30Count || 0} offers)</span>
          </div>
          <p className="mt-2 text-xs text-teal-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Ranked in Top 10% - 30% of applicants
          </p>
        </div>

        {/* Card 3: Avg CV Match Score */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average CV Match</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics?.avgMatchScore || 0}%</span>
            <span className="text-xs text-slate-400">compatibility</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            Min threshold set to {config?.minMatchScore || 72}%
          </p>
        </div>

        {/* Card 4: Bottom 30% Rate */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bottom 30% Standing</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400">{metrics?.bottom30Percentage || 0}%</span>
            <span className="text-xs text-slate-400">({metrics?.bottom30Count || 0} flagged)</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Filtered out or mismatched seniority
          </p>
        </div>
      </div>

      {/* Analytics & Standing Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Naukrigulf Standing Distribution */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                Applicant Standing on Naukrigulf
              </h3>
              <span className="text-[11px] text-slate-500">Live Breakdown</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Shows where your profile ranks compared to other candidates who clicked Easy Apply on the platform.
            </p>

            {pieData.length === 0 ? (
              <div className="h-48 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <Award className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No live application data yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Connect your account and click Run Daily Auto-Apply to populate.</p>
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 text-xs border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Top 10% (Elite Candidate)
              </span>
              <span className="font-semibold text-emerald-400">
                {applications.filter(a => a.applicantStanding === 'TOP_10').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Top 30% (Highly Competitive)
              </span>
              <span className="font-semibold text-cyan-400">
                {applications.filter(a => a.applicantStanding === 'TOP_30').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Middle 40% (Average Fit)
              </span>
              <span className="font-semibold text-amber-400">
                {applications.filter(a => a.applicantStanding === 'MID_40').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Bottom 30% (Low / Disqualified)
              </span>
              <span className="font-semibold text-rose-400">
                {applications.filter(a => a.applicantStanding === 'BOTTOM_30').length}
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Recent Match Scores & Standing by Employer */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Recent Applications: CV Match Score vs Requirement
              </h3>
              <span className="text-[11px] text-slate-500">Last 7 Offers</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Evaluation of NEBOSH/OSHA certifications, PTW experience, and HSE competencies against company job descriptions.
            </p>

            {barData.length === 0 ? (
              <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <TrendingUp className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No application chart to display yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Real applications will plot match score vs employer requirements here.</p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="score" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              Threshold: Auto-apply triggers for scores ≥ {config?.minMatchScore || 72}%
            </span>
            <Link href="/naukri-bot/profile" className="text-emerald-400 hover:underline">
              Adjust minimum score threshold →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs & Table Section */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`pb-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'DASHBOARD'
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              All Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('CONSOLE')}
              className={`pb-4 text-sm font-medium border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'CONSOLE'
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Live Activity Logs ({logs.length})
            </button>
          </div>

          {/* Quick Filters */}
          {activeTab === 'DASHBOARD' && applications.length > 0 && (
            <div className="flex items-center gap-3 pb-3">
              {/* Standing Filter */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setFilterStanding('ALL')}
                  className={`px-2.5 py-1 rounded-md transition ${filterStanding === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStanding('TOP_30')}
                  className={`px-2.5 py-1 rounded-md transition ${filterStanding === 'TOP_30' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400'}`}
                >
                  Top 30%
                </button>
                <button
                  onClick={() => setFilterStanding('MID_40')}
                  className={`px-2.5 py-1 rounded-md transition ${filterStanding === 'MID_40' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
                >
                  Mid 40%
                </button>
                <button
                  onClick={() => setFilterStanding('BOTTOM_30')}
                  className={`px-2.5 py-1 rounded-md transition ${filterStanding === 'BOTTOM_30' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'}`}
                >
                  Bottom 30%
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search role or employer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Applications Table */}
        {activeTab === 'DASHBOARD' && (
          <div className="overflow-x-auto">
            {filteredApps.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                  <Briefcase className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">No applications recorded yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {isConnected 
                    ? 'Your real account is connected! Click "Run Daily Auto-Apply" to scan Naukrigulf and apply to qualifying offers.' 
                    : 'Connect your real Naukrigulf account above to start automating Easy Apply applications.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  {!isConnected ? (
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                    >
                      Connect Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRunBot('LIVE')}
                      disabled={runningBot}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                    >
                      Run Live Auto-Apply Now
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Job Title & Employer</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 text-center">Match Score</th>
                    <th className="py-3.5 px-4 text-center">Applicant Standing</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Mode / Type</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition">
                      {/* Job Title & Company */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200 text-sm">{app.title}</div>
                        <div className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="h-3 w-3 text-slate-500" />
                          <span>{app.company}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-slate-300">
                        {app.location}
                      </td>

                      {/* Match Score */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                          app.matchScore >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : app.matchScore >= 72
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : app.matchScore >= 55
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {app.matchScore}%
                        </span>
                      </td>

                      {/* Standing (Top 30% / Bottom 30%) */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          app.applicantStanding === 'TOP_10'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : app.applicantStanding === 'TOP_30'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : app.applicantStanding === 'MID_40'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          <Award className="h-3 w-3" />
                          {app.standingLabel}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Mode / Type */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Easy Apply
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            app.mode === 'LIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {app.mode}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                        >
                          <span>View on Naukri</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Live Activity Logs */}
        {activeTab === 'CONSOLE' && (
          <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 space-y-1.5 max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine Execution Logs (Naukrigulf Automation Runner)
              </span>
              <button 
                onClick={() => handleRunBot()}
                disabled={runningBot}
                className="text-xs text-emerald-400 hover:underline"
              >
                Trigger Execution Now
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No logs generated yet.</p>
            ) : (
              logs.map((log, i) => (
                <div 
                  key={i} 
                  className={`py-0.5 ${
                    log.includes('TOP_10') || log.includes('TOP_30') || log.includes('SUCCESS')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('SKIPPED') || log.includes('BOTTOM_30') || log.includes('ERROR')
                      ? 'text-rose-400'
                      : log.includes('EVALUATING') || log.includes('CONNECTING')
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Connect via Microsoft Edge</h3>
                <p className="text-xs text-slate-400">Opens a real Edge tab to link your Naukrigulf account</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Automatic Browser Sync & Real Applied Count
              </p>
              <p className="text-slate-400 leading-relaxed">
                Click <strong>"Open Edge & Connect"</strong> below. It pops open Microsoft Edge to Naukrigulf. Once you sign in (and pass OTP if prompted), this app <strong>automatically catches your session</strong>, reads your candidate profile and <strong>fetches your real applied jobs count</strong> directly into your dashboard!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Naukrigulf Email (Optional — auto-fills into Edge login)
                </label>
                <input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password (Optional — auto-fills into Edge login)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status box with auto-listening radar indicator */}
            {isAutoPolling && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <span className="font-medium">
                  Actively listening for your login in Edge... Sign in on Naukrigulf and we'll automatically connect!
                </span>
              </div>
            )}

            {connectionMessage && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 animate-fadeIn">
                {connectionMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLaunchEdge}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Launching Edge...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Open Edge & Auto-Connect</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoPolling(false);
                    setShowConnectModal(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEdge}
                  disabled={verifying}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  {verifying ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Manual Sync</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
