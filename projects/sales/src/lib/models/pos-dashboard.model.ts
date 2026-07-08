export interface PosDailySalesDto {
  date: string;
  totalSales: number;
  transactionCount: number;
}

export interface PosBranchStatusDto {
  branchId: string;
  status: string;
  openSessionCount: number;
  activeSessionId: string | null;
  activeSessionNumber: string | null;
  activeCashierId: string | null;
  activeCashierName: string | null;
  sessionOpenedAt: string | null;
  todayTotalSales: number;
  todayTransactionCount: number;
  todayCashCollected: number;
  todayCardCollected: number;
  todayWalletCollected: number;
  recentDailySales: PosDailySalesDto[];
}

export interface PosDashboardBulkRequestDto {
  branchIds: string[];
}

export interface PosTerminalStatusDto {
  terminalId: string;
  terminalName: string;
  terminalCode: string;
  storeId: string;
  storeName: string;
  isActive: boolean;
  // Session state
  status: number | string;
  activeSessionId: string | null;
  activeSessionNumber: string | null;
  activeCashierName: string | null;
  sessionOpenedAt: string | null;
  openingFloat: number;
  // Today's totals
  todayTotalSales: number;
  todayTransactionCount: number;
  todayCashCollected: number;
  todayCardCollected: number;
  todayWalletCollected: number;
}
