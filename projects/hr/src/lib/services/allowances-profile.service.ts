import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { AllowancesProfileDto, CreateAllowancesProfileDto, UpdateAllowancesProfileDto } from '../models/allowances-profile.model';

@Injectable({ providedIn: 'root' })
export class AllowancesProfileService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<AllowancesProfileDto[]>> {
    return this.http.get<ApiResponse<AllowancesProfileDto[]>>(HR_API.allowancesProfile.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<AllowancesProfileDto>> {
    return this.http.get<ApiResponse<AllowancesProfileDto>>(HR_API.allowancesProfile.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateAllowancesProfileDto): Observable<ApiResponse<AllowancesProfileDto>> {
    return this.http.post<ApiResponse<AllowancesProfileDto>>(HR_API.allowancesProfile.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateAllowancesProfileDto): Observable<ApiResponse<AllowancesProfileDto>> {
    return this.http.put<ApiResponse<AllowancesProfileDto>>(HR_API.allowancesProfile.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.allowancesProfile.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
