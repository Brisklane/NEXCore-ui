import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { AccountCategoryDto } from '../models/account-category.model';

@Injectable({ providedIn: 'root' })
export class AccountCategoryService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<AccountCategoryDto>> {
    return this.http.get<PaginatedResponse<AccountCategoryDto>>(
      ACCOUNTING_API.accountCategory.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<AccountCategoryDto>> {
    return this.http.get<ApiResponse<AccountCategoryDto>>(
      ACCOUNTING_API.accountCategory.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
