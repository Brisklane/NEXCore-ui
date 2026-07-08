import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  PipelineDto, CreatePipelineDto, UpdatePipelineDto,
  PipelineStageDto, CreatePipelineStageDto, UpdatePipelineStageDto,
} from '../models/pipeline.model';

@Injectable({ providedIn: 'root' })
export class PipelineService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<PipelineDto[]>> {
    return this.http.get<ApiResponse<PipelineDto[]>>(CRM_API.pipelines.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<PipelineDto>> {
    return this.http.get<ApiResponse<PipelineDto>>(CRM_API.pipelines.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreatePipelineDto): Observable<ApiResponse<PipelineDto>> {
    return this.http.post<ApiResponse<PipelineDto>>(CRM_API.pipelines.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdatePipelineDto): Observable<ApiResponse<PipelineDto>> {
    return this.http.put<ApiResponse<PipelineDto>>(CRM_API.pipelines.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.pipelines.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getStages(id: string): Observable<ApiResponse<PipelineStageDto[]>> {
    return this.http.get<ApiResponse<PipelineStageDto[]>>(CRM_API.pipelines.getStages(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addStage(id: string, dto: CreatePipelineStageDto): Observable<ApiResponse<PipelineStageDto>> {
    return this.http.post<ApiResponse<PipelineStageDto>>(CRM_API.pipelines.addStage(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateStage(id: string, stageId: string, dto: UpdatePipelineStageDto): Observable<ApiResponse<PipelineStageDto>> {
    return this.http.put<ApiResponse<PipelineStageDto>>(CRM_API.pipelines.updateStage(id, stageId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteStage(id: string, stageId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.pipelines.deleteStage(id, stageId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
