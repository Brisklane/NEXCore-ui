import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ColorDto, CreateColorDto, UpdateColorDto } from '../models/color.model';

@Injectable({ providedIn: 'root' })
export class ColorService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ColorDto>> {
    return this.http.get<PaginatedResponse<ColorDto>>(INVENTORY_API.color.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<ColorDto>> {
    return this.http.get<ApiResponse<ColorDto>>(INVENTORY_API.color.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<ColorDto[]>> {
    return this.http.get<ApiResponse<ColorDto[]>>(INVENTORY_API.color.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByFamily(family: string): Observable<ApiResponse<ColorDto[]>> {
    return this.http.get<ApiResponse<ColorDto[]>>(INVENTORY_API.color.getByFamily(family), {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateColorDto): Observable<ApiResponse<ColorDto>> {
    return this.http.post<ApiResponse<ColorDto>>(INVENTORY_API.color.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateColorDto): Observable<ApiResponse<ColorDto>> {
    return this.http.put<ApiResponse<ColorDto>>(INVENTORY_API.color.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.color.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
