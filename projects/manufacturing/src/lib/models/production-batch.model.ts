export interface ProductionBatchDto {
  id: string;
  batchNumber: string | null;
  productionOrderId: string;
  orderNumber: string | null;
  productId: string;
  productName: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  status: string | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  reTestDate: string | null;
  warehouseId: string | null;
  certificateOfAnalysis: string | null;
  vendorBatchNumber: string | null;
  qualityApproved: boolean;
  inspectionId: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateProductionBatchDto {
  batchNumber: string;
  productionOrderId: string;
  productId: string;
  quantity: number;
  unitOfMeasure?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  reTestDate?: string | null;
  warehouseId?: string | null;
  vendorBatchNumber?: string | null;
  notes?: string | null;
}

export interface UpdateProductionBatchDto {
  quantity?: number | null;
  unitOfMeasure?: string | null;
  status?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  reTestDate?: string | null;
  warehouseId?: string | null;
  qualityApproved?: boolean | null;
  notes?: string | null;
}
