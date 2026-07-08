export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: string;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestDto {
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string;
}
