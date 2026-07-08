export interface WorkInProgressDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  productId: string;
  productName: string | null;
  quantityInProgress: number;
  quantityCompleted: number;
  quantityRejected: number;
  unitOfMeasure: string | null;
  lastUpdatedAt: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateWorkInProgressDto {
  productionOrderId: string;
  productId: string;
  quantityInProgress: number;
  quantityCompleted?: number;
  quantityRejected?: number;
  unitOfMeasure?: string | null;
  notes?: string | null;
}

export interface UpdateWorkInProgressDto {
  quantityInProgress?: number | null;
  quantityCompleted?: number | null;
  quantityRejected?: number | null;
  unitOfMeasure?: string | null;
  notes?: string | null;
}
