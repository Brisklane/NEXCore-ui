import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobTemplateDto, CreateJobTemplateDto, UpdateJobTemplateDto } from '../models/job-template.model';

@Injectable({ providedIn: 'root' })
export class JobTemplateService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<JobTemplateDto[]>> {
    return this.http.get<ApiResponse<JobTemplateDto[]>>(HR_API.jobTemplate.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<JobTemplateDto>> {
    return this.http.get<ApiResponse<JobTemplateDto>>(HR_API.jobTemplate.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobTemplateDto): Observable<ApiResponse<JobTemplateDto>> {
    return this.http.post<ApiResponse<JobTemplateDto>>(HR_API.jobTemplate.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobTemplateDto): Observable<ApiResponse<JobTemplateDto>> {
    return this.http.put<ApiResponse<JobTemplateDto>>(HR_API.jobTemplate.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.jobTemplate.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
