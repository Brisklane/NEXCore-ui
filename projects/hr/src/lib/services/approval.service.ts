import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  ApprovalRequestDto, SubmitApprovalRequestDto, UpdateApprovalRequestDto,
  ApproveStepDto, RejectStepDto, DelegateStepDto,
} from '../models/approval-request.model';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<ApprovalRequestDto[]>> {
    return this.http.get<ApiResponse<ApprovalRequestDto[]>>(HR_API.approval.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.get<ApiResponse<ApprovalRequestDto>>(HR_API.approval.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEntity(entityType: string, entityId: string): Observable<ApiResponse<ApprovalRequestDto[]>> {
    return this.http.get<ApiResponse<ApprovalRequestDto[]>>(HR_API.approval.byEntity(entityType, entityId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getPendingByEmployee(approverEmployeeId: string): Observable<ApiResponse<ApprovalRequestDto[]>> {
    return this.http.get<ApiResponse<ApprovalRequestDto[]>>(HR_API.approval.pendingByEmployee(approverEmployeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  submit(dto: SubmitApprovalRequestDto): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.post<ApiResponse<ApprovalRequestDto>>(HR_API.approval.submit, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateApprovalRequestDto): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.put<ApiResponse<ApprovalRequestDto>>(HR_API.approval.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  approve(id: string, dto: ApproveStepDto): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.post<ApiResponse<ApprovalRequestDto>>(HR_API.approval.approve(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  reject(id: string, dto: RejectStepDto): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.post<ApiResponse<ApprovalRequestDto>>(HR_API.approval.reject(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delegate(id: string, dto: DelegateStepDto): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.post<ApiResponse<ApprovalRequestDto>>(HR_API.approval.delegate(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  cancel(id: string, reason?: string): Observable<ApiResponse<ApprovalRequestDto>> {
    return this.http.post<ApiResponse<ApprovalRequestDto>>(HR_API.approval.cancel(id), reason ?? null, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.approval.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
