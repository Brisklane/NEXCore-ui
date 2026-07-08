import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { ApplicationDto, CreateApplicationDto, UpdateApplicationDto } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<ApplicationDto[]>> {
    return this.http.get<ApiResponse<ApplicationDto[]>>(HR_API.application.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<ApplicationDto>> {
    return this.http.get<ApiResponse<ApplicationDto>>(HR_API.application.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByJob(jobId: string): Observable<ApiResponse<ApplicationDto[]>> {
    return this.http.get<ApiResponse<ApplicationDto[]>>(HR_API.application.byJob(jobId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByCandidate(candidateId: string): Observable<ApiResponse<ApplicationDto[]>> {
    return this.http.get<ApiResponse<ApplicationDto[]>>(HR_API.application.byCandidate(candidateId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateApplicationDto): Observable<ApiResponse<ApplicationDto>> {
    return this.http.post<ApiResponse<ApplicationDto>>(HR_API.application.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateApplicationDto): Observable<ApiResponse<ApplicationDto>> {
    return this.http.put<ApiResponse<ApplicationDto>>(HR_API.application.update(id), { request: dto }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.application.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
