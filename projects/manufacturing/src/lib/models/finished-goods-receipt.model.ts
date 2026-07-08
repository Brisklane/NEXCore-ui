export interface FinishedGoodsReceiptDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  productId: string;
  productName: string | null;
  quantityReceived: number;
  unitOfMeasure: string | null;
  batchNo: string | null;
  receivedAt: string | null;
  warehouseId: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateFinishedGoodsReceiptDto {
  productionOrderId: string;
  productId: string;
  quantityReceived: number;
  unitOfMeasure?: string | null;
  batchNo?: string | null;
  receivedAt?: string | null;
  warehouseId?: string | null;
  notes?: string | null;
}

export interface UpdateFinishedGoodsReceiptDto {
  quantityReceived?: number | null;
  unitOfMeasure?: string | null;
  batchNo?: string | null;
  receivedAt?: string | null;
  warehouseId?: string | null;
  notes?: string | null;
}
