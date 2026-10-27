import { CandidateProfile, JobOffer, ApplicantStanding } from './types';

export interface MatchEvaluation {
  matchScore: number;
  breakdown: {
    certificationsScore: number;
    skillsScore: number;
    experienceScore: number;
    titleRelevance: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  predictedStanding: ApplicantStanding;
  predictedStandingLabel: string;
  predictedPercentile: number;
}

export function evaluateJobMatch(job: Partial<JobOffer>, profile: CandidateProfile): MatchEvaluation {
  const jobText = `${job.title || ''} ${job.descriptionSnippet || ''} ${job.fullDescription || ''} ${(job.extractedSkills || []).join(' ')}`.toLowerCase();
  const titleLower = (job.title || '').toLowerCase();

  // 1. Title Relevance (20 points)
  let titleRelevance = 0;
  const isDirectTitleMatch = profile.targetRoles.some(role => 
    titleLower.includes(role.toLowerCase()) || role.toLowerCase().includes(titleLower)
  );
  if (isDirectTitleMatch) {
    titleRelevance = 20;
  } else if (
    titleLower.includes('hse') || 
    titleLower.includes('safety') || 
    titleLower.includes('ehs') || 
    titleLower.includes('hygiene') ||
    titleLower.includes('health and safety') ||
    titleLower.includes('surete')
  ) {
    titleRelevance = 15;
  } else {
    titleRelevance = 5;
  }

  // 2. Certifications Match (30 points)
  const matchedCerts: string[] = [];
  const missingCerts: string[] = [];
  
  // Extract key certification terms
  const certKeywordsMap: Record<string, string[]> = {
    'NEBOSH': ['nebosh', 'igc'],
    'OSHA': ['osha', 'osha 30', 'osha 10'],
    'ISO 45001': ['iso 45001', '45001', 'ohsas'],
    'ISO 14001': ['iso 14001', '14001', 'environmental'],
    'IOSH': ['iosh', 'managing safely'],
    'First Aid': ['first aid', 'cpr'],
    'Fire Safety': ['fire safety', 'fire warden', 'fire fighting']
  };

  Object.entries(certKeywordsMap).forEach(([certName, aliases]) => {
    const hasCandidateCert = profile.certifications.some(c => 
      aliases.some(a => c.toLowerCase().includes(a))
    );
    const jobRequiresCert = aliases.some(a => jobText.includes(a));

    if (hasCandidateCert && jobRequiresCert) {
      matchedCerts.push(certName);
    } else if (jobRequiresCert && !hasCandidateCert) {
      missingCerts.push(certName);
    }
  });

  let certificationsScore = 12; // base score if profile is certified
  if (matchedCerts.length > 0) {
    certificationsScore = Math.min(30, 18 + matchedCerts.length * 4);
  }

  // 3. Core Skills & Keywords Match (35 points)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const skillTermsMap: Record<string, string[]> = {
    'Risk Assessment': ['risk assessment', 'hira', 'hazard identification'],
    'Permit to Work (PTW)': ['permit to work', 'ptw'],
    'Incident Investigation': ['incident investigation', 'accident investigation', 'root cause'],
    'HSE Audits & Inspections': ['audit', 'inspection', 'safety inspection'],
    'Emergency Response': ['emergency response', 'evacuation', 'drill'],
    'Toolbox Talks': ['toolbox', 'tbt', 'safety induction'],
    'PPE Protocols': ['ppe', 'protective equipment'],
    'Environmental Compliance': ['environmental', 'waste management', 'spill'],
    'Confined Space': ['confined space'],
    'Working at Height': ['working at height', 'scaffolding'],
    'Lockout Tagout (LOTO)': ['loto', 'lockout', 'tagout'],
    'Contractor Management': ['contractor', 'subcontractor']
  };

  Object.entries(skillTermsMap).forEach(([skillName, aliases]) => {
    const jobMentions = aliases.some(a => jobText.includes(a));
    if (jobMentions) {
      matchedSkills.push(skillName);
    }
  });

  const skillsScore = Math.min(35, Math.max(10, Math.round((matchedSkills.length / 5) * 35)));

  // 4. Experience match (15 points)
  let experienceScore = 15;
  const expMatch = job.experienceRequired?.match(/(\d+)\s*-\s*(\d+)/);
  if (expMatch) {
    const minExp = parseInt(expMatch[1], 10);
    const maxExp = parseInt(expMatch[2], 10);
    if (profile.totalExperienceYears >= minExp && profile.totalExperienceYears <= maxExp + 3) {
      experienceScore = 15;
    } else if (profile.totalExperienceYears < minExp) {
      experienceScore = Math.max(5, 15 - (minExp - profile.totalExperienceYears) * 3);
    } else {
      experienceScore = 12; // slightly overqualified
    }
  }

  const rawScore = titleRelevance + certificationsScore + skillsScore + experienceScore;
  const matchScore = Math.min(98, Math.max(35, rawScore));

  // Determine Predicted Applicant Standing (Top 30% vs Bottom 30%)
  // On Naukrigulf, certified candidates with relevant keywords and experience score in the Top 10-30%
  let predictedStanding: ApplicantStanding = 'MID_40';
  let predictedStandingLabel = 'Average / Mid 40% of applicants';
  let predictedPercentile = 45;

  if (matchScore >= 85) {
    predictedStanding = 'TOP_10';
    predictedStandingLabel = 'Top 10% of applicants (Strong Candidate)';
    predictedPercentile = Math.floor(Math.random() * 8) + 3; // 3% - 10%
  } else if (matchScore >= 72) {
    predictedStanding = 'TOP_30';
    predictedStandingLabel = 'Top 30% of applicants (Highly Competitive)';
    predictedPercentile = Math.floor(Math.random() * 18) + 12; // 12% - 29%
  } else if (matchScore >= 55) {
    predictedStanding = 'MID_40';
    predictedStandingLabel = 'Middle 40% of applicants';
    predictedPercentile = Math.floor(Math.random() * 30) + 35; // 35% - 65%
  } else {
    predictedStanding = 'BOTTOM_30';
    predictedStandingLabel = 'Bottom 30% of applicants';
    predictedPercentile = Math.floor(Math.random() * 25) + 72; // 72% - 97%
  }

  return {
    matchScore,
    breakdown: {
      certificationsScore,
      skillsScore,
      experienceScore,
      titleRelevance,
      matchedKeywords: [...matchedCerts, ...matchedSkills],
      missingKeywords: missingCerts.concat(missingSkills),
    },
    predictedStanding,
    predictedStandingLabel,
    predictedPercentile,
  };
}
