import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { JobRequisitionDto, CreateJobRequisitionDto, UpdateJobRequisitionDto } from '../models/job-requisition.model';
import { JobRecordType } from '../models/hr-enums';

@Injectable({ providedIn: 'root' })
export class JobRequisitionService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(recordType?: JobRecordType): Observable<ApiResponse<JobRequisitionDto[]>> {
    const rawHeaders = this.auth.getAuthHeaders();
    const headers = new HttpHeaders(rawHeaders as Record<string, string>);
    const params: Record<string, string | number> = {};
    if (recordType !== undefined) {
      params['recordType'] = recordType;
    }
    return this.http.get<ApiResponse<JobRequisitionDto[]>>(HR_API.jobRequisition.getAll, {
      headers,
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<JobRequisitionDto>> {
    const rawHeaders = this.auth.getAuthHeaders();
    const headers = new HttpHeaders(rawHeaders as Record<string, string>);
    return this.http.get<ApiResponse<JobRequisitionDto>>(HR_API.jobRequisition.getById(id), {
      headers,
    });
  }

  getByDepartment(departmentId: string): Observable<ApiResponse<JobRequisitionDto[]>> {
    const rawHeaders = this.auth.getAuthHeaders();
    const headers = new HttpHeaders(rawHeaders as Record<string, string>);
    return this.http.get<ApiResponse<JobRequisitionDto[]>>(HR_API.jobRequisition.byDepartment(departmentId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateJobRequisitionDto): Observable<ApiResponse<JobRequisitionDto>> {
    return this.http.post<ApiResponse<JobRequisitionDto>>(HR_API.jobRequisition.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateJobRequisitionDto): Observable<ApiResponse<JobRequisitionDto>> {
    return this.http.put<ApiResponse<JobRequisitionDto>>(HR_API.jobRequisition.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  approve(id: string): Observable<ApiResponse<JobRequisitionDto>> {
    return this.http.post<ApiResponse<JobRequisitionDto>>(HR_API.jobRequisition.approve(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  reject(id: string): Observable<ApiResponse<JobRequisitionDto>> {
    return this.http.post<ApiResponse<JobRequisitionDto>>(HR_API.jobRequisition.reject(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.jobRequisition.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
