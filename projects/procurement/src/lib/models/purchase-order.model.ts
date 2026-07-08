import { PaymentTerms } from './vendor.model';

export enum PurchaseOrderStatus {
  Draft = 0,
  Confirmed = 1,
  SentToVendor = 2,
  Acknowledged = 3,
  PartiallyReceived = 4,
  FullyReceived = 5,
  PartiallyInvoiced = 6,
  FullyInvoiced = 7,
  Closed = 8,
  Cancelled = 9,
}

export enum PurchaseOrderLineStatus {
  Open = 0,
  PartiallyReceived = 1,
  FullyReceived = 2,
  Cancelled = 3,
  Closed = 4,
}

export enum Incoterm {
  EXW = 0,
  FCA = 1,
  CPT = 2,
  CIP = 3,
  DAP = 4,
  DPU = 5,
  DDP = 6,
  FAS = 7,
  FOB = 8,
  CFR = 9,
  CIF = 10,
}

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: 'Draft',
  [PurchaseOrderStatus.Confirmed]: 'Confirmed',
  [PurchaseOrderStatus.SentToVendor]: 'Sent to Vendor',
  [PurchaseOrderStatus.Acknowledged]: 'Acknowledged',
  [PurchaseOrderStatus.PartiallyReceived]: 'Partially Received',
  [PurchaseOrderStatus.FullyReceived]: 'Fully Received',
  [PurchaseOrderStatus.PartiallyInvoiced]: 'Partially Invoiced',
  [PurchaseOrderStatus.FullyInvoiced]: 'Fully Invoiced',
  [PurchaseOrderStatus.Closed]: 'Closed',
  [PurchaseOrderStatus.Cancelled]: 'Cancelled',
};

export const INCOTERM_LABELS: Record<Incoterm, string> = {
  [Incoterm.EXW]: 'EXW - Ex Works',
  [Incoterm.FCA]: 'FCA - Free Carrier',
  [Incoterm.CPT]: 'CPT - Carriage Paid To',
  [Incoterm.CIP]: 'CIP - Carriage & Insurance Paid',
  [Incoterm.DAP]: 'DAP - Delivered at Place',
  [Incoterm.DPU]: 'DPU - Delivered at Place Unloaded',
  [Incoterm.DDP]: 'DDP - Delivered Duty Paid',
  [Incoterm.FAS]: 'FAS - Free Alongside Ship',
  [Incoterm.FOB]: 'FOB - Free on Board',
  [Incoterm.CFR]: 'CFR - Cost and Freight',
  [Incoterm.CIF]: 'CIF - Cost, Insurance & Freight',
};

export interface PurchaseOrderLineDto {
  id: string;
  lineNumber: number;
  requisitionLineId?: string;
  contractLineId?: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxCodeId?: string;
  taxPercent: number;
  taxAmount: number;
  subTotal: number;
  totalPrice: number;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  ledgerAccountId?: string;
  costCenterId?: string;
  expectedDeliveryDate?: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  quantityReturned: number;
  quantityInvoiced: number;
  quantityRemaining: number;
  quantityToInvoice: number;
  lineStatus: PurchaseOrderLineStatus;
  notes?: string;
}

export interface PurchaseOrderDto {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName?: string;
  vendorReference?: string;
  quotationId?: string;
  quotationNumber?: string;
  requisitionId?: string;
  requisitionNumber?: string;
  contractId?: string;
  contractNumber?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  confirmedDeliveryDate?: string;
  sentToVendorAt?: string;
  acknowledgedAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  status: PurchaseOrderStatus;
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  currencyCode: string;
  exchangeRate: number;
  paymentTerms: PaymentTerms;
  incoterm?: Incoterm;
  incotermLocation?: string;
  subTotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  approvedByUserId?: string;
  approvedAt?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  lines: PurchaseOrderLineDto[];
}

export interface CreatePurchaseOrderLineDto {
  requisitionLineId?: string;
  contractLineId?: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitOfMeasureId?: string;
  unitOfMeasureName?: string;
  unitPrice: number;
  discountPercent?: number;
  taxCodeId?: string;
  taxPercent?: number;
  procurementCategoryId?: string;
  ledgerAccountId?: string;
  costCenterId?: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface CreatePurchaseOrderDto {
  vendorId: string;
  vendorReference?: string;
  quotationId?: string;
  requisitionId?: string;
  contractId?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  currencyCode?: string;
  exchangeRate?: number;
  paymentTerms?: PaymentTerms;
  incoterm?: Incoterm;
  incotermLocation?: string;
  shippingAmount?: number;
  budgetId?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  lines: CreatePurchaseOrderLineDto[];
}

export interface UpdatePurchaseOrderDto {
  vendorReference?: string;
  expectedDeliveryDate?: string;
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  lines?: CreatePurchaseOrderLineDto[];
}

export interface CancelPurchaseOrderDto {
  cancellationReason: string;
}
