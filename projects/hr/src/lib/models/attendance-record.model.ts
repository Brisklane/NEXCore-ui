export interface AttendanceRecordDto {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateAttendanceRecordDto {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  notes?: string;
}

export interface UpdateAttendanceRecordDto {
  checkIn?: string;
  checkOut?: string;
  status?: string;
  notes?: string;
}
