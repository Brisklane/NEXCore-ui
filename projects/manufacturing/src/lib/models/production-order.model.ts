export interface ProductionOrderDto {
  id: string;
  orderNumber: string | null;
  productId: string;
  productName: string | null;
  billOfMaterialId: string | null;
  routingId: string | null;
  quantityPlanned: number;
  quantityProduced: number;
  quantityRejected: number;
  unitOfMeasure: string | null;
  status: string | null;
  plannedOrderId: string | null;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateProductionOrderDto {
  orderNumber?: string | null;
  productId: string;
  billOfMaterialId?: string | null;
  routingId?: string | null;
  plannedOrderId?: string | null;
  quantityPlanned: number;
  unitOfMeasure?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface UpdateProductionOrderDto {
  quantityPlanned?: number | null;
  quantityProduced?: number | null;
  quantityRejected?: number | null;
  unitOfMeasure?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
}

export interface ProductionOrderOperationDto {
  id: string;
  productionOrderId: string;
  sequenceNo: number;
  routingOperationId: string | null;
  operationName: string | null;
  workCenterId: string;
  workCenterName: string | null;
  status: string | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CreateProductionOrderOperationDto {
  productionOrderId: string;
  sequenceNo: number;
  operationName?: string | null;
  workCenterId: string;
  plannedStart?: string | null;
  plannedEnd?: string | null;
}

export interface UpdateProductionOrderOperationDto {
  status?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  plannedStart?: string | null;
  plannedEnd?: string | null;
}

export interface ProductionOrderComponentDto {
  id: string;
  productionOrderId: string;
  materialId: string;
  materialName: string | null;
  bomItemId: string | null;
  plannedQty: number;
  issuedQty: number;
  returnedQty: number;
  unitOfMeasure: string | null;
  scrapPercentage: number;
}

export interface CreateProductionOrderComponentDto {
  productionOrderId: string;
  materialId: string;
  plannedQty: number;
  unitOfMeasure?: string | null;
}

export interface UpdateProductionOrderComponentDto {
  plannedQty?: number | null;
  issuedQty?: number | null;
  returnedQty?: number | null;
  unitOfMeasure?: string | null;
}
