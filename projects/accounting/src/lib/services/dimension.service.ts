import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ACCOUNTING_API } from './accounting-api-config';
import { AccountingAuthHelper } from './accounting-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  DimensionDto, CreateDimensionDto, UpdateDimensionDto,
  DimensionValueDto,
} from '../models/dimension.model';

@Injectable({ providedIn: 'root' })
export class DimensionService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<DimensionDto>> {
    return this.http.get<PaginatedResponse<DimensionDto>>(
      ACCOUNTING_API.dimension.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<DimensionDto>> {
    return this.http.get<ApiResponse<DimensionDto>>(
      ACCOUNTING_API.dimension.getById(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByCode(code: string): Observable<ApiResponse<DimensionDto>> {
    return this.http.get<ApiResponse<DimensionDto>>(
      ACCOUNTING_API.dimension.getByCode(code),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  create(dto: CreateDimensionDto): Observable<ApiResponse<DimensionDto>> {
    return this.http.post<ApiResponse<DimensionDto>>(
      ACCOUNTING_API.dimension.create,
      dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  update(id: string, dto: UpdateDimensionDto): Observable<ApiResponse<DimensionDto>> {
    return this.http.put<ApiResponse<DimensionDto>>(
      ACCOUNTING_API.dimension.update(id),
      dto,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      ACCOUNTING_API.dimension.delete(id),
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getValues(dimensionId: string, pagination?: PaginationParams): Observable<PaginatedResponse<DimensionValueDto>> {
    return this.http.get<PaginatedResponse<DimensionValueDto>>(
      ACCOUNTING_API.dimension.getValues(dimensionId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }
}
