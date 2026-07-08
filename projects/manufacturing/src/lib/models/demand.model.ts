export interface DemandDto {
  id: string;
  productId: string;
  productName: string | null;
  quantity: number;
  fulfilledQty: number;
  dueDate: string | null;
  status: string | null;
  sourceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateDemandDto {
  productId: string;
  quantity: number;
  dueDate?: string | null;
  sourceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
}

export interface UpdateDemandDto {
  quantity?: number | null;
  dueDate?: string | null;
  status?: string | null;
  notes?: string | null;
}
