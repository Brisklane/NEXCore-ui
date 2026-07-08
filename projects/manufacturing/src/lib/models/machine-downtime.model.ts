export interface MachineDowntimeDto {
  id: string;
  workCenterId: string;
  workCenterName: string | null;
  productionOrderId: string | null;
  reason: string | null;
  category: string | null;
  startTime: string | null;
  endTime: string | null;
  durationHours: number;
  rootCause: string | null;
  resolution: string | null;
  reportedById: string | null;
  resolvedById: string | null;
  status: string | null;
  maintenanceWorkOrderId: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateMachineDowntimeDto {
  workCenterId: string;
  productionOrderId?: string | null;
  reason?: string | null;
  category?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationHours: number;
  notes?: string | null;
}

export interface UpdateMachineDowntimeDto {
  reason?: string | null;
  category?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationHours?: number | null;
  status?: string | null;
  notes?: string | null;
}
