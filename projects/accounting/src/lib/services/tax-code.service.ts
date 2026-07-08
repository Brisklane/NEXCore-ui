import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { TaxCodeDto } from '../models/tax-code.model';

@Injectable({ providedIn: 'root' })
export class TaxCodeService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<TaxCodeDto>> {
    return this.http.get<PaginatedResponse<TaxCodeDto>>(
      ACCOUNTING_API.taxCode.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getByCode(code: string): Observable<ApiResponse<TaxCodeDto>> {
    return this.http.get<ApiResponse<TaxCodeDto>>(
      ACCOUNTING_API.taxCode.getByCode(code),
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
