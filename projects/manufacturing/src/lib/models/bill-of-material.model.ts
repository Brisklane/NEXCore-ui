export interface BillOfMaterialDto {
  id: string;
  finishedProductId: string;
  finishedProductName: string | null;
  version: number;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  notes: string | null;
  items: BOMItemDto[];
  byProducts: BOMByProductDto[];
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateBillOfMaterialDto {
  id?: string;
  finishedProductId: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  notes?: string | null;
}

export interface UpdateBillOfMaterialDto {
  version?: number | null;
  isActive?: boolean | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
}

export interface BOMItemDto {
  id: string;
  billOfMaterialId: string;
  materialId: string;
  materialName: string | null;
  quantityRequired: number;
  scrapPercentage: number;
  unitOfMeasure: string | null;
  notes: string | null;
}

export interface CreateBOMItemDto {
  materialId: string;
  quantityRequired: number;
  scrapPercentage?: number;
  unitOfMeasure?: string | null;
  notes?: string | null;
}

export interface UpdateBOMItemDto {
  quantityRequired?: number | null;
  scrapPercentage?: number | null;
  unitOfMeasure?: string | null;
  notes?: string | null;
}

export interface BOMByProductDto {
  id: string;
  billOfMaterialId: string;
  productId: string;
  productName: string | null;
  type: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  costAllocationPercent: number;
  warehouseId: string | null;
  notes: string | null;
}

export interface CreateBOMByProductDto {
  productId: string;
  quantity: number;
  type?: string | null;
  unitOfMeasure?: string | null;
  costAllocationPercent?: number;
  warehouseId?: string | null;
  notes?: string | null;
}

export interface UpdateBOMByProductDto {
  quantity?: number | null;
  unitOfMeasure?: string | null;
  costAllocationPercent?: number | null;
  notes?: string | null;
}
