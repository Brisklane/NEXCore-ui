import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  BillOfMaterialDto, CreateBillOfMaterialDto, UpdateBillOfMaterialDto,
  BOMItemDto, CreateBOMItemDto, UpdateBOMItemDto,
  BOMByProductDto, CreateBOMByProductDto, UpdateBOMByProductDto,
} from '../models/bill-of-material.model';

@Injectable({ providedIn: 'root' })
export class BomService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<BillOfMaterialDto>> {
    return this.http.get<PaginatedResponse<BillOfMaterialDto>>(
      MANUFACTURING_API.bom.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<BillOfMaterialDto>> {
    return this.http.get<ApiResponse<BillOfMaterialDto>>(MANUFACTURING_API.bom.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string, pagination?: PaginationParams): Observable<PaginatedResponse<BillOfMaterialDto>> {
    return this.http.get<PaginatedResponse<BillOfMaterialDto>>(
      MANUFACTURING_API.bom.getByProduct(productId),
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  create(dto: CreateBillOfMaterialDto): Observable<ApiResponse<BillOfMaterialDto>> {
    return this.http.post<ApiResponse<BillOfMaterialDto>>(MANUFACTURING_API.bom.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateBillOfMaterialDto): Observable<ApiResponse<BillOfMaterialDto>> {
    return this.http.put<ApiResponse<BillOfMaterialDto>>(MANUFACTURING_API.bom.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.bom.delete(id), { headers: this.auth.getAuthHeaders() });
  }

  createItem(bomId: string, dto: CreateBOMItemDto): Observable<ApiResponse<BOMItemDto>> {
    return this.http.post<ApiResponse<BOMItemDto>>(MANUFACTURING_API.bom.createItem(bomId), dto, { headers: this.auth.getAuthHeaders() });
  }

  updateItem(bomId: string, itemId: string, dto: UpdateBOMItemDto): Observable<ApiResponse<BOMItemDto>> {
    return this.http.put<ApiResponse<BOMItemDto>>(MANUFACTURING_API.bom.updateItem(bomId, itemId), dto, { headers: this.auth.getAuthHeaders() });
  }

  deleteItem(bomId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.bom.deleteItem(bomId, itemId), { headers: this.auth.getAuthHeaders() });
  }

  createByProduct(bomId: string, dto: CreateBOMByProductDto): Observable<ApiResponse<BOMByProductDto>> {
    return this.http.post<ApiResponse<BOMByProductDto>>(MANUFACTURING_API.bom.createByProduct(bomId), dto, { headers: this.auth.getAuthHeaders() });
  }

  updateByProduct(bomId: string, byProductId: string, dto: UpdateBOMByProductDto): Observable<ApiResponse<BOMByProductDto>> {
    return this.http.put<ApiResponse<BOMByProductDto>>(MANUFACTURING_API.bom.updateByProduct(bomId, byProductId), dto, { headers: this.auth.getAuthHeaders() });
  }

  deleteByProduct(bomId: string, byProductId: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.bom.deleteByProduct(bomId, byProductId), { headers: this.auth.getAuthHeaders() });
  }
}
