export type SupportedLocale = 'fr' | 'ar' | 'en';

export interface CvExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface CvEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  details?: string;
}

export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city: string;
  country: string;
  professionalTitle: string;
  targetRole: string;
  yearsExperience: number;
  salaryExpectation?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  industries: string[];
  preferredLocations: string[];
  avatarUrl?: string;
  experiences?: CvExperience[];
  education?: CvEducation[];
  certifications?: CvCertification[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  storageUrl?: string;
  fileType: 'pdf' | 'docx';
  parsedText: string;
  language: 'fr' | 'ar' | 'en';
  createdAt: string;
  updatedAt: string;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface AIRecommendation {
  id: string;
  priority: PriorityLevel;
  category: 'headline' | 'experience' | 'keywords' | 'ats' | 'skills' | 'structure';
  title: string;
  description: string;
  currentWording?: string;
  suggestedWording: string;
  rationale: string;
  applied?: boolean;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  structureScore: number;
  contentScore: number;
  keywordScore: number;
  experienceScore: number;
  atsScore: number;
  readabilityScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: AIRecommendation[];
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  city: string;
  country: string;
  description: string;
  salary?: string;
  employmentType: 'Full-time' | 'Part-time' | 'CDI' | 'CDD' | 'Freelance' | 'Stage';
  remoteType: 'On-site' | 'Hybrid' | 'Remote';
  experienceRequired: string;
  skills: string[];
  education: string;
  languages: string[];
  source: string;
  sourceUrl?: string;
  postedAt: string;
  featured?: boolean;
  matchScore?: number;
}

export interface JobMatchAction {
  id: string;
  priority: number;
  title: string;
  why: string;
  whatToChange: string;
  suggestedWording: string;
}

export interface JobMatch {
  id: string;
  userId: string;
  resumeId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  experienceMatch: number;
  skillsMatch: number;
  keywordsMatch: number;
  educationMatch: number;
  languageMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  strongMatches: string[];
  actionPlan: JobMatchAction[];
  createdAt: string;
}

export type ApplicationStatus = 'saved' | 'applied' | 'viewed' | 'interview' | 'offer' | 'rejected';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  resumeId: string;
  status: ApplicationStatus;
  applicationDate: string;
  matchScore: number;
  notes?: string;
  nextAction?: string;
  followUpDate?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: string;
  evaluation?: {
    score: number;
    clarity: number;
    confidence: number;
    structure: number;
    relevance: number;
    examples: number;
    professionalLanguage: number;
    feedbackGood: string;
    feedbackImprove: string;
    betterAnswer: string;
  };
}

export interface InterviewSession {
  id: string;
  jobPosition: string;
  company?: string;
  language: 'fr' | 'ar' | 'en';
  difficulty: 'junior' | 'intermediate' | 'senior';
  type: 'technical' | 'hr' | 'manager' | 'mixed';
  overallScore?: number;
  messages: InterviewMessage[];
  createdAt: string;
  status: 'in_progress' | 'completed';
}

export interface STARAnswer {
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  naturalAnswer: string;
}

export interface CreditState {
  planId: 'free' | 'job_seeker' | 'pro' | 'pass_7d' | 'pass_3m' | 'pass_6m';
  planName: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  renewsAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  date: string;
  actionUrl?: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  cvAnalyses: number;
  aiGenerations: number;
  applicationsTracked: number;
  paidUsers: number;
  mrrMAD: number;
  conversionRate: number;
  creditsConsumed: number;
  topCities: { city: string; count: number }[];
  topProfessions: { role: string; count: number }[];
  userGrowth: { month: string; users: number; analyses: number }[];
}

export interface TailoredCvData {
  jobId: string;
  jobTitle: string;
  company: string;
  city: string;
  candidateName: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  experienceBullets: string[];
  keySkills: string[];
  certifications: string[];
  languages: string[];
  addedSkills: string[];
  targetCompany: string;
  appliedDate: string;
}

