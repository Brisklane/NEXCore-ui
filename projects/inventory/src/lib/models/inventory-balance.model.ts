export interface InventoryBalanceDto {
  id: string;
  itemId: string;
  warehouseId: string;
  binId: string | null;
  variantId: string | null;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  averageCost: number;
  totalValue: number;
  lastTransactionDate: string | null;
  costingMethod: string | null;
}

export interface InventoryBalanceReportDto {
  itemId: string;
  itemCode: string | null;
  itemName: string | null;
  warehouseId: string;
  warehouseName: string | null;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  averageCost: number;
  totalValue: number;
  lastTransactionDate: string | null;
}

/** Per-item stock totals summed across all warehouses (fast grid endpoint). */
export interface ItemStockTotalDto {
  itemId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
}
