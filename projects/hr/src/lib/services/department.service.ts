import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto } from '../models/department.model';
import { HrLookupItemDto } from '../models/hr-lookup-item.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<DepartmentDto[]>> {
    return this.http.get<ApiResponse<DepartmentDto[]>>(HR_API.department.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getLookup(): Observable<ApiResponse<HrLookupItemDto[]>> {
    return this.getAll().pipe(
      map(res => ({
        ...res,
        data: (res.data ?? []).map(d => ({ id: d.id, name: d.departmentName ?? d.id, code: d.departmentCode })),
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<DepartmentDto>> {
    return this.http.get<ApiResponse<DepartmentDto>>(HR_API.department.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateDepartmentDto): Observable<ApiResponse<DepartmentDto>> {
    return this.http.post<ApiResponse<DepartmentDto>>(HR_API.department.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateDepartmentDto): Observable<ApiResponse<DepartmentDto>> {
    return this.http.put<ApiResponse<DepartmentDto>>(HR_API.department.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.department.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
