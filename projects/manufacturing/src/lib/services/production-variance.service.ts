import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ProductionVarianceDto, CreateProductionVarianceDto, UpdateProductionVarianceDto } from '../models/production-variance.model';

@Injectable({ providedIn: 'root' })
export class ProductionVarianceService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ProductionVarianceDto>> {
    return this.http.get<PaginatedResponse<ProductionVarianceDto>>(
      MANUFACTURING_API.productionVariance.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<ProductionVarianceDto>> {
    return this.http.get<ApiResponse<ProductionVarianceDto>>(MANUFACTURING_API.productionVariance.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<ProductionVarianceDto>> {
    return this.http.get<ApiResponse<ProductionVarianceDto>>(MANUFACTURING_API.productionVariance.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateProductionVarianceDto): Observable<ApiResponse<ProductionVarianceDto>> {
    return this.http.post<ApiResponse<ProductionVarianceDto>>(MANUFACTURING_API.productionVariance.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateProductionVarianceDto): Observable<ApiResponse<ProductionVarianceDto>> {
    return this.http.put<ApiResponse<ProductionVarianceDto>>(MANUFACTURING_API.productionVariance.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.productionVariance.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
