import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { CrmLookupsDto, CrmLookupItemDto } from '../models/crm-lookup.model';

@Injectable({ providedIn: 'root' })
export class CrmLookupService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(): Observable<ApiResponse<CrmLookupsDto>> {
    return this.http.get<ApiResponse<CrmLookupsDto>>(CRM_API.crmLookup.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getAccountTypes(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getAccountTypes, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getDealStages(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getDealStages, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getForecastCategories(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getForecastCategories, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getCaseStatuses(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getCaseStatuses, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getCaseOrigins(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getCaseOrigins, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getCasePriorities(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getCasePriorities, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getLeadStatuses(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getLeadStatuses, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getSalutations(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getSalutations, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getLeadSources(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getLeadSources, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getIndustries(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getIndustries, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getCountries(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getCountries, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getStatesProvinces(): Observable<ApiResponse<CrmLookupItemDto[]>> {
    return this.http.get<ApiResponse<CrmLookupItemDto[]>>(CRM_API.crmLookup.getStatesProvinces, {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
