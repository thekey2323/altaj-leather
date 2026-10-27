'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  RotateCw, 
  FileText, 
  CheckCircle, 
  Sliders, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Check, 
  Layers
} from 'lucide-react';
import { CandidateProfile, BotConfig } from '@/lib/naukri/types';

export default function NaukriProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);

  // Form states
  const [targetRolesText, setTargetRolesText] = useState('');
  const [locationsText, setLocationsText] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(72);
  const [maxDaily, setMaxDaily] = useState(25);
  const [experienceYears, setExperienceYears] = useState(6);
  const [noticeDays, setNoticeDays] = useState(0);
  const [expectedSalary, setExpectedSalary] = useState(12000);
  const [hasLicense, setHasLicense] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/naukri');
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setConfig(data.config);
          setTargetRolesText(data.profile.targetRoles.join(', '));
          setLocationsText(data.profile.preferredLocations.join(', '));
          setMinMatchScore(data.config.minMatchScore);
          setMaxDaily(data.config.maxDailyApplications);
          setExperienceYears(data.profile.totalExperienceYears);
          setNoticeDays(data.profile.noticePeriodDays);
          setExpectedSalary(data.profile.expectedSalaryAED);
          setHasLicense(data.profile.hasGulfDrivingLicense);
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !config) return;
    setSaving(true);
    setSaveSuccess(false);

    const updatedProfile: Partial<CandidateProfile> = {
      ...profile,
      targetRoles: targetRolesText.split(',').map(s => s.trim()).filter(Boolean),
      preferredLocations: locationsText.split(',').map(s => s.trim()).filter(Boolean),
      totalExperienceYears: Number(experienceYears),
      noticePeriodDays: Number(noticeDays),
      expectedSalaryAED: Number(expectedSalary),
      hasGulfDrivingLicense: hasLicense
    };

    const updatedConfig: Partial<BotConfig> = {
      ...config,
      minMatchScore: Number(minMatchScore),
      maxDailyApplications: Number(maxDaily)
    };

    try {
      await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', profile: updatedProfile })
      });

      await fetch('/api/naukri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_config', config: updatedConfig })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RotateCw className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading Candidate Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/naukri-bot"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">CV & Matching Rules</h1>
            <p className="text-xs text-slate-400">
              Fine-tune the scoring algorithm, screening questions, and Gulf target criteria.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Check className="h-4 w-4" />
            Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Linked CV Preview Banner */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">{profile?.cvFileName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  ACTIVE CV
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Linked path: <code className="text-slate-300">{profile?.cvFilePath}</code>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {profile?.certifications.map((cert, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Auto-Apply Thresholds */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white text-sm">Matching & Safety Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Min Match Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Minimum CV Match Score: <strong className="text-emerald-400">{minMatchScore}%</strong>
                </label>
                <span className="text-[11px] text-slate-500">Recommended: 70% - 80%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Jobs with a score lower than this will be skipped to keep your application pool high quality.
              </p>
            </div>

            {/* Daily Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Daily Application Limit: <strong className="text-cyan-400">{maxDaily} / day</strong>
                </label>
                <span className="text-[11px] text-slate-500">Max recommended: 30</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxDaily}
                onChange={(e) => setMaxDaily(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Prevents spam triggers or recruiter rate-limiting on Naukrigulf.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Target Roles & Locations */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Briefcase className="h-4 w-4 text-teal-400" />
            <h2 className="font-semibold text-white text-sm">Target Roles & Gulf Locations</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Job Titles (Comma-separated)
              </label>
              <input
                type="text"
                value={targetRolesText}
                onChange={(e) => setTargetRolesText(e.target.value)}
                placeholder="HSE Officer, Safety Officer, HSE Engineer..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Target Gulf Locations (Comma-separated)
              </label>
              <input
                type="text"
                value={locationsText}
                onChange={(e) => setLocationsText(e.target.value)}
                placeholder="Dubai, Abu Dhabi, Riyadh, Doha..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Easy Apply Pre-Screening Answers */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-white text-sm">Naukrigulf Pre-Screening Auto-Answers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total Experience (Years)
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Notice Period (Days) — 0 for Immediate
              </label>
              <input
                type="number"
                value={noticeDays}
                onChange={(e) => setNoticeDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expected Salary (AED / month)
              </label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Valid Gulf Driving License?
              </label>
              <select
                value={hasLicense ? 'yes' : 'no'}
                onChange={(e) => setHasLicense(e.target.value === 'yes')}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="yes">Yes, have valid GCC driving license</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
          >
            {saving ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Saving Rules...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Matching Rules</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
