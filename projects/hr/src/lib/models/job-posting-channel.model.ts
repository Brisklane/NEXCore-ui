export interface JobPostingChannelDto {
  id: string;
  companyId?: string;
  jobId: string;
  channelTemplateId: string;
  channelNameSnapshot?: string;
  channelTypeLookupValueId: string;
  sourceTrackingCode?: string;
  postingUrl?: string;
  openDate: string;
  closeDate?: string;
  statusLookupValueId: string;
  isSponsored?: boolean;
  sponsoredBudget?: number;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateJobPostingChannelDto {
  jobId: string;
  channelTemplateId: string;
  channelNameSnapshot?: string;
  channelTypeLookupValueId: string;
  sourceTrackingCode?: string;
  postingUrl?: string;
  openDate: string;
  closeDate?: string;
  statusLookupValueId: string;
}

export interface UpdateJobPostingChannelDto {
  channelTemplateId?: string;
  channelNameSnapshot?: string;
  postingUrl?: string;
  closeDate?: string;
  statusLookupValueId?: string;
  isSponsored?: boolean;
  sponsoredBudget?: number;
}
