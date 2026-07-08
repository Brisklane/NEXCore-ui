export interface CommunicationTemplateDto {
  id: string;
  companyId?: string;
  templateCode?: string;
  templateName?: string;
  templateTypeLookupValueId?: string;
  subject?: string;
  body?: string;
  placeholdersJson?: string;
  languageCode?: string;
  version?: number;
  isActive: boolean;
  isSystemTemplate?: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateCommunicationTemplateDto {
  templateCode?: string;
  templateName?: string;
  templateTypeLookupValueId: string;
  subject?: string;
  body?: string;
  placeholdersJson?: string;
  languageCode?: string;
}

export interface UpdateCommunicationTemplateDto {
  templateName?: string;
  templateTypeLookupValueId?: string;
  subject?: string;
  body?: string;
  placeholdersJson?: string;
  languageCode?: string;
  isActive?: boolean;
}
