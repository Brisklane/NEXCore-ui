import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { PayrollRunDto, CreatePayrollRunDto, UpdatePayrollRunDto } from '../models/payroll-run.model';

@Injectable({ providedIn: 'root' })
export class PayrollRunService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<PayrollRunDto[]>> {
    return this.http.get<ApiResponse<PayrollRunDto[]>>(HR_API.payrollRun.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<PayrollRunDto>> {
    return this.http.get<ApiResponse<PayrollRunDto>>(HR_API.payrollRun.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreatePayrollRunDto): Observable<ApiResponse<PayrollRunDto>> {
    return this.http.post<ApiResponse<PayrollRunDto>>(HR_API.payrollRun.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdatePayrollRunDto): Observable<ApiResponse<PayrollRunDto>> {
    return this.http.put<ApiResponse<PayrollRunDto>>(HR_API.payrollRun.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  process(id: string): Observable<ApiResponse<PayrollRunDto>> {
    return this.http.post<ApiResponse<PayrollRunDto>>(HR_API.payrollRun.process(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.payrollRun.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
