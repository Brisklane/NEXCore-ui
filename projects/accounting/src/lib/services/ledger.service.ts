import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { LedgerDto, CreateLedgerDto, UpdateLedgerDto } from '../models/ledger.model';

@Injectable({ providedIn: 'root' })
export class LedgerService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<LedgerDto>> {
    return this.http.get<PaginatedResponse<LedgerDto>>(ACCOUNTING_API.ledger.getAll, {
      headers: this.auth.getAuthHeaders(),
      params: this.buildParams(pagination),
    });
  }

  getById(id: string): Observable<ApiResponse<LedgerDto>> {
    return this.http.get<ApiResponse<LedgerDto>>(ACCOUNTING_API.ledger.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateLedgerDto): Observable<ApiResponse<LedgerDto>> {
    return this.http.post<ApiResponse<LedgerDto>>(ACCOUNTING_API.ledger.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateLedgerDto): Observable<ApiResponse<LedgerDto>> {
    return this.http.put<ApiResponse<LedgerDto>>(ACCOUNTING_API.ledger.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(ACCOUNTING_API.ledger.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
