export interface WorkCenterDto {
  id: string;
  name: string | null;
  code: string | null;
  description: string | null;
  capacityPerHour: number;
  hourlyMachineCost: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateWorkCenterDto {
  name: string;
  code: string;
  description?: string | null;
  capacityPerHour: number;
  hourlyMachineCost: number;
}

export interface UpdateWorkCenterDto {
  name?: string | null;
  code?: string | null;
  description?: string | null;
  capacityPerHour?: number | null;
  hourlyMachineCost?: number | null;
  isActive?: boolean | null;
}

export interface WorkCenterShiftDto {
  id: string;
  workCenterId: string;
  shiftName: string | null;
  startTime: string | null;
  endTime: string | null;
  workingDays: string | null;
  availableHours: number;
  capacityUtilizationPercent: number;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  notes: string | null;
}

export interface CreateWorkCenterShiftDto {
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDays?: string | null;
  availableHours?: number;
  isActive?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
}

export interface UpdateWorkCenterShiftDto {
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  workingDays?: string | null;
  availableHours?: number | null;
  isActive?: boolean | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
}
