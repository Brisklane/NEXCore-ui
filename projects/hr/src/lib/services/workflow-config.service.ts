import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  WorkflowConfigDto, CreateWorkflowConfigDto, UpdateWorkflowConfigDto,
  WorkflowConfigStepDto, CreateWorkflowConfigStepDto, UpdateWorkflowConfigStepDto,
} from '../models/workflow-config.model';

@Injectable({ providedIn: 'root' })
export class WorkflowConfigService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  // WorkflowConfig CRUD
  getAll(): Observable<ApiResponse<WorkflowConfigDto[]>> {
    return this.http.get<ApiResponse<WorkflowConfigDto[]>>(HR_API.workflowConfig.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<WorkflowConfigDto>> {
    return this.http.get<ApiResponse<WorkflowConfigDto>>(HR_API.workflowConfig.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateWorkflowConfigDto): Observable<ApiResponse<WorkflowConfigDto>> {
    return this.http.post<ApiResponse<WorkflowConfigDto>>(HR_API.workflowConfig.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateWorkflowConfigDto): Observable<ApiResponse<WorkflowConfigDto>> {
    return this.http.put<ApiResponse<WorkflowConfigDto>>(HR_API.workflowConfig.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.workflowConfig.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  // WorkflowConfigStep CRUD
  getAllSteps(): Observable<ApiResponse<WorkflowConfigStepDto[]>> {
    return this.http.get<ApiResponse<WorkflowConfigStepDto[]>>(HR_API.workflowConfigStep.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getStepsByWorkflow(workflowConfigId: string): Observable<ApiResponse<WorkflowConfigStepDto[]>> {
    return this.http.get<ApiResponse<WorkflowConfigStepDto[]>>(HR_API.workflowConfigStep.byWorkflow(workflowConfigId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getStepById(id: string): Observable<ApiResponse<WorkflowConfigStepDto>> {
    return this.http.get<ApiResponse<WorkflowConfigStepDto>>(HR_API.workflowConfigStep.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  createStep(dto: CreateWorkflowConfigStepDto): Observable<ApiResponse<WorkflowConfigStepDto>> {
    return this.http.post<ApiResponse<WorkflowConfigStepDto>>(HR_API.workflowConfigStep.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateStep(id: string, dto: UpdateWorkflowConfigStepDto): Observable<ApiResponse<WorkflowConfigStepDto>> {
    return this.http.put<ApiResponse<WorkflowConfigStepDto>>(HR_API.workflowConfigStep.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteStep(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.workflowConfigStep.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
