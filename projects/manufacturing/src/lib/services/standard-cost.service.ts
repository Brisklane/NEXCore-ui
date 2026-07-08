import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { StandardCostDto, CreateStandardCostDto, UpdateStandardCostDto } from '../models/standard-cost.model';

@Injectable({ providedIn: 'root' })
export class StandardCostService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<StandardCostDto>> {
    return this.http.get<PaginatedResponse<StandardCostDto>>(
      MANUFACTURING_API.standardCost.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<StandardCostDto>> {
    return this.http.get<ApiResponse<StandardCostDto>>(MANUFACTURING_API.standardCost.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<StandardCostDto[]>> {
    return this.http.get<ApiResponse<StandardCostDto[]>>(MANUFACTURING_API.standardCost.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  getActiveByProduct(productId: string): Observable<ApiResponse<StandardCostDto>> {
    return this.http.get<ApiResponse<StandardCostDto>>(MANUFACTURING_API.standardCost.getActiveByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateStandardCostDto): Observable<ApiResponse<StandardCostDto>> {
    return this.http.post<ApiResponse<StandardCostDto>>(MANUFACTURING_API.standardCost.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateStandardCostDto): Observable<ApiResponse<StandardCostDto>> {
    return this.http.put<ApiResponse<StandardCostDto>>(MANUFACTURING_API.standardCost.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.standardCost.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
