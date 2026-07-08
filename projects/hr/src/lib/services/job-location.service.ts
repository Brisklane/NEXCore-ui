import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobLocationDto, CreateJobLocationDto, UpdateJobLocationDto } from '../models/job-location.model';

@Injectable({ providedIn: 'root' })
export class JobLocationService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<JobLocationDto[]>> {
    return this.http.get<ApiResponse<JobLocationDto[]>>(HR_API.jobLocation.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<JobLocationDto>> {
    return this.http.get<ApiResponse<JobLocationDto>>(HR_API.jobLocation.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobLocationDto): Observable<ApiResponse<JobLocationDto>> {
    return this.http.post<ApiResponse<JobLocationDto>>(HR_API.jobLocation.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobLocationDto): Observable<ApiResponse<JobLocationDto>> {
    return this.http.put<ApiResponse<JobLocationDto>>(HR_API.jobLocation.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.jobLocation.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
