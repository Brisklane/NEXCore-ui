import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  FiscalCalendarDto, CreateFiscalCalendarDto, UpdateFiscalCalendarDto,
  FiscalPeriodDto, CreateFiscalPeriodDto, UpdateFiscalPeriodDto,
} from '../models/fiscal-calendar.model';

@Injectable({ providedIn: 'root' })
export class FiscalCalendarService {
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

  // --- Calendar ---
  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<FiscalCalendarDto>> {
    return this.http.get<PaginatedResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<FiscalCalendarDto>> {
    return this.http.get<ApiResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getPeriods(calendarId: string, pagination?: PaginationParams): Observable<PaginatedResponse<FiscalPeriodDto>> {
    return this.http.get<PaginatedResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalCalendar.getPeriods(calendarId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  createCalendar(dto: CreateFiscalCalendarDto): Observable<ApiResponse<FiscalCalendarDto>> {
    return this.http.post<ApiResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.create, dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updateCalendar(id: string, dto: UpdateFiscalCalendarDto): Observable<ApiResponse<FiscalCalendarDto>> {
    return this.http.put<ApiResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.update(id), dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteCalendar(id: string): Observable<void> {
    return this.http.delete<void>(
      ACCOUNTING_API.fiscalCalendar.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  closeCalendar(id: string): Observable<ApiResponse<FiscalCalendarDto>> {
    return this.http.post<ApiResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.close(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  reopenCalendar(id: string): Observable<ApiResponse<FiscalCalendarDto>> {
    return this.http.post<ApiResponse<FiscalCalendarDto>>(
      ACCOUNTING_API.fiscalCalendar.reopen(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

  // --- FiscalPeriod (separate controller) ---
  getAllPeriods(pagination?: PaginationParams): Observable<PaginatedResponse<FiscalPeriodDto>> {
    return this.http.get<PaginatedResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getPeriodById(id: string): Observable<ApiResponse<FiscalPeriodDto>> {
    return this.http.get<ApiResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getPeriodsByCalendar(calendarId: string, pagination?: PaginationParams): Observable<PaginatedResponse<FiscalPeriodDto>> {
    return this.http.get<PaginatedResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.getByCalendar(calendarId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  createPeriod(dto: CreateFiscalPeriodDto): Observable<ApiResponse<FiscalPeriodDto>> {
    return this.http.post<ApiResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.create, dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  updatePeriod(id: string, dto: UpdateFiscalPeriodDto): Observable<ApiResponse<FiscalPeriodDto>> {
    return this.http.put<ApiResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.update(id), dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deletePeriod(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      ACCOUNTING_API.fiscalPeriod.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  closePeriod(id: string): Observable<ApiResponse<FiscalPeriodDto>> {
    return this.http.post<ApiResponse<FiscalPeriodDto>>(
      ACCOUNTING_API.fiscalPeriod.close(id), {},
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
