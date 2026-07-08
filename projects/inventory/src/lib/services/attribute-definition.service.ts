import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  AttributeDefinitionDto,
  CreateAttributeDefinitionDto,
  UpdateAttributeDefinitionDto
} from '../models/attribute-definition.model';

@Injectable({ providedIn: 'root' })
export class AttributeDefinitionService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<AttributeDefinitionDto>> {
    return this.http.get<PaginatedResponse<AttributeDefinitionDto>>(INVENTORY_API.attributeDefinition.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<AttributeDefinitionDto>> {
    return this.http.get<ApiResponse<AttributeDefinitionDto>>(INVENTORY_API.attributeDefinition.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<AttributeDefinitionDto[]>> {
    return this.http.get<ApiResponse<AttributeDefinitionDto[]>>(INVENTORY_API.attributeDefinition.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getVariants(): Observable<ApiResponse<AttributeDefinitionDto[]>> {
    return this.http.get<ApiResponse<AttributeDefinitionDto[]>>(INVENTORY_API.attributeDefinition.getVariants, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateAttributeDefinitionDto): Observable<ApiResponse<AttributeDefinitionDto>> {
    return this.http.post<ApiResponse<AttributeDefinitionDto>>(INVENTORY_API.attributeDefinition.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateAttributeDefinitionDto): Observable<ApiResponse<AttributeDefinitionDto>> {
    return this.http.put<ApiResponse<AttributeDefinitionDto>>(INVENTORY_API.attributeDefinition.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.attributeDefinition.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
