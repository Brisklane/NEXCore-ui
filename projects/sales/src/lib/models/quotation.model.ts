// ─── Line item models ─────────────────────────────────────────────────────────

export interface QuotationLineDto {
  id: string;
  lineNumber: number;
  productId: string;
  productCode: string | null;
  productName: string | null;
  productDescription: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  netUnitPrice: number;
  lineAmount: number;
  taxCategory: string | number | null;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  requestedDeliveryDate: string | null;
  confirmedDeliveryDate: string | null;
  notes: string | null;
}

export interface CreateQuotationLineDto {
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  productDescription?: string | null;
  quantity: number;
  unitOfMeasure?: string | null;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxCategory?: string | number | null;
  requestedDeliveryDate?: string | null;
  notes?: string | null;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';

// ─── Response DTO ────────────────────────────────────────────────────────────

export interface QuotationDto {
  id: string;
  quotationNumber: string | null;
  quotationName: string | null;
  contactId: string | null;
  contactName: string | null;
  status: QuotationStatus | number;
  quotationDate: string | null;
  validUntil: string | null;
  sentDate: string | null;
  acceptedDate: string | null;
  priceListId: string | null;
  currencyCode: string | null;
  exchangeRate: number;
  paymentTerms: string | number | null;
  incoterm: string | number | null;
  incotermLocation: string | null;
  requestedDeliveryDate: string | null;
  shipToAddressId: string | null;
  shippingMethod: string | null;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  salesRepId: string | null;
  salesTerritoryId: string | null;
  crmDealId: string | null;
  convertedToSalesOrderId: string | null;
  customerPONumber: string | null;
  notes: string | null;
  termsAndConditions: string | null;
  lines: QuotationLineDto[];
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateQuotationDto {
  quotationName?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  validUntil?: string | null;
  priceListId?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number;
  paymentTerms?: string | number | null;
  incoterm?: string | null;
  incotermLocation?: string | null;
  requestedDeliveryDate?: string | null;
  shipToAddressId?: string | null;
  shippingMethod?: string | null;
  salesRepId?: string | null;
  salesTerritoryId?: string | null;
  crmDealId?: string | null;
  customerPONumber?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  lines: CreateQuotationLineDto[];
}
