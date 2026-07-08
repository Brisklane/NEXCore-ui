import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { LeaveTypeDto, CreateLeaveTypeDto, UpdateLeaveTypeDto } from '../models/leave-type.model';

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<LeaveTypeDto[]>> {
    return this.http.get<ApiResponse<LeaveTypeDto[]>>(HR_API.leaveType.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<LeaveTypeDto>> {
    return this.http.get<ApiResponse<LeaveTypeDto>>(HR_API.leaveType.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateLeaveTypeDto): Observable<ApiResponse<LeaveTypeDto>> {
    return this.http.post<ApiResponse<LeaveTypeDto>>(HR_API.leaveType.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateLeaveTypeDto): Observable<ApiResponse<LeaveTypeDto>> {
    return this.http.put<ApiResponse<LeaveTypeDto>>(HR_API.leaveType.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.leaveType.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
