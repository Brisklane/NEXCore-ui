export interface LeaveTypeDto {
  id: string;
  name: string;
  code: string;
  daysAllowed: number;
  isPaid: boolean;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  code: string;
  daysAllowed: number;
  isPaid: boolean;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  code?: string;
  daysAllowed?: number;
  isPaid?: boolean;
  isActive?: boolean;
}
