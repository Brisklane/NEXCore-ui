import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  CandidateTaskDto,
  CreateCandidateTaskDto,
  UpdateCandidateTaskDto,
} from '../models/candidate-task.model';

@Injectable({ providedIn: 'root' })
export class CandidateTaskService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<CandidateTaskDto[]>> {
    return this.http.get<ApiResponse<CandidateTaskDto[]>>(HR_API.candidateTask.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<CandidateTaskDto>> {
    return this.http.get<ApiResponse<CandidateTaskDto>>(HR_API.candidateTask.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByApplication(applicationId: string): Observable<ApiResponse<CandidateTaskDto[]>> {
    return this.http.get<ApiResponse<CandidateTaskDto[]>>(HR_API.candidateTask.byApplication(applicationId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByCandidate(candidateId: string): Observable<ApiResponse<CandidateTaskDto[]>> {
    return this.http.get<ApiResponse<CandidateTaskDto[]>>(HR_API.candidateTask.byCandidate(candidateId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateCandidateTaskDto): Observable<ApiResponse<CandidateTaskDto>> {
    return this.http.post<ApiResponse<CandidateTaskDto>>(HR_API.candidateTask.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateCandidateTaskDto): Observable<ApiResponse<CandidateTaskDto>> {
    return this.http.put<ApiResponse<CandidateTaskDto>>(HR_API.candidateTask.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.candidateTask.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
