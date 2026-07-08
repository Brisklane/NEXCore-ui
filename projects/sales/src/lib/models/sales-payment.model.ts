export type PaymentMethod = 'Cash' | 'Card' | 'BankTransfer' | 'Online' | 'Cheque' | 'GiftCard' | 'Wallet' | 'CreditOnAccount' | 'Other';

export interface SalesPaymentDto {
  id: string;
  paymentNumber: string | null;
  salesOrderId: string | null;
  salesInvoiceId: string | null;
  contactId: string | null;
  contactName: string | null;
  amount: number;
  currencyCode: string | null;
  exchangeRate: number;
  paymentMethod: string | null;
  referenceNumber: string | null;
  bankName: string | null;
  gatewayTransactionId: string | null;
  notes: string | null;
  paidAt: string | null;
}

/** Allocate part (or all) of a payment to a specific invoice. */
export interface CreatePaymentAllocationDto {
  salesInvoiceId: string;
  allocatedAmount: number;
}

export interface CreateSalesPaymentDto {
  salesOrderId?: string | null;
  contactId?: string | null;
  amount: number;
  currencyCode?: string | null;
  exchangeRate?: number;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  bankName?: string | null;
  gatewayTransactionId?: string | null;
  notes?: string | null;
  allocations?: CreatePaymentAllocationDto[] | null;
}
