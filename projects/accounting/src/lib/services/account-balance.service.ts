import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { AccountBalanceDto } from '../models/account-balance.model';

@Injectable({ providedIn: 'root' })
export class AccountBalanceService {
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

  getByAccountAndPeriod(accountId: string, periodId: string): Observable<ApiResponse<AccountBalanceDto[]>> {
    return this.http.get<ApiResponse<AccountBalanceDto[]>>(
      ACCOUNTING_API.accountBalance.getByAccountAndPeriod(accountId, periodId),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByPeriod(periodId: string, pagination?: PaginationParams): Observable<PaginatedResponse<AccountBalanceDto>> {
    return this.http.get<PaginatedResponse<AccountBalanceDto>>(
      ACCOUNTING_API.accountBalance.getByPeriod(periodId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getByAccount(accountId: string, pagination?: PaginationParams): Observable<PaginatedResponse<AccountBalanceDto>> {
    return this.http.get<PaginatedResponse<AccountBalanceDto>>(
      ACCOUNTING_API.accountBalance.getByAccount(accountId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }
}
