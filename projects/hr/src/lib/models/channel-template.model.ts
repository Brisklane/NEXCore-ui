export interface ChannelTemplateDto {
  id: string;
  companyId?: string;
  channelCode?: string;
  channelName?: string;
  channelTypeLookupValueId: string;
  isActive: boolean;
  supportsAutoPosting: boolean;
  requiresApproval: boolean;
  apiEndpoint?: string;
  authConfigJson?: string;
  trackingPrefix?: string;
  defaultStatusLookupValueId?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateChannelTemplateDto {
  channelCode?: string;
  channelName?: string;
  channelTypeLookupValueId: string;
  supportsAutoPosting: boolean;
  requiresApproval: boolean;
  apiEndpoint?: string;
  authConfigJson?: string;
  trackingPrefix?: string;
  defaultStatusLookupValueId?: string;
}

export interface UpdateChannelTemplateDto {
  channelName?: string;
  channelTypeLookupValueId?: string;
  isActive?: boolean;
  supportsAutoPosting?: boolean;
  requiresApproval?: boolean;
  apiEndpoint?: string;
  authConfigJson?: string;
  trackingPrefix?: string;
  defaultStatusLookupValueId?: string;
}
