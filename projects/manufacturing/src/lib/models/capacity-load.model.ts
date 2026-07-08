export interface CapacityLoadDto {
  id: string;
  workCenterShiftId: string;
  workCenterId: string | null;
  workCenterName: string | null;
  productionOrderId: string | null;
  date: string | null;
  requiredHours: number;
  availableHours: number;
  loadPercentage: number;
  productionOrderCount: number;
  isOverloaded: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateCapacityLoadDto {
  workCenterShiftId: string;
  workCenterId?: string | null;
  productionOrderId?: string | null;
  date?: string | null;
  requiredHours: number;
  availableHours: number;
}

export interface UpdateCapacityLoadDto {
  productionOrderId?: string | null;
  date?: string | null;
  requiredHours?: number | null;
  availableHours?: number | null;
}
