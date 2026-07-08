import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { PostingProfileDto } from '../models/posting-profile.model';

@Injectable({ providedIn: 'root' })
export class PostingProfileService {
  constructor(private http: HttpClient, private auth: AccountingAuthHelper) {}

  private buildParams(pagination?: PaginationParams): HttpParams {
    let params = new HttpParams();
    if (!pagination) return params;
    if (pagination.pageNumber != null) params = params.set('PageNumber', pagination.pageNumber);
    if (pagination.pageSize != null) params = params.set('PageSize', pagination.pageSize);
    if (pagination.searchTerm) params = params.set('SearchTerm', pagination.searchTerm);
    if (pagination.sortBy) params = params.set('SortBy', pagination.sortBy);
    if (pagination.sortDirection) params = params.set('SortDirection', pagination.sortDirection);
    return params;
  }

  getByModuleAndType(moduleName: string, transactionType: string): Observable<ApiResponse<PostingProfileDto>> {
    return this.http.get<ApiResponse<PostingProfileDto>>(
      ACCOUNTING_API.postingProfile.getByModuleAndType(moduleName, transactionType),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByModule(moduleName: string, pagination?: PaginationParams): Observable<PaginatedResponse<PostingProfileDto>> {
    return this.http.get<PaginatedResponse<PostingProfileDto>>(
      ACCOUNTING_API.postingProfile.getByModule(moduleName),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }
}
