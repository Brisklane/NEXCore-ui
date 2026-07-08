// Batch / lot tracking models — mirror the backend Inventory.Application DTOs.

export interface ItemBatchDto {
  id: string;
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  variantId: string | null;
  batchNumber: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  supplierId: string | null;
  receivedQuantity: number;
  remainingQuantity: number;
  reservedQuantity: number;
  unitCost: number;
  status: string;
  daysToExpiry: number | null;
  createdAt: string;
}

export interface UpdateBatchStatusDto {
  status: string;
}
