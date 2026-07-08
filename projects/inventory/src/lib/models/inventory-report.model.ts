export interface StockLedgerReportDto {
  transactionId: string;
  transactionDate: string;
  documentNumber: string | null;
  documentType: string | null;
  transactionType: string | null;
  quantity: number;
  unitCost: number;
  totalCost: number;
  runningBalance: number;
  runningValue: number;
  reference: string | null;
}

export interface InventoryAgingReportDto {
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  warehouseId: string;
  warehouseName: string | null;
  receiptDate: string;
  remainingQuantity: number;
  unitCost: number;
  totalValue: number;
  daysInInventory: number;
  status: string | null;
}

export interface StockValuationReportDto {
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  categoryName: string | null;
  totalQuantity: number;
  totalValue: number;
  averageCost: number;
  asOfDate: string;
}

export interface LowStockAlertDto {
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  warehouseId: string;
  warehouseName: string | null;
  currentQuantity: number;
  reorderLevel: number;
  economicOrderQuantity: number;
  status: string | null;
}
