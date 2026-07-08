export interface ProductionVarianceDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  standardMaterialCost: number;
  actualMaterialCost: number;
  materialVariance: number;
  standardLaborCost: number;
  actualLaborCost: number;
  laborVariance: number;
  standardMachineCost: number;
  actualMachineCost: number;
  machineVariance: number;
  standardOverheadCost: number;
  actualOverheadCost: number;
  overheadVariance: number;
  totalVariance: number;
  varianceCategory: string | null;
  isSettled: boolean;
  settledAt: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateProductionVarianceDto {
  productionOrderId: string;
  costEntryId: string;
  standardMaterialCost: number;
  actualMaterialCost: number;
  standardLaborCost: number;
  actualLaborCost: number;
  standardMachineCost: number;
  actualMachineCost: number;
  standardOverheadCost: number;
  actualOverheadCost: number;
  varianceCategory: string;
  notes?: string | null;
}

export interface UpdateProductionVarianceDto {
  varianceCategory?: string | null;
  isSettled?: boolean | null;
  settledAt?: string | null;
  notes?: string | null;
}
