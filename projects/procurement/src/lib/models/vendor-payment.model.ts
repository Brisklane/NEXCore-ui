import { VendorPaymentStatus, VendorPaymentMethod } from './procurement-enums';

export interface VendorPaymentAllocationDto {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  vendorInvoiceNumber?: string;
  invoiceTotalAmount: number;
  invoiceOutstandingAmount: number;
  allocatedAmount: number;
  discountTaken: number;
  writeOffAmount: number;
  fxGainLossAmount: number;
  fxGainLossLedgerAccountId?: string;
  notes?: string;
}

export interface VendorPaymentDto {
  id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName?: string;
  paymentDate: string;
  valueDate?: string;
  clearedAt?: string;
  status: VendorPaymentStatus;
  paymentMethod: VendorPaymentMethod;
  companyBankAccountId?: string;
  vendorBankAccountId?: string;
  currencyCode: string;
  exchangeRate: number;
  totalAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  bankReferenceNumber?: string;
  checkNumber?: string;
  transactionReference?: string;
  fiscalPeriodId?: string;
  withholdingTaxAmount: number;
  approvedByUserId?: string;
  approvedAt?: string;
  notes?: string;
  allocations: VendorPaymentAllocationDto[];
}

export interface CreatePaymentAllocationDto {
  invoiceId: string;
  allocatedAmount: number;
  discountTaken?: number;
  writeOffAmount?: number;
  fxGainLossLedgerAccountId?: string;
  notes?: string;
}

export interface CreateVendorPaymentDto {
  vendorId: string;
  paymentDate: string;
  valueDate?: string;
  paymentMethod?: VendorPaymentMethod;
  companyBankAccountId?: string;
  vendorBankAccountId?: string;
  currencyCode?: string;
  exchangeRate?: number;
  totalAmount: number;
  bankReferenceNumber?: string;
  checkNumber?: string;
  fiscalPeriodId?: string;
  withholdingTaxAmount?: number;
  notes?: string;
  allocations: CreatePaymentAllocationDto[];
}

export interface UpdateVendorPaymentDto {
  paymentDate?: string;
  valueDate?: string;
  vendorBankAccountId?: string;
  bankReferenceNumber?: string;
  checkNumber?: string;
  notes?: string;
}
