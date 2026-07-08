import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  CampaignDto, CreateCampaignDto, UpdateCampaignDto,
  CampaignMemberDto, CreateCampaignMemberDto,
} from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<CampaignDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<CampaignDto>>(CRM_API.campaigns.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<CampaignDto>> {
    return this.http.get<ApiResponse<CampaignDto>>(CRM_API.campaigns.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateCampaignDto): Observable<ApiResponse<CampaignDto>> {
    return this.http.post<ApiResponse<CampaignDto>>(CRM_API.campaigns.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateCampaignDto): Observable<ApiResponse<CampaignDto>> {
    return this.http.put<ApiResponse<CampaignDto>>(CRM_API.campaigns.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.campaigns.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getMembers(id: string): Observable<ApiResponse<CampaignMemberDto[]>> {
    return this.http.get<ApiResponse<CampaignMemberDto[]>>(CRM_API.campaigns.getMembers(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addMember(id: string, dto: CreateCampaignMemberDto): Observable<ApiResponse<CampaignMemberDto>> {
    return this.http.post<ApiResponse<CampaignMemberDto>>(CRM_API.campaigns.addMember(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  removeMember(id: string, memberId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.campaigns.removeMember(id, memberId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
