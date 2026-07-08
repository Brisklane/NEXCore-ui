import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { InventoryTransactionDto, CreateInventoryTransactionDto, UpdateInventoryTransactionDto } from '../models/inventory-transaction.model';

@Injectable({ providedIn: 'root' })
export class InventoryTransactionService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<InventoryTransactionDto>> {
    return this.http.get<PaginatedResponse<InventoryTransactionDto>>(
      MANUFACTURING_API.inventoryTransaction.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<InventoryTransactionDto>> {
    return this.http.get<ApiResponse<InventoryTransactionDto>>(MANUFACTURING_API.inventoryTransaction.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByProduct(productId: string): Observable<ApiResponse<InventoryTransactionDto[]>> {
    return this.http.get<ApiResponse<InventoryTransactionDto[]>>(MANUFACTURING_API.inventoryTransaction.getByProduct(productId), { headers: this.auth.getAuthHeaders() });
  }

  getByReference(referenceId: string): Observable<ApiResponse<InventoryTransactionDto[]>> {
    return this.http.get<ApiResponse<InventoryTransactionDto[]>>(MANUFACTURING_API.inventoryTransaction.getByReference(referenceId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateInventoryTransactionDto): Observable<ApiResponse<InventoryTransactionDto>> {
    return this.http.post<ApiResponse<InventoryTransactionDto>>(MANUFACTURING_API.inventoryTransaction.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateInventoryTransactionDto): Observable<ApiResponse<InventoryTransactionDto>> {
    return this.http.put<ApiResponse<InventoryTransactionDto>>(MANUFACTURING_API.inventoryTransaction.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.inventoryTransaction.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
