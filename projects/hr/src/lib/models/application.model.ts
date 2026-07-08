export interface ApplicationDto {
  id: string;
  companyId?: string;
  applicationCode?: string;
  jobId: string;
  candidateId: string;
  jobPostingChannelId?: string;
  appliedDate: string;
  currentStageLookupValueId?: string;
  statusLookupValueId?: string;
  priorityLookupValueId?: string;
  isShortlisted: boolean;
  screeningScore?: number;
  internalScore?: number;
  assignedRecruiterEmployeeId?: string;
  convertedToEmployeeId?: string;
  offerId?: string;
  hiredDate?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateApplicationDto {
  applicationCode?: string;
  jobId: string;
  candidateId: string;
  jobPostingChannelId?: string;
  appliedDate?: string;
  currentStageLookupValueId?: string;
  statusLookupValueId?: string;
  priorityLookupValueId?: string;
  assignedRecruiterEmployeeId?: string;
}

export interface UpdateApplicationDto {
  jobPostingChannelId?: string;
  appliedDate?: string;
  currentStageLookupValueId?: string;
  statusLookupValueId?: string;
  priorityLookupValueId?: string;
  isShortlisted?: boolean;
  screeningScore?: number;
  internalScore?: number;
  assignedRecruiterEmployeeId?: string;
}
