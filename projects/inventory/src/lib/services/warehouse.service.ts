import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto,
  BinDto, CreateBinDto, UpdateBinDto
} from '../models/warehouse.model';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<WarehouseDto>> {
    return this.http.get<PaginatedResponse<WarehouseDto>>(INVENTORY_API.warehouse.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<WarehouseDto>> {
    return this.http.get<ApiResponse<WarehouseDto>>(INVENTORY_API.warehouse.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<WarehouseDto[]>> {
    return this.http.get<ApiResponse<WarehouseDto[]>>(INVENTORY_API.warehouse.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getWithBins(id: string): Observable<ApiResponse<WarehouseDto>> {
    return this.http.get<ApiResponse<WarehouseDto>>(INVENTORY_API.warehouse.getWithBins(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateWarehouseDto): Observable<ApiResponse<WarehouseDto>> {
    return this.http.post<ApiResponse<WarehouseDto>>(INVENTORY_API.warehouse.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateWarehouseDto): Observable<ApiResponse<WarehouseDto>> {
    return this.http.put<ApiResponse<WarehouseDto>>(INVENTORY_API.warehouse.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.warehouse.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getBins(warehouseId: string): Observable<ApiResponse<BinDto[]>> {
    return this.http.get<ApiResponse<BinDto[]>>(INVENTORY_API.warehouse.getBins(warehouseId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActiveBins(warehouseId: string): Observable<ApiResponse<BinDto[]>> {
    return this.http.get<ApiResponse<BinDto[]>>(INVENTORY_API.warehouse.getActiveBins(warehouseId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  createBin(warehouseId: string, dto: CreateBinDto): Observable<ApiResponse<BinDto>> {
    return this.http.post<ApiResponse<BinDto>>(INVENTORY_API.warehouse.createBin(warehouseId), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getBinById(id: string): Observable<ApiResponse<BinDto>> {
    return this.http.get<ApiResponse<BinDto>>(INVENTORY_API.warehouse.getBinById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateBin(id: string, dto: UpdateBinDto): Observable<ApiResponse<BinDto>> {
    return this.http.put<ApiResponse<BinDto>>(INVENTORY_API.warehouse.updateBin(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  deleteBin(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.warehouse.deleteBin(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
