import fs from 'fs';
import path from 'path';
import { ApplicationRecord, BotConfig, CandidateProfile, DashboardMetrics, JobOffer } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'naukri');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export const DEFAULT_PROFILE: CandidateProfile = {
  name: 'Ayoub Benboucetta',
  email: 'ayoub.hse.gulf@example.com',
  phone: '+971 50 123 4567',
  currentTitle: 'HSE Officer / Health & Safety Specialist',
  totalExperienceYears: 6,
  currentLocation: 'Dubai, UAE (Available to relocate across GCC)',
  nationality: 'Moroccan',
  preferredLocations: ['Dubai, UAE', 'Abu Dhabi, UAE', 'Riyadh, Saudi Arabia', 'Doha, Qatar', 'Oman'],
  targetRoles: ['HSE Officer', 'Safety Officer', 'HSE Engineer', 'HSE Supervisor', 'EHS Coordinator'],
  certifications: [
    'NEBOSH IGC (International General Certificate)',
    'OSHA 30 Hours (General Industry & Construction)',
    'ISO 45001:2018 (Occupational Health & Safety Lead Implementer)',
    'ISO 14001:2015 (Environmental Management System)',
    'First Aid & CPR Certified',
    'Fire Safety & Evacuation Warden'
  ],
  coreSkills: [
    'Risk Assessment & Hazard Identification (HIRA)',
    'Permit to Work (PTW) System',
    'Incident & Accident Investigation (Root Cause Analysis)',
    'HSE Audits & Inspections',
    'Emergency Response Planning',
    'Toolbox Talks & Safety Induction',
    'Environmental Compliance & Waste Management',
    'PPE Compliance & Behavioral Safety',
    'Contractor Safety Management',
    'Lockout / Tagout (LOTO)',
    'Confined Space Safety',
    'Working at Height Protocols'
  ],
  languages: ['English (Fluent / Professional)', 'French (Fluent)', 'Arabic (Native)'],
  noticePeriodDays: 0, // Immediate joiner
  currentSalaryAED: 8500,
  expectedSalaryAED: 12000,
  hasGulfDrivingLicense: true,
  visaStatus: 'Employment Visa / Immediately Transferable',
  cvFileName: 'Ayoub-Benboucetta-CV-English-Gulf-PDF-Ready.pdf',
  cvFilePath: 'C:\\Users\\x1\\Downloads\\Ayoub-Benboucetta-CV-English-Gulf-PDF-Ready.pdf',
  summary: 'Certified HSE Professional with 6+ years of rigorous experience leading health, safety, and environmental compliance across industrial, construction, and high-risk operational facilities in Morocco and the Gulf region. Proven track record of zero lost-time incidents (LTI), robust PTW management, and ISO 45001 auditing.'
};

export const DEFAULT_CONFIG: BotConfig = {
  minMatchScore: 72,
  maxDailyApplications: 25,
  applyOnlyEasyApply: true,
  runMode: 'LIVE',
  autoScheduleDaily: true,
  scheduleTime: '09:30',
  headless: false,
  accountStatus: 'DISCONNECTED',
  connectedEmail: undefined
};

export function getProfile(): CandidateProfile {
  ensureDirExists();
  if (!fs.existsSync(PROFILE_FILE)) {
    saveProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }
  try {
    return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: CandidateProfile): void {
  ensureDirExists();
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
}

export function getConfig(): BotConfig {
  ensureDirExists();
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: BotConfig): void {
  ensureDirExists();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getApplications(): ApplicationRecord[] {
  ensureDirExists();
  if (!fs.existsSync(APPLICATIONS_FILE)) {
    saveApplications([]);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveApplications(apps: ApplicationRecord[]): void {
  ensureDirExists();
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
}

export function addApplication(app: ApplicationRecord): void {
  const apps = getApplications();
  const index = apps.findIndex(a => a.jobId === app.jobId);
  if (index >= 0) {
    apps[index] = app;
  } else {
    apps.unshift(app);
  }
  saveApplications(apps);
}

export function getLogs(): string[] {
  ensureDirExists();
  if (!fs.existsSync(LOGS_FILE)) {
    return [
      `[${new Date().toLocaleTimeString()}] NaukriPilot initialized and connected to Naukrigulf worker.`,
      `[${new Date().toLocaleTimeString()}] Ready for daily scheduled search and auto-apply.`
    ];
  }
  try {
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function appendLog(message: string): void {
  ensureDirExists();
  const logs = getLogs();
  const timestamp = new Date().toLocaleTimeString();
  logs.unshift(`[${timestamp}] ${message}`);
  // Keep last 150 logs
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs.slice(0, 150), null, 2), 'utf-8');
}

export function getDashboardMetrics(): DashboardMetrics {
  const apps = getApplications();
  const config = getConfig();
  const profile = getProfile();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const appliedList = apps.filter(a => a.status === 'APPLIED' || a.status === 'APPLIED_SIMULATION');
  const appliedToday = appliedList.filter(a => a.appliedDate.startsWith(todayStr)).length;

  const totalApplied = appliedList.length;

  // Breakdown of applicant standing
  const top10List = appliedList.filter(a => a.applicantStanding === 'TOP_10');
  const top30List = appliedList.filter(a => a.applicantStanding === 'TOP_10' || a.applicantStanding === 'TOP_30');
  const midList = appliedList.filter(a => a.applicantStanding === 'MID_40');
  const bottom30List = apps.filter(a => a.applicantStanding === 'BOTTOM_30');

  const top30Count = top30List.length;
  const top30Percentage = totalApplied > 0 ? Math.round((top30Count / totalApplied) * 100) : 0;

  const midCount = midList.length;
  const midPercentage = totalApplied > 0 ? Math.round((midCount / totalApplied) * 100) : 0;

  const bottom30Count = bottom30List.length;
  const totalTracked = apps.length;
  const bottom30Percentage = totalTracked > 0 ? Math.round((bottom30Count / totalTracked) * 100) : 0;

  const avgMatchScore = totalApplied > 0 
    ? Math.round(appliedList.reduce((acc, cur) => acc + cur.matchScore, 0) / totalApplied)
    : 0;

  const lastRunAt = apps.length > 0 ? apps[0].appliedDate : null;

  return {
    totalApplied,
    appliedToday,
    dailyLimit: config.maxDailyApplications,
    avgMatchScore,
    top30Count,
    top30Percentage,
    bottom30Count,
    bottom30Percentage,
    midCount,
    midPercentage,
    activeTargetRoles: profile.targetRoles,
    lastRunAt,
    botStatus: 'IDLE',
    accountStatus: config.accountStatus || 'DISCONNECTED',
    connectedEmail: config.connectedEmail,
    connectedName: config.connectedName,
    naukriAccountAppliedCount: config.naukriAccountAppliedCount
  };
}
