import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  // Returns PaginatedResponse so callers can read totalCount / totalPages
  getAll(opts?: { pageSize?: number; page?: number }): Observable<PaginatedResponse<ActivityDto>> {
    let params = new HttpParams();
    params = params.set('pageSize', String(opts?.pageSize ?? 1000));
    params = params.set('page',     String(opts?.page     ?? 1));
    return this.http.get<PaginatedResponse<ActivityDto>>(CRM_API.activities.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<ActivityDto>> {
    return this.http.get<ApiResponse<ActivityDto>>(CRM_API.activities.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateActivityDto): Observable<ApiResponse<ActivityDto>> {
    return this.http.post<ApiResponse<ActivityDto>>(CRM_API.activities.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateActivityDto): Observable<ApiResponse<ActivityDto>> {
    return this.http.put<ApiResponse<ActivityDto>>(CRM_API.activities.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.activities.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
