import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { SalaryStructureDto, CreateSalaryStructureDto, UpdateSalaryStructureDto } from '../models/salary-structure.model';

@Injectable({ providedIn: 'root' })
export class SalaryStructureService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<SalaryStructureDto[]>> {
    return this.http.get<ApiResponse<SalaryStructureDto[]>>(HR_API.salaryStructure.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<SalaryStructureDto>> {
    return this.http.get<ApiResponse<SalaryStructureDto>>(HR_API.salaryStructure.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEmployee(employeeId: string): Observable<ApiResponse<SalaryStructureDto[]>> {
    return this.http.get<ApiResponse<SalaryStructureDto[]>>(HR_API.salaryStructure.byEmployee(employeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateSalaryStructureDto): Observable<ApiResponse<SalaryStructureDto>> {
    return this.http.post<ApiResponse<SalaryStructureDto>>(HR_API.salaryStructure.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateSalaryStructureDto): Observable<ApiResponse<SalaryStructureDto>> {
    return this.http.put<ApiResponse<SalaryStructureDto>>(HR_API.salaryStructure.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.salaryStructure.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
