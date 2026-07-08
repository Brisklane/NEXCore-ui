import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { CapacityLoadDto, CreateCapacityLoadDto, UpdateCapacityLoadDto } from '../models/capacity-load.model';

@Injectable({ providedIn: 'root' })
export class CapacityLoadService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<CapacityLoadDto>> {
    return this.http.get<PaginatedResponse<CapacityLoadDto>>(
      MANUFACTURING_API.capacityLoad.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<CapacityLoadDto>> {
    return this.http.get<ApiResponse<CapacityLoadDto>>(MANUFACTURING_API.capacityLoad.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByWorkCenter(workCenterId: string): Observable<ApiResponse<CapacityLoadDto[]>> {
    return this.http.get<ApiResponse<CapacityLoadDto[]>>(MANUFACTURING_API.capacityLoad.getByWorkCenter(workCenterId), { headers: this.auth.getAuthHeaders() });
  }

  getByWorkCenterDateRange(workCenterId: string, from: string, to: string): Observable<ApiResponse<CapacityLoadDto[]>> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ApiResponse<CapacityLoadDto[]>>(MANUFACTURING_API.capacityLoad.getByWorkCenterDateRange(workCenterId), { headers: this.auth.getAuthHeaders(), params });
  }

  create(dto: CreateCapacityLoadDto): Observable<ApiResponse<CapacityLoadDto>> {
    return this.http.post<ApiResponse<CapacityLoadDto>>(MANUFACTURING_API.capacityLoad.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateCapacityLoadDto): Observable<ApiResponse<CapacityLoadDto>> {
    return this.http.put<ApiResponse<CapacityLoadDto>>(MANUFACTURING_API.capacityLoad.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.capacityLoad.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
