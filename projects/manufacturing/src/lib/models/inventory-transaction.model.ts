export interface InventoryTransactionDto {
  id: string;
  productId: string;
  productName: string | null;
  transactionType: string | null;
  quantity: number;
  unit: string | null;
  referenceId: string | null;
  referenceType: string | null;
  transactionDate: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateInventoryTransactionDto {
  productId: string;
  transactionType?: string | null;
  quantity: number;
  unit?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  transactionDate?: string | null;
  notes?: string | null;
}

export interface UpdateInventoryTransactionDto {
  transactionType?: string | null;
  quantity?: number | null;
  unit?: string | null;
  transactionDate?: string | null;
  notes?: string | null;
}
