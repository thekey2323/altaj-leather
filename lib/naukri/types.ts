export type ApplicantStanding = 'TOP_10' | 'TOP_30' | 'MID_40' | 'BOTTOM_30' | 'UNKNOWN';

export type ApplicationStatus = 'APPLIED' | 'APPLIED_SIMULATION' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'SKIPPED_LOW_SCORE';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string; // UAE, Saudi Arabia, Qatar, etc.
  experienceRequired: string;
  salaryText?: string;
  postedDate: string;
  isEasyApply: boolean;
  jobUrl: string;
  descriptionSnippet: string;
  fullDescription?: string;
  extractedSkills: string[];
  matchScore?: number;
  matchBreakdown?: {
    certificationsScore: number;
    skillsScore: number;
    experienceScore: number;
    titleRelevance: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  country: string;
  jobUrl: string;
  appliedDate: string;
  matchScore: number;
  status: ApplicationStatus;
  isEasyApply: boolean;
  applicantStanding: ApplicantStanding;
  standingLabel: string; // e.g. "Top 10% of applicants", "Top 30% of applicants", "Bottom 30%"
  rankPercentile: number; // e.g. 15 for top 15%, 85 for bottom 15%
  mode: 'LIVE' | 'SIMULATION';
  answersUsed?: Record<string, string>;
  recruiterViewed?: boolean;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  currentTitle: string;
  totalExperienceYears: number;
  currentLocation: string;
  nationality: string;
  preferredLocations: string[]; // ['Dubai, UAE', 'Riyadh, Saudi Arabia', 'Doha, Qatar', ...]
  targetRoles: string[]; // ['HSE Officer', 'Safety Officer', 'HSE Engineer', 'HSE Supervisor']
  certifications: string[]; // ['NEBOSH IGC', 'OSHA 30', 'ISO 45001', 'ISO 14001', 'IOSH']
  coreSkills: string[];
  languages: string[];
  noticePeriodDays: number;
  currentSalaryAED: number;
  expectedSalaryAED: number;
  hasGulfDrivingLicense: boolean;
  visaStatus: string; // 'Tourist Visa / Transferable', 'Employment Visa', 'Immediate Joiner'
  cvFileName: string;
  cvFilePath: string;
  summary: string;
}

export interface BotConfig {
  minMatchScore: number; // default 70
  maxDailyApplications: number; // default 20
  applyOnlyEasyApply: boolean; // default true
  runMode: 'SIMULATION' | 'LIVE';
  autoScheduleDaily: boolean;
  scheduleTime: string; // "09:00"
  naukriEmail?: string;
  naukriPassword?: string;
  sessionCookie?: string;
  headless: boolean;
  accountStatus: 'DISCONNECTED' | 'LOGGING_IN' | 'CONNECTED';
  connectedEmail?: string;
  connectedName?: string;
  naukriAccountAppliedCount?: number;
  lastConnectedAt?: string;
}

export interface DashboardMetrics {
  totalApplied: number;
  appliedToday: number;
  dailyLimit: number;
  avgMatchScore: number;
  top30Count: number;
  top30Percentage: number;
  bottom30Count: number;
  bottom30Percentage: number;
  midCount: number;
  midPercentage: number;
  activeTargetRoles: string[];
  lastRunAt: string | null;
  botStatus: 'IDLE' | 'RUNNING' | 'ERROR';
  accountStatus: 'DISCONNECTED' | 'LOGGING_IN' | 'CONNECTED';
  connectedEmail?: string;
  connectedName?: string;
  naukriAccountAppliedCount?: number;
}
