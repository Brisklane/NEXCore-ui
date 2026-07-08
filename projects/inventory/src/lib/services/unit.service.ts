import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  UnitDto, CreateUnitDto, UpdateUnitDto,
  ItemUomConversionDto, CreateItemUomConversionDto, UpdateItemUomConversionDto
} from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<UnitDto>> {
    return this.http.get<PaginatedResponse<UnitDto>>(INVENTORY_API.unit.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<UnitDto>> {
    return this.http.get<ApiResponse<UnitDto>>(INVENTORY_API.unit.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<UnitDto[]>> {
    return this.http.get<ApiResponse<UnitDto[]>>(INVENTORY_API.unit.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateUnitDto): Observable<ApiResponse<UnitDto>> {
    return this.http.post<ApiResponse<UnitDto>>(INVENTORY_API.unit.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateUnitDto): Observable<ApiResponse<UnitDto>> {
    return this.http.put<ApiResponse<UnitDto>>(INVENTORY_API.unit.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.unit.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getConversionsByItem(itemId: string): Observable<ApiResponse<ItemUomConversionDto[]>> {
    return this.http.get<ApiResponse<ItemUomConversionDto[]>>(INVENTORY_API.unit.getConversionsByItem(itemId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  createConversion(itemId: string, dto: CreateItemUomConversionDto): Observable<ApiResponse<ItemUomConversionDto>> {
    return this.http.post<ApiResponse<ItemUomConversionDto>>(INVENTORY_API.unit.createConversion(itemId), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateConversion(id: string, dto: UpdateItemUomConversionDto): Observable<ApiResponse<ItemUomConversionDto>> {
    return this.http.put<ApiResponse<ItemUomConversionDto>>(INVENTORY_API.unit.updateConversion(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteConversion(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.unit.deleteConversion(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
