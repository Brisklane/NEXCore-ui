import { PosTenderType } from './pos-transaction.model';
import { PosCashMovementType } from './pos-cashier.model';

export interface PosTenderTotalDto {
  tenderType: PosTenderType | number;
  tenderName: string;
  amount: number;
  count: number;
  /** 0–100. */
  sharePercent: number;
}

export interface PosCashMovementSummaryDto {
  movementType: PosCashMovementType | number;
  movementName: string;
  amount: number;
  reason: string | null;
  movementDate: string;
}

/**
 * A shift read. An X read is taken mid-shift and changes nothing; a Z read is the
 * end-of-shift figure. Same shape either way — `isProvisional` says whether the numbers
 * can still move.
 */
export interface PosShiftReportDto {
  sessionId: string;
  sessionNumber: string;
  sessionStatus: number;
  isProvisional: boolean;

  cashierId: string;
  cashierName: string | null;
  terminalId: string;
  terminalName: string | null;
  storeId: string | null;
  storeName: string | null;

  openedAt: string;
  closedAt: string | null;
  generatedAt: string;

  grossSales: number;
  refunds: number;
  discounts: number;
  tax: number;
  netSales: number;

  saleCount: number;
  refundCount: number;
  voidCount: number;
  averageBasket: number;
  itemsSold: number;

  tenders: PosTenderTotalDto[];

  openingFloat: number;
  cashSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  /** Null while the session is open — nothing has been counted yet. */
  countedCash: number | null;
  cashVariance: number | null;
  cashMovements: PosCashMovementSummaryDto[];

  recordedSalesTotal: number;
  recordedCashCollected: number;
  recordedTransactionCount: number;
  /** The session's running counters disagree with the transactions. Worth a look. */
  countersDisagree: boolean;
}

export interface PosSalesSummaryDto {
  from: string;
  to: string;
  storeId: string | null;
  grossSales: number;
  refunds: number;
  discounts: number;
  tax: number;
  netSales: number;
  saleCount: number;
  refundCount: number;
  itemsSold: number;
  averageBasket: number;
  sessionCount: number;
}

export interface PosProductSalesDto {
  productId: string;
  productCode: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  netSales: number;
  discounts: number;
  lineCount: number;
}

export interface PosCashierSalesDto {
  cashierId: string;
  cashierName: string | null;
  grossSales: number;
  refunds: number;
  netSales: number;
  transactionCount: number;
  averageBasket: number;
}

export interface PosHourlySalesDto {
  /** 0–23. Every hour is returned, so a gap means no trade rather than no data. */
  hour: number;
  netSales: number;
  transactionCount: number;
}
