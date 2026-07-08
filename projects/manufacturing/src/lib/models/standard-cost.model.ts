export interface StandardCostDto {
  id: string;
  productId: string;
  productName: string | null;
  version: number;
  currencyCode: string | null;
  materialCost: number;
  laborCost: number;
  machineCost: number;
  overheadCost: number;
  totalCost: number;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateStandardCostDto {
  productId: string;
  version: number;
  currencyCode?: string | null;
  materialCost: number;
  laborCost: number;
  machineCost?: number;
  overheadCost: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
}

export interface UpdateStandardCostDto {
  version?: number | null;
  currencyCode?: string | null;
  materialCost?: number | null;
  laborCost?: number | null;
  machineCost?: number | null;
  overheadCost?: number | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
  isActive?: boolean | null;
}
