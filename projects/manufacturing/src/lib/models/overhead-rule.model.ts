export interface OverheadRuleDto {
  id: string;
  code: string | null;
  name: string | null;
  rateType: string | null;
  value: number;
  appliesTo: string | null;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateOverheadRuleDto {
  code?: string | null;
  name?: string | null;
  rateType?: string | null;
  value: number;
  appliesTo?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface UpdateOverheadRuleDto {
  code?: string | null;
  name?: string | null;
  rateType?: string | null;
  value?: number | null;
  appliesTo?: string | null;
  isActive?: boolean | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}
