export interface ProductionScheduleDto {
  id: string;
  productionOrderId: string | null;
  orderNumber: string | null;
  productionOrderOperationId: string;
  workCenterId: string;
  workCenterName: string | null;
  scheduledStartDate: string | null;
  scheduledEndDate: string | null;
  scheduleType: string | null;
  capacityRequiredHours: number;
  hasCapacityConflict: boolean;
  conflictDescription: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateProductionScheduleDto {
  productionOrderId?: string | null;
  productionOrderOperationId?: string | null;
  workCenterId: string;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  scheduleType?: string | null;
  capacityRequiredHours?: number;
  notes?: string | null;
}

export interface UpdateProductionScheduleDto {
  workCenterId?: string | null;
  scheduledStartDate?: string | null;
  scheduledEndDate?: string | null;
  scheduleType?: string | null;
  capacityRequiredHours?: number | null;
  hasCapacityConflict?: boolean | null;
  conflictDescription?: string | null;
  notes?: string | null;
}
