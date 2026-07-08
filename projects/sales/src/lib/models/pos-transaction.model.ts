// ─── POS transaction (checkout / receipt) models ──────────────────────────────
// The POS checkout endpoint atomically re-prices, creates + posts the invoice,
// registers payment(s), writes the PosTransaction, deducts stock and posts
// accounting. The printed receipt number equals the SalesInvoice.InvoiceNumber.

/** PosTenderType: Cash=0, CreditCard=1, DebitCard=2, MobileWallet=3, QrCode=4,
 *  GiftCard=5, LoyaltyPoints=6, StoreCredit=7, SplitPayment=8 */
export enum PosTenderType {
  Cash = 0,
  CreditCard = 1,
  DebitCard = 2,
  MobileWallet = 3,
  QrCode = 4,
  GiftCard = 5,
  LoyaltyPoints = 6,
  StoreCredit = 7,
  SplitPayment = 8,
}

export interface PosTenderDto {
  tenderType: PosTenderType | number;
  amount: number;
  referenceNumber?: string | null;
  authorizationCode?: string | null;
  cardScheme?: string | null;
  cardLast4?: string | null;
}

export interface PosCheckoutDto {
  salesOrderId: string;
  posSessionId: string;
  posTerminalId: string;
  posStoreId: string;
  posCashierId: string;
  tenders: PosTenderDto[];
  /** true = accept partial payment (remainder becomes a receivable). */
  allowCredit?: boolean;
  notes?: string | null;
}

export interface PosPaymentDto {
  id: string;
  tenderType: PosTenderType | number;
  amount: number;
  referenceNumber: string | null;
  authorizationCode: string | null;
  cardScheme: string | null;
  cardLast4: string | null;
  isApproved: boolean;
}

export interface PosTransactionLineDto {
  id: string;
  lineNumber: number;
  productId: string;
  productCode: string | null;
  productName: string | null;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitOfMeasure: string | null;
  unitPrice: number;
  discountAmount: number;
  netUnitPrice: number;
  lineAmount: number;
  taxCategory: number | string | null;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PosTransactionDto {
  id: string;
  transactionNumber: string | null;
  receiptNumber: string | null;
  posSessionId: string;
  posTerminalId: string;
  posStoreId: string;
  posCashierId: string;
  contactId: string | null;
  salesOrderId: string | null;
  transactionType: number | string;
  status: number | string;
  transactionDate: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  roundingAmount: number;
  totalAmount: number;
  tenderedAmount: number;
  changeAmount: number;
  notes: string | null;
  lines: PosTransactionLineDto[] | null;
  payments: PosPaymentDto[] | null;
}

export interface PosCheckoutResultDto {
  transaction: PosTransactionDto;
  salesOrderId: string;
  orderNumber: string | null;
  invoiceId: string;
  invoiceNumber: string | null;
  /** == invoiceNumber. */
  receiptNumber: string | null;
  totalAmount: number;
  tenderedAmount: number;
  changeAmount: number;
  balanceDue: number;
  isFullyPaid: boolean;
}

// ─── Offline sync ─────────────────────────────────────────────────────────────

/** Batch of offline-completed sales to replay. `orders` are the queued OfflineSaleDto payloads. */
export interface OfflineSyncRequest {
  deviceId?: string;
  orders: unknown[];
}

export interface OfflineSyncResultItem {
  offlineOrderNumber: string;
  /** Synced | Duplicate | Failed (string or enum-number depending on server JSON config). */
  status: number | string;
  orderNumber?: string | null;
  receiptNumber?: string | null;
  transactionId?: string | null;
  error?: string | null;
  /** Total the device printed offline. */
  deviceTotal?: number | null;
  /** Total the server computed after re-pricing. */
  serverTotal?: number | null;
  /** serverTotal − deviceTotal; non-zero = the booked sale differs from the offline receipt. */
  variance?: number | null;
}

export interface OfflineSyncResult {
  results: OfflineSyncResultItem[];
  syncedCount: number;
  duplicateCount: number;
  failedCount: number;
}
