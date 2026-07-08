import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { DeductionDto, CreateDeductionDto, UpdateDeductionDto } from '../models/deduction.model';

@Injectable({ providedIn: 'root' })
export class DeductionService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<DeductionDto[]>> {
    return this.http.get<ApiResponse<DeductionDto[]>>(HR_API.deduction.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<DeductionDto>> {
    return this.http.get<ApiResponse<DeductionDto>>(HR_API.deduction.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateDeductionDto): Observable<ApiResponse<DeductionDto>> {
    return this.http.post<ApiResponse<DeductionDto>>(HR_API.deduction.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateDeductionDto): Observable<ApiResponse<DeductionDto>> {
    return this.http.put<ApiResponse<DeductionDto>>(HR_API.deduction.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.deduction.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
