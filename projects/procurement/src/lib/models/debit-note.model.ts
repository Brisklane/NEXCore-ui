export enum DebitNoteStatus {
  Draft = 0, Sent = 1, Acknowledged = 2, PartiallySettled = 3, FullySettled = 4, Cancelled = 5,
}

export const DEBIT_NOTE_STATUS_LABELS: Record<DebitNoteStatus, string> = {
  [DebitNoteStatus.Draft]: 'Draft',
  [DebitNoteStatus.Sent]: 'Sent',
  [DebitNoteStatus.Acknowledged]: 'Acknowledged',
  [DebitNoteStatus.PartiallySettled]: 'Partially Settled',
  [DebitNoteStatus.FullySettled]: 'Fully Settled',
  [DebitNoteStatus.Cancelled]: 'Cancelled',
};

export interface VendorDebitNoteLineDto {
  id: string;
  lineNumber: number;
  returnLineId: string;
  itemId?: string;
  itemCode?: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  subTotal: number;
  totalAmount: number;
  notes?: string;
}

export interface VendorDebitNoteDto {
  id: string;
  debitNoteNumber: string;
  purchaseReturnId: string;
  purchaseReturnNumber?: string;
  vendorId: string;
  vendorName?: string;
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  debitNoteDate: string;
  sentAt?: string;
  acknowledgedAt?: string;
  settledAt?: string;
  status: DebitNoteStatus;
  currencyCode: string;
  exchangeRate: number;
  subTotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  settledAmount: number;
  outstandingAmount: number;
  notes?: string;
  lines: VendorDebitNoteLineDto[];
}

export interface CreateVendorDebitNoteDto {
  purchaseReturnId: string;
  originalInvoiceId?: string;
  debitNoteDate: string;
  notes?: string;
}
