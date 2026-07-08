import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { SizeDto, CreateSizeDto, UpdateSizeDto } from '../models/size.model';

@Injectable({ providedIn: 'root' })
export class SizeService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  private buildParams(pagination?: PaginationParams): HttpParams {
    let params = new HttpParams();
    if (!pagination) return params;
    if (pagination.pageNumber != null) params = params.set('PageNumber', pagination.pageNumber);
    if (pagination.pageSize != null) params = params.set('PageSize', pagination.pageSize);
    if (pagination.searchTerm) params = params.set('SearchTerm', pagination.searchTerm);
    if (pagination.sortBy) params = params.set('SortBy', pagination.sortBy);
    if (pagination.sortDirection) params = params.set('SortDirection', pagination.sortDirection);
    if (pagination.isActive != null) params = params.set('IsActive', pagination.isActive);
    return params;
  }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<SizeDto>> {
    return this.http.get<PaginatedResponse<SizeDto>>(INVENTORY_API.size.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<SizeDto>> {
    return this.http.get<ApiResponse<SizeDto>>(INVENTORY_API.size.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByChart(sizeChart: string): Observable<ApiResponse<SizeDto[]>> {
    return this.http.get<ApiResponse<SizeDto[]>>(INVENTORY_API.size.getByChart(sizeChart), {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateSizeDto): Observable<ApiResponse<SizeDto>> {
    return this.http.post<ApiResponse<SizeDto>>(INVENTORY_API.size.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateSizeDto): Observable<ApiResponse<SizeDto>> {
    return this.http.put<ApiResponse<SizeDto>>(INVENTORY_API.size.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.size.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
