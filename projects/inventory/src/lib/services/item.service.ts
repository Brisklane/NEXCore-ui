import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ItemDto, CreateItemDto, UpdateItemDto, ItemImageDto } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
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
    if (pagination.warehouseId) params = params.set('warehouseId', pagination.warehouseId);
    return params;
  }

  getAll(pagination?: PaginationParams, itemType?: string): Observable<PaginatedResponse<ItemDto>> {
    let params = this.buildParams(pagination);
    if (itemType) params = params.set('itemType', itemType);
    return this.http.get<PaginatedResponse<ItemDto>>(INVENTORY_API.item.getAll, {
      headers: this.auth.getAuthHeaders(), params
    });
  }

  getById(id: string): Observable<ApiResponse<ItemDto>> {
    return this.http.get<ApiResponse<ItemDto>>(INVENTORY_API.item.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByCode(code: string): Observable<ApiResponse<ItemDto>> {
    return this.http.get<ApiResponse<ItemDto>>(INVENTORY_API.item.getByCode(code), {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** Look up an item by barcode. 200 = barcode is taken; 404 = barcode is free. */
  getByBarcode(barcode: string): Observable<ApiResponse<ItemDto>> {
    return this.http.get<ApiResponse<ItemDto>>(INVENTORY_API.item.getByBarcode(encodeURIComponent(barcode)), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<ItemDto[]>> {
    return this.http.get<ApiResponse<ItemDto[]>>(INVENTORY_API.item.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Lightweight item lookup hitting /api/Item/basic — the same endpoint the entity-picker dropdown
   * uses. Exposed so a page can fire a throwaway call on load to warm the EF/SQL query plan, so the
   * user's first search in the picker isn't hit with the one-time compile cost.
   */
  getBasic(search = '', pageSize = 5): Observable<PaginatedResponse<ItemDto>> {
    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', String(pageSize))
      .set('search', search);
    return this.http.get<PaginatedResponse<ItemDto>>(INVENTORY_API.item.basic, {
      headers: this.auth.getAuthHeaders(), params
    });
  }

  /** Active items as a paginated response (exposes pagination meta for page-through loads). */
  getActivePaged(pagination?: PaginationParams): Observable<PaginatedResponse<ItemDto>> {
    return this.http.get<PaginatedResponse<ItemDto>>(INVENTORY_API.item.getActive, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  create(dto: CreateItemDto): Observable<ApiResponse<ItemDto>> {
    return this.http.post<ApiResponse<ItemDto>>(INVENTORY_API.item.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateItemDto): Observable<ApiResponse<ItemDto>> {
    return this.http.put<ApiResponse<ItemDto>>(INVENTORY_API.item.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.item.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  uploadImages(
    id: string,
    files: File[],
    altText?: string | null,
    displayOrder = 0,
    isPrimary = false
  ): Observable<ApiResponse<ItemImageDto[]>> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (altText) formData.append('altText', altText);
    formData.append('displayOrder', String(displayOrder));
    formData.append('isPrimary', String(isPrimary));
    return this.http.post<ApiResponse<ItemImageDto[]>>(
      INVENTORY_API.item.uploadImages(id),
      formData,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  deleteImage(itemId: string, imageId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      INVENTORY_API.item.deleteImage(itemId, imageId),
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
