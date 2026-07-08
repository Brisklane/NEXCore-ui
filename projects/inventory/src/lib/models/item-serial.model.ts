// Serial / IMEI unit-level tracking models — mirror the backend Inventory.Application DTOs.

export interface ItemSerialDto {
  id: string;
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  variantId: string | null;
  serialNumber: string;
  imei: string | null;
  imei2: string | null;
  macAddress: string | null;
  status: string;
  warehouseId: string | null;
  warehouseName: string | null;
  binId: string | null;
  unitCost: number;
  receiptDocumentId: string | null;
  receiptDate: string | null;
  supplierId: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  soldDocumentId: string | null;
  soldDate: string | null;
  salesReference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ItemSerialHistoryDto {
  id: string;
  itemSerialId: string;
  eventType: string;
  fromStatus: string | null;
  toStatus: string | null;
  warehouseId: string | null;
  warehouseName: string | null;
  documentId: string | null;
  eventDate: string;
  notes: string | null;
}

export interface CreateItemSerialDto {
  itemId: string;
  variantId?: string | null;
  serialNumber: string;
  imei?: string | null;
  imei2?: string | null;
  macAddress?: string | null;
  warehouseId?: string | null;
  binId?: string | null;
  unitCost?: number;
  supplierId?: string | null;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  notes?: string | null;
}

export interface UpdateSerialStatusDto {
  status: string;
  notes?: string | null;
}

export interface BulkGenerateSerialsDto {
  itemId: string;
  variantId?: string | null;
  prefix: string;
  startNumber: number;
  count: number;
  padding: number;
  warehouseId?: string | null;
  unitCost?: number;
}

export interface SerialLookupResultDto {
  found: boolean;
  serial: ItemSerialDto | null;
  history: ItemSerialHistoryDto[];
}
