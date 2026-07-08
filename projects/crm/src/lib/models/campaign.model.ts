export interface CampaignDto {
  id: string;
  campaignName: string | null;
  active: boolean;
  status: string | null;
  type: string | null;
  parentCampaignId: string | null;
  startDate: string | null;
  endDate: string | null;
  expectedRevenue: number | null;
  budgetedCost: number | null;
  actualCost: number | null;
  numSent: number | null;
  expectedResponsePercent: number | null;
  ownerId: string | null;
  description: string | null;
  createdAt: string;
}

export interface CreateCampaignDto {
  campaignName?: string | null;
  active: boolean;
  status?: string | null;
  type?: string | null;
  parentCampaignId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  expectedRevenue?: number | null;
  budgetedCost?: number | null;
  actualCost?: number | null;
  numSent?: number | null;
  expectedResponsePercent?: number | null;
  ownerId?: string | null;
  description?: string | null;
}

export interface UpdateCampaignDto {
  campaignName?: string | null;
  active?: boolean;
  status?: string | null;
  type?: string | null;
  parentCampaignId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  expectedRevenue?: number | null;
  budgetedCost?: number | null;
  actualCost?: number | null;
  numSent?: number | null;
  expectedResponsePercent?: number | null;
  ownerId?: string | null;
  description?: string | null;
}

export interface CampaignMemberDto {
  id: string;
  campaignId: string;
  leadId: string | null;
  contactId: string | null;
  status: string | null;
  firstRespondedDate: string | null;
}

export interface CreateCampaignMemberDto {
  leadId?: string | null;
  contactId?: string | null;
  status?: string | null;
}
