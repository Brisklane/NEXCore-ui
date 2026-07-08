export interface PlannedOrderDto {
  id: string;
  productId: string;
  productName: string | null;
  plannedQty: number;
  requiredDate: string | null;
  sourceType: string | null;
  status: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreatePlannedOrderDto {
  productId: string;
  plannedQty: number;
  requiredDate?: string | null;
  sourceType?: string | null;
  notes?: string | null;
}

export interface UpdatePlannedOrderDto {
  plannedQty?: number | null;
  requiredDate?: string | null;
  status?: string | null;
  notes?: string | null;
}
