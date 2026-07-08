import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ProductionBatchDto, CreateProductionBatchDto, UpdateProductionBatchDto } from '../models/production-batch.model';

@Injectable({ providedIn: 'root' })
export class ProductionBatchService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ProductionBatchDto>> {
    return this.http.get<PaginatedResponse<ProductionBatchDto>>(
      MANUFACTURING_API.productionBatch.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<ProductionBatchDto>> {
    return this.http.get<ApiResponse<ProductionBatchDto>>(MANUFACTURING_API.productionBatch.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByNumber(batchNumber: string): Observable<ApiResponse<ProductionBatchDto>> {
    return this.http.get<ApiResponse<ProductionBatchDto>>(MANUFACTURING_API.productionBatch.getByNumber(batchNumber), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<ProductionBatchDto[]>> {
    return this.http.get<ApiResponse<ProductionBatchDto[]>>(MANUFACTURING_API.productionBatch.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<ProductionBatchDto[]>> {
    return this.http.get<ApiResponse<ProductionBatchDto[]>>(MANUFACTURING_API.productionBatch.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateProductionBatchDto): Observable<ApiResponse<ProductionBatchDto>> {
    return this.http.post<ApiResponse<ProductionBatchDto>>(MANUFACTURING_API.productionBatch.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateProductionBatchDto): Observable<ApiResponse<ProductionBatchDto>> {
    return this.http.put<ApiResponse<ProductionBatchDto>>(MANUFACTURING_API.productionBatch.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.productionBatch.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
