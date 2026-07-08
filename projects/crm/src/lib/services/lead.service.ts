import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { LeadDto, CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<LeadDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<LeadDto>>(CRM_API.leads.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<LeadDto>> {
    return this.http.get<ApiResponse<LeadDto>>(CRM_API.leads.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateLeadDto): Observable<ApiResponse<LeadDto>> {
    return this.http.post<ApiResponse<LeadDto>>(CRM_API.leads.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateLeadDto): Observable<ApiResponse<LeadDto>> {
    return this.http.put<ApiResponse<LeadDto>>(CRM_API.leads.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.leads.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  convert(id: string, dto: ConvertLeadDto): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(CRM_API.leads.convert(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
