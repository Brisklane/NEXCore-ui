// ─── Addon models ─────────────────────────────────────────────────────────────

export interface SalesOrderLineAddonDto {
  id: string;
  addonProductId: string | null;
  addonName: string | null;
  addonPrice: number;
  quantity: number;
}

export interface CreateSalesOrderLineAddonDto {
  addonProductId?: string | null;
  addonName?: string | null;
  addonPrice: number;
  quantity: number;
}

// ─── Line item models ─────────────────────────────────────────────────────────

export interface SalesOrderLineDto {
  id: string;
  lineNumber: number;
  productId: string;
  productCode: string | null;
  productName: string | null;
  productDescription: string | null;
  productImageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  deliveredQuantity: number;
  invoicedQuantity: number;
  cancelledQuantity: number;
  unitOfMeasure: string | null;
  warehouseId: string | null;
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
  actualDeliveryDate: string | null;
  lineStatus: string | null;
  specialInstructions: string | null;
  addons: SalesOrderLineAddonDto[] | null;
}

export interface CreateSalesOrderLineDto {
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  productDescription?: string | null;
  productImageUrl?: string | null;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitOfMeasure?: string | null;
  warehouseId?: string | null;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxCategory?: string | number | null;
  specialInstructions?: string | null;
  requestedDeliveryDate?: string | null;
  addons?: CreateSalesOrderLineAddonDto[] | null;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

// Names and ordering mirror the backend SalesOrderStatus enum exactly.
export type SalesOrderStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Confirmed'
  | 'PartiallyDelivered'
  | 'FullyDelivered'
  | 'Invoiced'
  | 'Closed'
  | 'Cancelled'
  | 'OnHold'
  | 'PosParked'
  | 'PartiallyPaid'
  | 'PaidAndClosed'
  | 'Preparing'
  | 'ReadyForPickup'
  | 'OutForDelivery'
  | 'Delivered'
  | 'DeliveryFailed'
  | 'PaymentPending'
  | 'Placed'
  | 'Rejected';

export type SalesChannel =
  | 'InStore'
  | 'Online'
  | 'MobileApp'
  | 'Phone'
  | 'WebPOS'
  | 'AndroidPOS'
  | 'B2B'
  | 'Portal'
  | 'Marketplace'
  | 'Partner'
  | 'Other'
  | 'Direct'
  | 'POS';

// ─── Response DTO ────────────────────────────────────────────────────────────

export interface SalesOrderDto {
  id: string;
  orderNumber: string | null;
  orderName: string | null;
  contactId: string | null;
  contactName: string | null;
  customerPONumber: string | null;
  customerPODate: string | null;
  status: SalesOrderStatus | number;
  salesChannel: SalesChannel | number;
  fulfillmentType: string | number | null;
  // Dates
  orderDate: string | null;
  placedAt: string | null;
  requestedDeliveryDate: string | null;
  confirmedDeliveryDate: string | null;
  submittedDate: string | null;
  approvedDate: string | null;
  closedDate: string | null;
  cancelledDate: string | null;
  rejectedDate: string | null;
  expiresAt: string | null;
  // References
  quotationId: string | null;
  salesAgreementId: string | null;
  // POS origin
  originBranchId: string | null;
  originPosTerminalId: string | null;
  originPosCashierId: string | null;
  originPosSessionId: string | null;
  // Pricing
  priceListId: string | null;
  currencyCode: string | null;
  exchangeRate: number;
  couponCode: string | null;
  couponDiscountAmount: number;
  loyaltyPointsRedeemed: number;
  loyaltyPointsEarned: number;
  paymentTerms: string | number | null;
  incoterm: string | number | null;
  incotermLocation: string | null;
  // Financial breakdown
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  tipAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  creditCheckPassed: boolean;
  creditCheckDate: string | null;
  // Billing address
  billToName: string | null;
  billToStreet: string | null;
  billToCity: string | null;
  billToState: string | null;
  billToPostalCode: string | null;
  billToCountry: string | null;
  // Shipping address
  shipToAddressId: string | null;
  shipToName: string | null;
  shipToStreet: string | null;
  shipToCity: string | null;
  shipToState: string | null;
  shipToPostalCode: string | null;
  shipToCountry: string | null;
  // Delivery
  shippingMethod: string | null;
  trackingNumber: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  deliveryInstructions: string | null;
  // Other
  salesRepId: string | null;
  salesTerritoryId: string | null;
  notes: string | null;
  internalNotes: string | null;
  termsAndConditions: string | null;
  cancellationReason: string | null;
  lines: SalesOrderLineDto[];
}

// ─── Create DTOs ─────────────────────────────────────────────────────────────

export interface CreateSalesOrderDto {
  contactId?: string | null;
  contactName?: string | null;
  customerPONumber?: string | null;
  customerPODate?: string | null;
  salesChannel: SalesChannel | string | number;
  fulfillmentType?: string | number | null;
  orderName?: string | null;
  // POS origin tracking
  originBranchId?: string | null;
  originPosTerminalId?: string | null;
  originPosCashierId?: string | null;
  originPosSessionId?: string | null;
  /** Client-generated id for a sale completed offline (idempotency key on sync). */
  offlineOrderNumber?: string | null;
  // References
  quotationId?: string | null;
  salesAgreementId?: string | null;
  // Pricing
  priceListId?: string | null;
  currencyCode?: string | null;
  exchangeRate?: number;
  couponCode?: string | null;
  loyaltyPointsRedeemed?: number;
  paymentTerms?: string | number | null;
  incoterm?: string | number | null;
  incotermLocation?: string | null;
  // Billing address
  billToName?: string | null;
  billToStreet?: string | null;
  billToCity?: string | null;
  billToState?: string | null;
  billToPostalCode?: string | null;
  billToCountry?: string | null;
  // Shipping address
  shipToAddressId?: string | null;
  shipToName?: string | null;
  shipToPhone?: string | null;
  shipToStreet?: string | null;
  shipToCity?: string | null;
  shipToState?: string | null;
  shipToPostalCode?: string | null;
  shipToCountry?: string | null;
  // Delivery
  shippingMethod?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryInstructions?: string | null;
  // Other
  salesRepId?: string | null;
  salesTerritoryId?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  termsAndConditions?: string | null;
  expiresAt?: string | null;
  lines: CreateSalesOrderLineDto[];
}

export interface CreatePhoneOrderDto {
  contactId?: string | null;
  contactName?: string | null;
  contactPhone: string;
  posStoreId?: string | null;
  posCashierId?: string | null;
  posTerminalId?: string | null;
  posSessionId?: string | null;
  salesChannel?: SalesChannel | string;
  fulfillmentType?: string | null;
  shipToName?: string | null;
  shipToStreet?: string | null;
  shipToCity?: string | null;
  shipToState?: string | null;
  shipToPostalCode?: string | null;
  shipToCountry?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryInstructions?: string | null;
  priceListId?: string | null;
  currencyCode?: string | null;
  couponCode?: string | null;
  notes?: string | null;
  lines: CreateSalesOrderLineDto[];
}

export interface SyncOfflineOrderDto {
  offlineId: string;
  salesChannel: SalesChannel | string;
  createdAt: string;
  contactId?: string | null;
  contactName?: string | null;
  originBranchId?: string | null;
  originPosTerminalId?: string | null;
  originPosCashierId?: string | null;
  originPosSessionId?: string | null;
  priceListId?: string | null;
  couponCode?: string | null;
  fulfillmentType?: string | null;
  notes?: string | null;
  lines: CreateSalesOrderLineDto[];
}

// ─── Update DTOs ─────────────────────────────────────────────────────────────

export interface UpdateSalesOrderStatusDto {
  status: SalesOrderStatus | string | number;
  note?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateSalesOrderDto {
  contactId?: string | null;
  salesChannel?: SalesChannel | string;
  originBranchId?: string | null;
  notes?: string | null;
  lines?: CreateSalesOrderLineDto[];
}

export interface CreateInvoiceFromOrderDto {
  invoiceType?: number;
  downPaymentPercentage?: number | null;
  downPaymentAmount?: number | null;
  dueDate?: string | null;
  customerReference?: string | null;
  notes?: string | null;
}
