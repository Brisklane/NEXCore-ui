import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  ProductionOrderDto, CreateProductionOrderDto, UpdateProductionOrderDto,
  ProductionOrderOperationDto, CreateProductionOrderOperationDto, UpdateProductionOrderOperationDto,
  ProductionOrderComponentDto, CreateProductionOrderComponentDto, UpdateProductionOrderComponentDto,
} from '../models/production-order.model';

@Injectable({ providedIn: 'root' })
export class ProductionOrderService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ProductionOrderDto>> {
    return this.http.get<PaginatedResponse<ProductionOrderDto>>(
      MANUFACTURING_API.productionOrder.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<ProductionOrderDto>> {
    return this.http.get<ApiResponse<ProductionOrderDto>>(MANUFACTURING_API.productionOrder.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<ProductionOrderDto[]>> {
    return this.http.get<ApiResponse<ProductionOrderDto[]>>(MANUFACTURING_API.productionOrder.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  getByStatus(status: string): Observable<ApiResponse<ProductionOrderDto[]>> {
    return this.http.get<ApiResponse<ProductionOrderDto[]>>(MANUFACTURING_API.productionOrder.getByStatus(status), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateProductionOrderDto): Observable<ApiResponse<ProductionOrderDto>> {
    return this.http.post<ApiResponse<ProductionOrderDto>>(MANUFACTURING_API.productionOrder.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  /**
   * Produce a BOM-backed item in one step (POS "Produce" action): the backend creates a Completed
   * production order, backflushes the BOM components from inventory and receives the finished goods.
   */
  produceExpress(dto: { productId: string; quantity: number; warehouseId?: string | null }): Observable<ApiResponse<ProductionOrderDto>> {
    return this.http.post<ApiResponse<ProductionOrderDto>>(MANUFACTURING_API.productionOrder.produceExpress, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateProductionOrderDto): Observable<ApiResponse<ProductionOrderDto>> {
    return this.http.put<ApiResponse<ProductionOrderDto>>(MANUFACTURING_API.productionOrder.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.productionOrder.delete(id), { headers: this.auth.getAuthHeaders() });
  }

  getOperations(id: string): Observable<ApiResponse<ProductionOrderOperationDto[]>> {
    return this.http.get<ApiResponse<ProductionOrderOperationDto[]>>(MANUFACTURING_API.productionOrder.getOperations(id), { headers: this.auth.getAuthHeaders() });
  }

  createOperation(dto: CreateProductionOrderOperationDto): Observable<ApiResponse<ProductionOrderOperationDto>> {
    return this.http.post<ApiResponse<ProductionOrderOperationDto>>(MANUFACTURING_API.productionOrder.createOperation, dto, { headers: this.auth.getAuthHeaders() });
  }

  updateOperation(operationId: string, dto: UpdateProductionOrderOperationDto): Observable<ApiResponse<ProductionOrderOperationDto>> {
    return this.http.put<ApiResponse<ProductionOrderOperationDto>>(MANUFACTURING_API.productionOrder.updateOperation(operationId), dto, { headers: this.auth.getAuthHeaders() });
  }

  getComponents(id: string): Observable<ApiResponse<ProductionOrderComponentDto[]>> {
    return this.http.get<ApiResponse<ProductionOrderComponentDto[]>>(MANUFACTURING_API.productionOrder.getComponents(id), { headers: this.auth.getAuthHeaders() });
  }

  createComponent(dto: CreateProductionOrderComponentDto): Observable<ApiResponse<ProductionOrderComponentDto>> {
    return this.http.post<ApiResponse<ProductionOrderComponentDto>>(MANUFACTURING_API.productionOrder.createComponent, dto, { headers: this.auth.getAuthHeaders() });
  }

  updateComponent(componentId: string, dto: UpdateProductionOrderComponentDto): Observable<ApiResponse<ProductionOrderComponentDto>> {
    return this.http.put<ApiResponse<ProductionOrderComponentDto>>(MANUFACTURING_API.productionOrder.updateComponent(componentId), dto, { headers: this.auth.getAuthHeaders() });
  }
}
