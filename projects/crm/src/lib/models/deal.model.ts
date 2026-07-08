export interface DealDto {
  id: string;
  opportunityName: string | null;
  accountId: string;
  accountName: string | null;
  closeDate: string;
  amount: number | null;
  stage: string | null;
  probability: number | null;
  forecastCategory: string | null;
  nextStep: string | null;
  ownerId: string | null;
  pipelineId: string | null;
  pipelineStageId: string | null;
  description: string | null;
  createdAt: string;
}

export interface CreateDealDto {
  opportunityName?: string | null;
  accountId: string;
  closeDate: string;
  amount?: number | null;
  stage?: string | null;
  probability?: number | null;
  forecastCategory?: string | null;
  nextStep?: string | null;
  ownerId?: string | null;
  pipelineId?: string | null;
  pipelineStageId?: string | null;
  description?: string | null;
}

export interface UpdateDealDto {
  opportunityName?: string | null;
  accountId: string;
  closeDate: string;
  amount?: number | null;
  stage?: string | null;
  probability?: number | null;
  forecastCategory?: string | null;
  nextStep?: string | null;
  ownerId?: string | null;
  pipelineId?: string | null;
  pipelineStageId?: string | null;
  description?: string | null;
}

export interface DealProductDto {
  id: string;
  dealId: string;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  listPrice: number;
  discount: number | null;
  totalPrice: number;
  description: string | null;
  sortOrder: number | null;
}

export interface CreateDealProductDto {
  productId: string;
  pricebookEntryId?: string | null;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateDealProductDto {
  productId: string;
  pricebookEntryId?: string | null;
  quantity: number;
  unitPrice: number;
  discount?: number | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface DealContactDto {
  id: string;
  dealId: string;
  contactId: string;
  contactName: string | null;
  role: string | null;
  isPrimary: boolean;
}

export interface CreateDealContactDto {
  contactId: string;
  role?: string | null;
  isPrimary: boolean;
}
