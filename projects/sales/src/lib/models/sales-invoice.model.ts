// ─── Line item models ─────────────────────────────────────────────────────────

export interface SalesInvoiceLineDto {
  id: string;
  lineNumber: number;
  salesOrderLineId: string;
  productId: string;
  productCode: string | null;
  productName: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  discountAmount: number;
  lineAmount: number;
  taxCategory: string | number | null;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  isDownPayment?: boolean;
}

export interface CreateSalesInvoiceLineDto {
  salesOrderLineId: string;
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  quantity: number;
  unitOfMeasure?: string | null;
  unitPrice: number;
  discountAmount?: number;
  taxCategory?: string | number | null;
  taxRate?: number;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'Draft'
  | 'Confirmed'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'
  | 'Void';

// ─── Response DTO ────────────────────────────────────────────────────────────

export interface SalesInvoiceDto {
  id: string;
  invoiceNumber: string | null;
  salesOrderId: string;
  orderNumber: string | null;
  contactId: string | null;
  contactName: string | null;
  deliveryId: string | null;
  status: InvoiceStatus | number;
  paymentStatus: number | null;
  invoiceDate: string | null;
  dueDate: string | null;
  currencyCode: string | null;
  exchangeRate: number;
  paymentTerms: string | number | null;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  billToName: string | null;
  billToStreet: string | null;
  billToCity: string | null;
  billToState: string | null;
  billToPostalCode: string | null;
  billToCountry: string | null;
  customerReference: string | null;
  salesRepId: string | null;
  salesRepName: string | null;
  paymentReference: string | null;
  recipientBankAccount: string | null;
  deliveryDate: string | null;
  fiscalPositionId: string | null;
  paymentMethod: string | null;
  autoPost: number | null;
  lastReminderDate: string | null;
  reminderCount: number;
  accountingJournalEntryId: string | null;
  notes: string | null;
  lines: SalesInvoiceLineDto[];
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateSalesInvoiceDto {
  salesOrderId: string;
  contactId?: string | null;
  deliveryId?: string | null;
  dueDate: string;
  currencyCode?: string | null;
  exchangeRate?: number;
  paymentTerms?: string | null;
  billToName?: string | null;
  billToStreet?: string | null;
  billToCity?: string | null;
  billToState?: string | null;
  billToPostalCode?: string | null;
  billToCountry?: string | null;
  customerReference?: string | null;
  notes?: string | null;
  lines: CreateSalesInvoiceLineDto[];
}

export interface CancelInvoiceDto {
  reason?: string | null;
}

export interface RegisterInvoicePaymentDto {
  paymentMethod?: string | null;
  journal?: string | null;
  amount?: number | null;
  paymentDate: string;
  memo?: string | null;
  bankName?: string | null;
  referenceNumber?: string | null;
}

export interface SendInvoiceDto {
  toEmails?: string[] | null;
  subject?: string | null;
  body?: string | null;
}

export interface CreateCreditNoteFromInvoiceDto {
  reason?: string | null;
  creditNoteDate?: string | null;
  fullReversal?: boolean;
  notes?: string | null;
}

export interface CreditNoteLineDto {
  id: string;
  lineNumber: number;
  productId: string;
  productCode: string | null;
  productName: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  lineAmount: number;
  taxCategory: string | number | null;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  reason: string | null;
}

export interface CreditNoteDto {
  id: string;
  creditNoteNumber: string | null;
  salesInvoiceId: string;
  contactId: string | null;
  contactName: string | null;
  creditNoteDate: string;
  currencyCode: string | null;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  reason: string | null;
  accountingJournalEntryId: string | null;
  notes: string | null;
  lines: CreditNoteLineDto[];
}
