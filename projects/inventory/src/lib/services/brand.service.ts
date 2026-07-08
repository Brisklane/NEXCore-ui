import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { BrandDto, CreateBrandDto, UpdateBrandDto } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<BrandDto>> {
    return this.http.get<PaginatedResponse<BrandDto>>(INVENTORY_API.brand.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<BrandDto>> {
    return this.http.get<ApiResponse<BrandDto>>(INVENTORY_API.brand.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<BrandDto[]>> {
    return this.http.get<ApiResponse<BrandDto[]>>(INVENTORY_API.brand.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateBrandDto): Observable<ApiResponse<BrandDto>> {
    return this.http.post<ApiResponse<BrandDto>>(INVENTORY_API.brand.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateBrandDto): Observable<ApiResponse<BrandDto>> {
    return this.http.put<ApiResponse<BrandDto>>(INVENTORY_API.brand.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(INVENTORY_API.brand.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
