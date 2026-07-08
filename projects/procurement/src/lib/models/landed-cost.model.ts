export enum LandedCostStatus { Draft = 0, Posted = 1, Cancelled = 2 }

export enum LandedCostType {
  Freight = 0, CustomsDuty = 1, Insurance = 2, Handling = 3, Inspection = 4, Storage = 5, Other = 6,
}

export enum LandedCostAllocationMethod { ByQuantity = 0, ByValue = 1, ByWeight = 2, ByVolume = 3, Equal = 4 }

export const LANDED_COST_STATUS_LABELS: Record<LandedCostStatus, string> = {
  [LandedCostStatus.Draft]: 'Draft',
  [LandedCostStatus.Posted]: 'Posted',
  [LandedCostStatus.Cancelled]: 'Cancelled',
};

export const LANDED_COST_TYPE_LABELS: Record<LandedCostType, string> = {
  [LandedCostType.Freight]: 'Freight',
  [LandedCostType.CustomsDuty]: 'Customs Duty',
  [LandedCostType.Insurance]: 'Insurance',
  [LandedCostType.Handling]: 'Handling',
  [LandedCostType.Inspection]: 'Inspection',
  [LandedCostType.Storage]: 'Storage',
  [LandedCostType.Other]: 'Other',
};

export const ALLOCATION_METHOD_LABELS: Record<LandedCostAllocationMethod, string> = {
  [LandedCostAllocationMethod.ByQuantity]: 'By Quantity',
  [LandedCostAllocationMethod.ByValue]: 'By Value',
  [LandedCostAllocationMethod.ByWeight]: 'By Weight',
  [LandedCostAllocationMethod.ByVolume]: 'By Volume',
  [LandedCostAllocationMethod.Equal]: 'Equal Split',
};

export interface LandedCostLineDto {
  id: string;
  lineNumber: number;
  costType: LandedCostType;
  description: string;
  amount: number;
  currencyCode: string;
  allocationMethod: LandedCostAllocationMethod;
  taxPercent: number;
  taxAmount: number;
  notes?: string;
}

export interface LandedCostGoodsReceiptDto {
  id: string;
  goodsReceiptId: string;
  goodsReceiptNumber?: string;
}

export interface LandedCostAllocationDto {
  id: string;
  landedCostLineId: string;
  goodsReceiptLineId: string;
  itemDescription?: string;
  allocationMethod: LandedCostAllocationMethod;
  allocationBasisValue: number;
  totalBasisValue: number;
  allocationPercent: number;
  allocatedAmount: number;
  allocatedAmountPerUnit: number;
}

export interface LandedCostDto {
  id: string;
  landedCostNumber: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  status: LandedCostStatus;
  documentDate: string;
  postedAt?: string;
  currencyCode: string;
  exchangeRate: number;
  totalLandedCostAmount: number;
  notes?: string;
  costLines: LandedCostLineDto[];
  goodsReceipts: LandedCostGoodsReceiptDto[];
  allocations: LandedCostAllocationDto[];
}

export interface CreateLandedCostLineDto {
  costType: LandedCostType;
  description: string;
  amount: number;
  allocationMethod: LandedCostAllocationMethod;
  taxPercent?: number;
  notes?: string;
}

export interface CreateLandedCostDto {
  description?: string;
  vendorId?: string;
  documentDate: string;
  currencyCode?: string;
  exchangeRate?: number;
  notes?: string;
  goodsReceiptIds: string[];
  costLines: CreateLandedCostLineDto[];
}
