export interface InterviewDto {
  id: string;
  companyId?: string;
  interviewCode?: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  interviewTitle?: string;
  interviewTypeLookupValueId?: string;
  interviewSequenceNo?: number;
  statusLookupValueId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  durationMinutes?: number;
  format?: number;
  location?: string;
  videoLink?: string;
  isMandatoryRound: boolean;
  candidateConfirmed: boolean;
  rescheduleCount: number;
  cancelReason?: string;
  actualStart?: string;
  actualEnd?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateInterviewDto {
  interviewCode?: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  interviewTitle?: string;
  interviewTypeLookupValueId?: string;
  interviewSequenceNo?: number;
  statusLookupValueId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  durationMinutes?: number;
  format?: number;
  location?: string;
  videoLink?: string;
  isMandatoryRound?: boolean;
}

export interface UpdateInterviewDto {
  interviewTitle?: string;
  interviewTypeLookupValueId?: string;
  statusLookupValueId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  durationMinutes?: number;
  format?: number;
  location?: string;
  videoLink?: string;
  cancelReason?: string;
}
