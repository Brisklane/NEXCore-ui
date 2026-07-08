import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { DemandDto, CreateDemandDto, UpdateDemandDto } from '../models/demand.model';

@Injectable({ providedIn: 'root' })
export class DemandService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<DemandDto>> {
    return this.http.get<PaginatedResponse<DemandDto>>(
      MANUFACTURING_API.demand.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<DemandDto>> {
    return this.http.get<ApiResponse<DemandDto>>(MANUFACTURING_API.demand.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getOpen(): Observable<ApiResponse<DemandDto[]>> {
    return this.http.get<ApiResponse<DemandDto[]>>(MANUFACTURING_API.demand.getOpen, { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<DemandDto[]>> {
    return this.http.get<ApiResponse<DemandDto[]>>(MANUFACTURING_API.demand.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateDemandDto): Observable<ApiResponse<DemandDto>> {
    return this.http.post<ApiResponse<DemandDto>>(MANUFACTURING_API.demand.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateDemandDto): Observable<ApiResponse<DemandDto>> {
    return this.http.put<ApiResponse<DemandDto>>(MANUFACTURING_API.demand.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.demand.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
