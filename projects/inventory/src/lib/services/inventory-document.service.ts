import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  InventoryDocumentDto,
  CreateInventoryDocumentDto,
  PostInventoryDocumentDto,
  QuickAdjustDto
} from '../models/inventory-document.model';

@Injectable({ providedIn: 'root' })
export class InventoryDocumentService {
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

  getAll(pagination?: PaginationParams, documentType?: string, status?: string): Observable<PaginatedResponse<InventoryDocumentDto>> {
    let params = this.buildParams(pagination);
    if (documentType) params = params.set('documentType', documentType);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.getAll, {
      headers: this.auth.getAuthHeaders(), params
    });
  }

  getById(id: string): Observable<ApiResponse<InventoryDocumentDto>> {
    return this.http.get<ApiResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByNumber(documentNumber: string): Observable<ApiResponse<InventoryDocumentDto>> {
    return this.http.get<ApiResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.getByNumber(documentNumber), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByStatus(status: string): Observable<ApiResponse<InventoryDocumentDto[]>> {
    return this.http.get<ApiResponse<InventoryDocumentDto[]>>(INVENTORY_API.inventoryDocument.getByStatus(status), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByType(documentType: string): Observable<ApiResponse<InventoryDocumentDto[]>> {
    return this.http.get<ApiResponse<InventoryDocumentDto[]>>(INVENTORY_API.inventoryDocument.getByType(documentType), {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateInventoryDocumentDto): Observable<ApiResponse<InventoryDocumentDto>> {
    return this.http.post<ApiResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  post(id: string, dto: PostInventoryDocumentDto): Observable<ApiResponse<InventoryDocumentDto>> {
    return this.http.post<ApiResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.post(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  quickAdjust(dto: QuickAdjustDto): Observable<ApiResponse<InventoryDocumentDto>> {
    return this.http.post<ApiResponse<InventoryDocumentDto>>(INVENTORY_API.inventoryDocument.quickAdjust, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
