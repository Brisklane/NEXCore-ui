import { PurchaseInvoiceStatus, InvoiceMatchingStatus, InvoicePaymentStatus } from './procurement-enums';
import { PaymentTerms } from './vendor.model';

export interface PurchaseInvoiceLineDto {
  id: string;
  lineNumber: number;
  purchaseOrderLineId?: string;
  goodsReceiptLineId?: string;
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
  recoverableTaxAmount: number;
  nonRecoverableTaxAmount: number;
  subTotal: number;
  totalPrice: number;
  procurementCategoryId?: string;
  procurementCategoryName?: string;
  ledgerAccountId?: string;
  notes?: string;
}

export interface PurchaseInvoiceDto {
  id: string;
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  invoiceDate: string;
  dueDate: string;
  postingDate: string;
  status: PurchaseInvoiceStatus;
  matchingStatus: InvoiceMatchingStatus;
  paymentStatus: InvoicePaymentStatus;
  currencyCode: string;
  exchangeRate: number;
  subTotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentTerms: PaymentTerms;
  fiscalPeriodId?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  postedAt?: string;
  holdReason?: string;
  disputeReason?: string;
  notes?: string;
  internalNotes?: string;
  lines: PurchaseInvoiceLineDto[];
}

export interface CreatePurchaseInvoiceLineDto {
  purchaseOrderLineId?: string;
  goodsReceiptLineId?: string;
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
  notes?: string;
}

export interface CreatePurchaseInvoiceDto {
  vendorInvoiceNumber: string;
  vendorId: string;
  purchaseOrderId?: string;
  invoiceDate: string;
  dueDate: string;
  postingDate?: string;
  currencyCode?: string;
  exchangeRate?: number;
  paymentTerms?: PaymentTerms;
  fiscalPeriodId?: string;
  notes?: string;
  internalNotes?: string;
  lines: CreatePurchaseInvoiceLineDto[];
}

export interface UpdatePurchaseInvoiceDto {
  invoiceDate?: string;
  dueDate?: string;
  fiscalPeriodId?: string;
  notes?: string;
  internalNotes?: string;
  lines?: CreatePurchaseInvoiceLineDto[];
}

export interface HoldInvoiceDto { holdReason: string; }
export interface DisputeInvoiceDto { disputeReason: string; }
