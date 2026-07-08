import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ItemCategoryDto, CreateItemCategoryDto, UpdateItemCategoryDto, GenerateCategoryGlAccountsDto } from '../models/item-category.model';

@Injectable({ providedIn: 'root' })
export class ItemCategoryService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ItemCategoryDto>> {
    return this.http.get<PaginatedResponse<ItemCategoryDto>>(INVENTORY_API.itemCategory.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<ItemCategoryDto>> {
    return this.http.get<ApiResponse<ItemCategoryDto>>(INVENTORY_API.itemCategory.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(pagination?: PaginationParams): Observable<ApiResponse<ItemCategoryDto[]>> {
    return this.http.get<ApiResponse<ItemCategoryDto[]>>(INVENTORY_API.itemCategory.getActive, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getHierarchy(): Observable<ApiResponse<ItemCategoryDto[]>> {
    return this.http.get<ApiResponse<ItemCategoryDto[]>>(INVENTORY_API.itemCategory.getHierarchy, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateItemCategoryDto): Observable<ApiResponse<ItemCategoryDto>> {
    return this.http.post<ApiResponse<ItemCategoryDto>>(INVENTORY_API.itemCategory.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateItemCategoryDto): Observable<ApiResponse<ItemCategoryDto>> {
    return this.http.put<ApiResponse<ItemCategoryDto>>(INVENTORY_API.itemCategory.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  generateGlAccounts(id: string, dto: GenerateCategoryGlAccountsDto): Observable<ApiResponse<ItemCategoryDto>> {
    return this.http.post<ApiResponse<ItemCategoryDto>>(INVENTORY_API.itemCategory.generateGlAccounts(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(INVENTORY_API.itemCategory.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
