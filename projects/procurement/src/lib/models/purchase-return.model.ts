export enum PurchaseReturnStatus { Draft = 0, Approved = 1, Posted = 2, Cancelled = 3 }

export enum PurchaseReturnReason {
  QualityDefect = 0, WrongItem = 1, ExcessQuantity = 2, Damaged = 3,
  ExpiredGoods = 4, SpecificationMismatch = 5, Other = 6,
}

export const PURCHASE_RETURN_STATUS_LABELS: Record<PurchaseReturnStatus, string> = {
  [PurchaseReturnStatus.Draft]: 'Draft',
  [PurchaseReturnStatus.Approved]: 'Approved',
  [PurchaseReturnStatus.Posted]: 'Posted',
  [PurchaseReturnStatus.Cancelled]: 'Cancelled',
};

export const RETURN_REASON_LABELS: Record<PurchaseReturnReason, string> = {
  [PurchaseReturnReason.QualityDefect]: 'Quality Defect',
  [PurchaseReturnReason.WrongItem]: 'Wrong Item',
  [PurchaseReturnReason.ExcessQuantity]: 'Excess Quantity',
  [PurchaseReturnReason.Damaged]: 'Damaged',
  [PurchaseReturnReason.ExpiredGoods]: 'Expired Goods',
  [PurchaseReturnReason.SpecificationMismatch]: 'Specification Mismatch',
  [PurchaseReturnReason.Other]: 'Other',
};

export interface PurchaseReturnLineDto {
  id: string;
  lineNumber: number;
  goodsReceiptLineId: string;
  purchaseOrderLineId: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantityReceived: number;
  quantityReturned: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  unitPrice: number;
  taxPercent: number;
  taxAmount: number;
  totalReturnAmount: number;
  returnReason: PurchaseReturnReason;
  qualityIssueDescription?: string;
  lotNumber?: string;
  notes?: string;
}

export interface PurchaseReturnDto {
  id: string;
  returnNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  goodsReceiptId: string;
  goodsReceiptNumber?: string;
  vendorId: string;
  vendorName?: string;
  returnDate: string;
  approvedAt?: string;
  postedAt?: string;
  status: PurchaseReturnStatus;
  returnReason: PurchaseReturnReason;
  currencyCode: string;
  totalReturnAmount: number;
  vendorReturnAuthorisationNumber?: string;
  description?: string;
  notes?: string;
  debitNoteId?: string;
  debitNoteNumber?: string;
  lines: PurchaseReturnLineDto[];
}

export interface CreatePurchaseReturnLineDto {
  goodsReceiptLineId: string;
  quantityReturned: number;
  returnReason: PurchaseReturnReason;
  qualityIssueDescription?: string;
  lotNumber?: string;
  notes?: string;
}

export interface CreatePurchaseReturnDto {
  goodsReceiptId: string;
  returnDate: string;
  returnReason: PurchaseReturnReason;
  vendorReturnAuthorisationNumber?: string;
  description?: string;
  notes?: string;
  lines: CreatePurchaseReturnLineDto[];
}
