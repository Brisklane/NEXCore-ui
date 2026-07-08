import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  WorkflowEscalationDto, CreateWorkflowEscalationDto, UpdateWorkflowEscalationDto,
} from '../models/workflow-config.model';

@Injectable({ providedIn: 'root' })
export class WorkflowEscalationService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<WorkflowEscalationDto[]>> {
    return this.http.get<ApiResponse<WorkflowEscalationDto[]>>(HR_API.workflowEscalation.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByStep(stepId: string): Observable<ApiResponse<WorkflowEscalationDto[]>> {
    return this.http.get<ApiResponse<WorkflowEscalationDto[]>>(HR_API.workflowEscalation.byStep(stepId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<WorkflowEscalationDto>> {
    return this.http.get<ApiResponse<WorkflowEscalationDto>>(HR_API.workflowEscalation.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateWorkflowEscalationDto): Observable<ApiResponse<WorkflowEscalationDto>> {
    return this.http.post<ApiResponse<WorkflowEscalationDto>>(HR_API.workflowEscalation.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateWorkflowEscalationDto): Observable<ApiResponse<WorkflowEscalationDto>> {
    return this.http.put<ApiResponse<WorkflowEscalationDto>>(HR_API.workflowEscalation.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.workflowEscalation.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
