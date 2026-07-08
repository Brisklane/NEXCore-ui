import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { InterviewDto, CreateInterviewDto, UpdateInterviewDto } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<InterviewDto[]>> {
    return this.http.get<ApiResponse<InterviewDto[]>>(HR_API.interview.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<InterviewDto>> {
    return this.http.get<ApiResponse<InterviewDto>>(HR_API.interview.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByApplication(applicationId: string): Observable<ApiResponse<InterviewDto[]>> {
    return this.http.get<ApiResponse<InterviewDto[]>>(HR_API.interview.byApplication(applicationId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateInterviewDto): Observable<ApiResponse<InterviewDto>> {
    return this.http.post<ApiResponse<InterviewDto>>(HR_API.interview.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateInterviewDto): Observable<ApiResponse<InterviewDto>> {
    return this.http.put<ApiResponse<InterviewDto>>(HR_API.interview.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.interview.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
