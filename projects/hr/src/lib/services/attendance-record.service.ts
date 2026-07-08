import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { AttendanceRecordDto, CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from '../models/attendance-record.model';

@Injectable({ providedIn: 'root' })
export class AttendanceRecordService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<AttendanceRecordDto[]>> {
    return this.http.get<ApiResponse<AttendanceRecordDto[]>>(HR_API.attendanceRecord.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<AttendanceRecordDto>> {
    return this.http.get<ApiResponse<AttendanceRecordDto>>(HR_API.attendanceRecord.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEmployee(employeeId: string): Observable<ApiResponse<AttendanceRecordDto[]>> {
    return this.http.get<ApiResponse<AttendanceRecordDto[]>>(HR_API.attendanceRecord.byEmployee(employeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByDate(date: string): Observable<ApiResponse<AttendanceRecordDto[]>> {
    return this.http.get<ApiResponse<AttendanceRecordDto[]>>(HR_API.attendanceRecord.byDate(date), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateAttendanceRecordDto): Observable<ApiResponse<AttendanceRecordDto>> {
    return this.http.post<ApiResponse<AttendanceRecordDto>>(HR_API.attendanceRecord.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateAttendanceRecordDto): Observable<ApiResponse<AttendanceRecordDto>> {
    return this.http.put<ApiResponse<AttendanceRecordDto>>(HR_API.attendanceRecord.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.attendanceRecord.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
