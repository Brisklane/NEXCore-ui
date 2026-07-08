import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobTitleDto, CreateJobTitleDto, UpdateJobTitleDto } from '../models/job-title.model';
import { HrLookupItemDto } from '../models/hr-lookup-item.model';

@Injectable({ providedIn: 'root' })
export class JobTitleService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<JobTitleDto[]>> {
    return this.http.get<ApiResponse<JobTitleDto[]>>(HR_API.jobTitle.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getLookup(): Observable<ApiResponse<HrLookupItemDto[]>> {
    return this.getAll().pipe(
      map(res => ({
        ...res,
        // DesignationDto uses designationName (not title)
        data: (res.data ?? []).map(d => ({ id: d.id, name: d.designationName ?? d.id, code: d.designationCode })),
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<JobTitleDto>> {
    return this.http.get<ApiResponse<JobTitleDto>>(HR_API.jobTitle.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobTitleDto): Observable<ApiResponse<JobTitleDto>> {
    return this.http.post<ApiResponse<JobTitleDto>>(HR_API.jobTitle.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobTitleDto): Observable<ApiResponse<JobTitleDto>> {
    return this.http.put<ApiResponse<JobTitleDto>>(HR_API.jobTitle.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.jobTitle.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
