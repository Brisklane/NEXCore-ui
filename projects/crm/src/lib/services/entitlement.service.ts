import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { EntitlementDto, CreateEntitlementDto, UpdateEntitlementDto } from '../models/entitlement.model';

@Injectable({ providedIn: 'root' })
export class EntitlementService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<EntitlementDto[]>> {
    return this.http.get<ApiResponse<EntitlementDto[]>>(CRM_API.entitlements.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<EntitlementDto>> {
    return this.http.get<ApiResponse<EntitlementDto>>(CRM_API.entitlements.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateEntitlementDto): Observable<ApiResponse<EntitlementDto>> {
    return this.http.post<ApiResponse<EntitlementDto>>(CRM_API.entitlements.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateEntitlementDto): Observable<ApiResponse<EntitlementDto>> {
    return this.http.put<ApiResponse<EntitlementDto>>(CRM_API.entitlements.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.entitlements.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
