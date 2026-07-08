import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { SubContractOrderDto, CreateSubContractOrderDto, UpdateSubContractOrderDto } from '../models/subcontract-order.model';

@Injectable({ providedIn: 'root' })
export class SubContractOrderService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<SubContractOrderDto>> {
    return this.http.get<PaginatedResponse<SubContractOrderDto>>(
      MANUFACTURING_API.subContractOrder.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<SubContractOrderDto>> {
    return this.http.get<ApiResponse<SubContractOrderDto>>(MANUFACTURING_API.subContractOrder.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<SubContractOrderDto[]>> {
    return this.http.get<ApiResponse<SubContractOrderDto[]>>(MANUFACTURING_API.subContractOrder.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateSubContractOrderDto): Observable<ApiResponse<SubContractOrderDto>> {
    return this.http.post<ApiResponse<SubContractOrderDto>>(MANUFACTURING_API.subContractOrder.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateSubContractOrderDto): Observable<ApiResponse<SubContractOrderDto>> {
    return this.http.put<ApiResponse<SubContractOrderDto>>(MANUFACTURING_API.subContractOrder.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.subContractOrder.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
