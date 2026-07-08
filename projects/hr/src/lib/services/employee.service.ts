import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<EmployeeDto[]>> {
    return this.http.get<ApiResponse<EmployeeDto[]>>(HR_API.employee.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<EmployeeDto>> {
    return this.http.get<ApiResponse<EmployeeDto>>(HR_API.employee.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByDepartment(departmentId: string): Observable<ApiResponse<EmployeeDto[]>> {
    return this.http.get<ApiResponse<EmployeeDto[]>>(HR_API.employee.byDepartment(departmentId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByDesignation(designationId: string): Observable<ApiResponse<EmployeeDto[]>> {
    return this.http.get<ApiResponse<EmployeeDto[]>>(HR_API.employee.byDesignation(designationId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateEmployeeDto): Observable<ApiResponse<EmployeeDto>> {
    return this.http.post<ApiResponse<EmployeeDto>>(HR_API.employee.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateEmployeeDto): Observable<ApiResponse<EmployeeDto>> {
    return this.http.put<ApiResponse<EmployeeDto>>(HR_API.employee.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.employee.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
