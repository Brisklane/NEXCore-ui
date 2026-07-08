export interface InventoryDocumentLineDto {
  id: string;
  documentId: string;
  itemId: string;
  warehouseId: string;
  binId: string | null;
  variantId: string | null;
  quantity: number;
  unitId: string;
  unitCost: number;
  totalCost: number;
  lineNumber: number;
  description: string | null;
  referenceLineId: string | null;
}

export interface InventoryDocumentDto {
  id: string;
  documentNumber: string | null;
  documentType: string | null;
  documentDate: string;
  status: string | null;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  postingDate: string | null;
  postedByUserId: string | null;
  totalQuantity: number;
  totalCost: number;
  lines: InventoryDocumentLineDto[] | null;
}

export interface DocumentLineSerialDto {
  serialNumber: string;
  imei?: string | null;
  imei2?: string | null;
  macAddress?: string | null;
}

export interface CreateInventoryDocumentLineDto {
  itemId: string;
  warehouseId: string;
  binId?: string | null;
  variantId?: string | null;
  quantity: number;
  unitId: string;
  unitCost: number;
  lineNumber: number;
  description?: string | null;
  referenceLineId?: string | null;
  // Serial / lot capture (matches backend)
  batchNumber?: string | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  serials?: DocumentLineSerialDto[];
}

export interface CreateInventoryDocumentDto {
  documentType?: string | null;
  documentDate: string;
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
  fromWarehouseId?: string | null;
  toWarehouseId?: string | null;
  lines?: CreateInventoryDocumentLineDto[] | null;
}

export interface PostInventoryDocumentDto {
  documentId: string;
  postingDate: string;
  postedByUserId?: string | null;
}

export interface QuickAdjustDto {
  itemId: string;
  warehouseId: string;
  variantId?: string | null;
  newQuantity: number;
  unitCost?: number | null;
  reason?: string | null;
}
