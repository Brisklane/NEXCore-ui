import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { CostEntryDto, CreateCostEntryDto, UpdateCostEntryDto } from '../models/cost-entry.model';

@Injectable({ providedIn: 'root' })
export class CostEntryService {
  constructor(private http: HttpClient, private auth: ManufacturingAuthHelper) {}

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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<CostEntryDto>> {
    return this.http.get<PaginatedResponse<CostEntryDto>>(
      MANUFACTURING_API.costEntry.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<CostEntryDto>> {
    return this.http.get<ApiResponse<CostEntryDto>>(MANUFACTURING_API.costEntry.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<CostEntryDto>> {
    return this.http.get<ApiResponse<CostEntryDto>>(MANUFACTURING_API.costEntry.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateCostEntryDto): Observable<ApiResponse<CostEntryDto>> {
    return this.http.post<ApiResponse<CostEntryDto>>(MANUFACTURING_API.costEntry.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateCostEntryDto): Observable<ApiResponse<CostEntryDto>> {
    return this.http.put<ApiResponse<CostEntryDto>>(MANUFACTURING_API.costEntry.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.costEntry.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
