import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { EmployeeContractDto, CreateEmployeeContractDto, UpdateEmployeeContractDto } from '../models/employee-contract.model';

@Injectable({ providedIn: 'root' })
export class EmployeeContractService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<EmployeeContractDto[]>> {
    return this.http.get<ApiResponse<EmployeeContractDto[]>>(HR_API.employeeContract.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<EmployeeContractDto>> {
    return this.http.get<ApiResponse<EmployeeContractDto>>(HR_API.employeeContract.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByEmployee(employeeId: string): Observable<ApiResponse<EmployeeContractDto[]>> {
    return this.http.get<ApiResponse<EmployeeContractDto[]>>(HR_API.employeeContract.byEmployee(employeeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateEmployeeContractDto): Observable<ApiResponse<EmployeeContractDto>> {
    return this.http.post<ApiResponse<EmployeeContractDto>>(HR_API.employeeContract.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateEmployeeContractDto): Observable<ApiResponse<EmployeeContractDto>> {
    return this.http.put<ApiResponse<EmployeeContractDto>>(HR_API.employeeContract.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.employeeContract.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
