import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  JournalEntryDto,
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
} from '../models/journal-entry.model';

@Injectable({ providedIn: 'root' })
export class JournalEntryService {
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

  create(dto: CreateJournalEntryDto): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.post<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.create, dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getById(id: string): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.get<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  update(id: string, dto: UpdateJournalEntryDto): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.put<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.update(id), dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      ACCOUNTING_API.journalEntry.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByLedger(ledgerId: string, pagination?: PaginationParams): Observable<PaginatedResponse<JournalEntryDto>> {
    return this.http.get<PaginatedResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.getByLedger(ledgerId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getByDateRange(fromDate: string, toDate: string, pagination?: PaginationParams): Observable<PaginatedResponse<JournalEntryDto>> {
    let params = this.buildParams(pagination).set('fromDate', fromDate).set('toDate', toDate);
    return this.http.get<PaginatedResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.getByDateRange,
      { headers: this.auth.getAuthHeaders(), params }
    );
  }

  getByStatus(status: number, pagination?: PaginationParams): Observable<PaginatedResponse<JournalEntryDto>> {
    return this.http.get<PaginatedResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.getByStatus(status),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  submit(id: string): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.post<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.submit(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  post(id: string): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.post<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.post(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  reverse(id: string): Observable<ApiResponse<JournalEntryDto>> {
    return this.http.post<ApiResponse<JournalEntryDto>>(
      ACCOUNTING_API.journalEntry.reverse(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
