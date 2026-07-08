import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { PlannedOrderDto, CreatePlannedOrderDto, UpdatePlannedOrderDto } from '../models/planned-order.model';

@Injectable({ providedIn: 'root' })
export class PlannedOrderService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PlannedOrderDto>> {
    return this.http.get<PaginatedResponse<PlannedOrderDto>>(
      MANUFACTURING_API.plannedOrder.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<PlannedOrderDto>> {
    return this.http.get<ApiResponse<PlannedOrderDto>>(MANUFACTURING_API.plannedOrder.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<PlannedOrderDto[]>> {
    return this.http.get<ApiResponse<PlannedOrderDto[]>>(MANUFACTURING_API.plannedOrder.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreatePlannedOrderDto): Observable<ApiResponse<PlannedOrderDto>> {
    return this.http.post<ApiResponse<PlannedOrderDto>>(MANUFACTURING_API.plannedOrder.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdatePlannedOrderDto): Observable<ApiResponse<PlannedOrderDto>> {
    return this.http.put<ApiResponse<PlannedOrderDto>>(MANUFACTURING_API.plannedOrder.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.plannedOrder.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
