export interface ReworkOrderDto {
  id: string;
  productionOrderId: string;
  orderNumber: string | null;
  inspectionId: string | null;
  reworkRoutingId: string | null;
  quantity: number;
  quantityCompleted: number;
  quantityRejected: number;
  unitOfMeasure: string | null;
  scheduledStartDate: string | null;
  scheduledEndDate: string | null;
  reason: string | null;
  status: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateReworkOrderDto {
  productionOrderId: string;
  inspectionId?: string | null;
  reworkRoutingId?: string | null;
  quantity: number;
  status?: string | null;
  unitOfMeasure?: string | null;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  reason?: string | null;
}

export interface UpdateReworkOrderDto {
  quantity?: number | null;
  quantityCompleted?: number | null;
  quantityRejected?: number | null;
  unitOfMeasure?: string | null;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  reason?: string | null;
  status?: string | null;
}
