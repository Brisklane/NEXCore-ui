import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { CreateLedgerAccountDto, LedgerAccountDto, UpdateLedgerAccountDto } from '../models/ledger-account.model';

@Injectable({ providedIn: 'root' })
export class LedgerAccountService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<LedgerAccountDto>> {
    return this.http.get<PaginatedResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.create,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getChartOfAccounts(ledgerId: string, pagination?: PaginationParams): Observable<PaginatedResponse<LedgerAccountDto>> {
    return this.http.get<PaginatedResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.chartOfAccounts(ledgerId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.get<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByLedger(ledgerId: string, pagination?: PaginationParams): Observable<PaginatedResponse<LedgerAccountDto>> {
    return this.http.get<PaginatedResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.getByLedger(ledgerId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getSubledger(ledgerId: string, masterAccountId: string, pagination?: PaginationParams): Observable<PaginatedResponse<LedgerAccountDto>> {
    return this.http.get<PaginatedResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.getSubledger(ledgerId, masterAccountId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getByNumber(ledgerId: string, accountNumber: string): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.get<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.getByNumber(ledgerId, accountNumber),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByCategory(ledgerId: string, categoryId: string, pagination?: PaginationParams): Observable<PaginatedResponse<LedgerAccountDto>> {
    return this.http.get<PaginatedResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.getByCategory(ledgerId, categoryId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  create(dto: CreateLedgerAccountDto): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.post<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.create, dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  update(id: string, dto: UpdateLedgerAccountDto): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.put<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.update(id), dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      ACCOUNTING_API.ledgerAccount.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  activate(id: string): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.post<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.activate(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deactivate(id: string): Observable<ApiResponse<LedgerAccountDto>> {
    return this.http.post<ApiResponse<LedgerAccountDto>>(
      ACCOUNTING_API.ledgerAccount.deactivate(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
