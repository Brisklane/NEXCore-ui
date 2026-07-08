import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { TaxDefinitionDto, CreateTaxDefinitionDto, UpdateTaxDefinitionDto } from '../models/tax-definition.model';

@Injectable({ providedIn: 'root' })
export class TaxDefinitionService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<TaxDefinitionDto>> {
    return this.http.get<PaginatedResponse<TaxDefinitionDto>>(INVENTORY_API.taxDefinition.getAll, {
      headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination)
    });
  }

  getById(id: string): Observable<ApiResponse<TaxDefinitionDto>> {
    return this.http.get<ApiResponse<TaxDefinitionDto>>(INVENTORY_API.taxDefinition.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getActive(): Observable<ApiResponse<TaxDefinitionDto[]>> {
    return this.http.get<ApiResponse<TaxDefinitionDto[]>>(INVENTORY_API.taxDefinition.getActive, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getSales(): Observable<ApiResponse<TaxDefinitionDto[]>> {
    return this.http.get<ApiResponse<TaxDefinitionDto[]>>(INVENTORY_API.taxDefinition.getSales, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getPurchases(): Observable<ApiResponse<TaxDefinitionDto[]>> {
    return this.http.get<ApiResponse<TaxDefinitionDto[]>>(INVENTORY_API.taxDefinition.getPurchases, {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateTaxDefinitionDto): Observable<ApiResponse<TaxDefinitionDto>> {
    return this.http.post<ApiResponse<TaxDefinitionDto>>(INVENTORY_API.taxDefinition.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  update(id: string, dto: UpdateTaxDefinitionDto): Observable<ApiResponse<TaxDefinitionDto>> {
    return this.http.put<ApiResponse<TaxDefinitionDto>>(INVENTORY_API.taxDefinition.update(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(INVENTORY_API.taxDefinition.delete(id), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
