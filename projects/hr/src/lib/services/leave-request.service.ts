import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { LeaveRequestDto, CreateLeaveRequestDto, UpdateLeaveRequestDto } from '../models/leave-request.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<LeaveRequestDto[]>> {
    return this.http.get<ApiResponse<LeaveRequestDto[]>>(HR_API.leaveRequest.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<LeaveRequestDto>> {
    return this.http.get<ApiResponse<LeaveRequestDto>>(HR_API.leaveRequest.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEmployee(employeeId: string): Observable<ApiResponse<LeaveRequestDto[]>> {
    return this.http.get<ApiResponse<LeaveRequestDto[]>>(HR_API.leaveRequest.byEmployee(employeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateLeaveRequestDto): Observable<ApiResponse<LeaveRequestDto>> {
    return this.http.post<ApiResponse<LeaveRequestDto>>(HR_API.leaveRequest.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateLeaveRequestDto): Observable<ApiResponse<LeaveRequestDto>> {
    return this.http.put<ApiResponse<LeaveRequestDto>>(HR_API.leaveRequest.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  approve(id: string): Observable<ApiResponse<LeaveRequestDto>> {
    return this.http.post<ApiResponse<LeaveRequestDto>>(HR_API.leaveRequest.approve(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  reject(id: string): Observable<ApiResponse<LeaveRequestDto>> {
    return this.http.post<ApiResponse<LeaveRequestDto>>(HR_API.leaveRequest.reject(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.leaveRequest.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
