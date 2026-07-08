export interface BenefitsPlanDto {
  id: string;
  name: string | null;
  description: string | null;
  planType: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateBenefitsPlanDto {
  name: string;
  description?: string | null;
  planType?: string | null;
}

export interface UpdateBenefitsPlanDto {
  name?: string | null;
  description?: string | null;
  planType?: string | null;
  isActive?: boolean | null;
}
