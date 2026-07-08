import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { CandidateDto, CreateCandidateDto, UpdateCandidateDto } from '../models/candidate.model';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<CandidateDto[]>> {
    return this.http.get<ApiResponse<CandidateDto[]>>(HR_API.candidate.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<CandidateDto>> {
    return this.http.get<ApiResponse<CandidateDto>>(HR_API.candidate.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateCandidateDto): Observable<ApiResponse<CandidateDto>> {
    return this.http.post<ApiResponse<CandidateDto>>(HR_API.candidate.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateCandidateDto): Observable<ApiResponse<CandidateDto>> {
    return this.http.put<ApiResponse<CandidateDto>>(HR_API.candidate.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  blacklist(id: string, reason: string): Observable<ApiResponse<CandidateDto>> {
    return this.http.post<ApiResponse<CandidateDto>>(HR_API.candidate.blacklist(id), { reason }, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  unblacklist(id: string): Observable<ApiResponse<CandidateDto>> {
    return this.http.post<ApiResponse<CandidateDto>>(HR_API.candidate.unblacklist(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.candidate.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
