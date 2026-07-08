export interface CostEntryDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  materialCost: number;
  laborCost: number;
  machineCost: number;
  overheadCost: number;
  scrapCost: number;
  totalCost: number;
  journalEntryId: string | null;
  postedAt: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateCostEntryDto {
  productionOrderId: string;
  materialCost?: number;
  laborCost?: number;
  machineCost?: number;
  overheadCost?: number;
  scrapCost?: number;
  postedAt?: string | null;
  notes?: string | null;
}

export interface UpdateCostEntryDto {
  materialCost?: number | null;
  laborCost?: number | null;
  machineCost?: number | null;
  overheadCost?: number | null;
  scrapCost?: number | null;
  postedAt?: string | null;
  notes?: string | null;
}
