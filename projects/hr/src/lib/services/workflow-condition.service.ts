import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  WorkflowConditionDto, CreateWorkflowConditionDto, UpdateWorkflowConditionDto,
} from '../models/workflow-config.model';

@Injectable({ providedIn: 'root' })
export class WorkflowConditionService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<WorkflowConditionDto[]>> {
    return this.http.get<ApiResponse<WorkflowConditionDto[]>>(HR_API.workflowCondition.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByWorkflow(workflowConfigId: string): Observable<ApiResponse<WorkflowConditionDto[]>> {
    return this.http.get<ApiResponse<WorkflowConditionDto[]>>(HR_API.workflowCondition.byWorkflow(workflowConfigId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<WorkflowConditionDto>> {
    return this.http.get<ApiResponse<WorkflowConditionDto>>(HR_API.workflowCondition.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateWorkflowConditionDto): Observable<ApiResponse<WorkflowConditionDto>> {
    return this.http.post<ApiResponse<WorkflowConditionDto>>(HR_API.workflowCondition.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateWorkflowConditionDto): Observable<ApiResponse<WorkflowConditionDto>> {
    return this.http.put<ApiResponse<WorkflowConditionDto>>(HR_API.workflowCondition.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.workflowCondition.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
