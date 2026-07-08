export interface CandidateDto {
  id: string;
  companyId?: string;
  candidateCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  currentCompany?: string;
  source?: number;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  candidateRating?: number;
  isBlacklisted: boolean;
  consentGiven: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateCandidateDto {
  candidateCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  currentCompany?: string;
  source?: number;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  consentGiven?: boolean;
}

export interface UpdateCandidateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  currentCompany?: string;
  source?: number;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  candidateRating?: number;
  isBlacklisted?: boolean;
  consentGiven?: boolean;
}
