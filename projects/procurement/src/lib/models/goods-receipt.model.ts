import { GoodsReceiptStatus, ReceiptType, QualityInspectionStatus } from './procurement-enums';

export interface GoodsReceiptLineDto {
  id: string;
  lineNumber: number;
  purchaseOrderLineId: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  manufacturerBatchNumber?: string;
  storageLocationId?: string;
  storageLocationName?: string;
  qualityStatus: QualityInspectionStatus;
  qualityNotes?: string;
  inspectedByUserId?: string;
  inspectedAt?: string;
  notes?: string;
}

export interface GoodsReceiptDto {
  id: string;
  receiptNumber: string;
  vendorDeliveryNoteNumber?: string;
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  vendorId: string;
  vendorName?: string;
  receiptDate: string;
  postedAt?: string;
  status: GoodsReceiptStatus;
  receiptType: ReceiptType;
  warehouseId?: string;
  storageLocationId?: string;
  postedByUserId?: string;
  originalReceiptId?: string;
  fiscalPeriodId?: string;
  notes?: string;
  internalNotes?: string;
  lines: GoodsReceiptLineDto[];
}

export interface CreateGoodsReceiptLineDto {
  purchaseOrderLineId: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  storageLocationId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  manufacturerBatchNumber?: string;
  notes?: string;
}

export interface CreateGoodsReceiptDto {
  purchaseOrderId: string;
  vendorDeliveryNoteNumber?: string;
  receiptDate: string;
  receiptType?: ReceiptType;
  warehouseId?: string;
  storageLocationId?: string;
  originalReceiptId?: string;
  fiscalPeriodId?: string;
  notes?: string;
  internalNotes?: string;
  lines: CreateGoodsReceiptLineDto[];
}

export interface UpdateGoodsReceiptDto {
  vendorDeliveryNoteNumber?: string;
  receiptDate?: string;
  warehouseId?: string;
  storageLocationId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface InspectGoodsReceiptLineDto {
  lineId: string;
  qualityStatus: QualityInspectionStatus;
  qualityNotes?: string;
  quantityAccepted: number;
  quantityRejected: number;
}
