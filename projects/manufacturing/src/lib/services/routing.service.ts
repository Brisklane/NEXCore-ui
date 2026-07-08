import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  RoutingDto, CreateRoutingDto, UpdateRoutingDto,
  RoutingOperationDto, CreateRoutingOperationDto, UpdateRoutingOperationDto,
} from '../models/routing.model';

@Injectable({ providedIn: 'root' })
export class RoutingService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<RoutingDto>> {
    return this.http.get<PaginatedResponse<RoutingDto>>(
      MANUFACTURING_API.routing.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<RoutingDto>> {
    return this.http.get<ApiResponse<RoutingDto>>(MANUFACTURING_API.routing.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<RoutingDto[]>> {
    return this.http.get<ApiResponse<RoutingDto[]>>(MANUFACTURING_API.routing.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateRoutingDto): Observable<ApiResponse<RoutingDto>> {
    return this.http.post<ApiResponse<RoutingDto>>(MANUFACTURING_API.routing.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateRoutingDto): Observable<ApiResponse<RoutingDto>> {
    return this.http.put<ApiResponse<RoutingDto>>(MANUFACTURING_API.routing.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.routing.delete(id), { headers: this.auth.getAuthHeaders() });
  }

  createOperation(routingId: string, dto: CreateRoutingOperationDto): Observable<ApiResponse<RoutingOperationDto>> {
    return this.http.post<ApiResponse<RoutingOperationDto>>(MANUFACTURING_API.routing.createOperation(routingId), dto, { headers: this.auth.getAuthHeaders() });
  }

  updateOperation(routingId: string, operationId: string, dto: UpdateRoutingOperationDto): Observable<ApiResponse<RoutingOperationDto>> {
    return this.http.put<ApiResponse<RoutingOperationDto>>(MANUFACTURING_API.routing.updateOperation(routingId, operationId), dto, { headers: this.auth.getAuthHeaders() });
  }

  deleteOperation(routingId: string, operationId: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.routing.deleteOperation(routingId, operationId), { headers: this.auth.getAuthHeaders() });
  }
}
