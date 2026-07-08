import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { MaterialIssueDto, CreateMaterialIssueDto, UpdateMaterialIssueDto } from '../models/material-issue.model';

@Injectable({ providedIn: 'root' })
export class MaterialIssueService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<MaterialIssueDto>> {
    return this.http.get<PaginatedResponse<MaterialIssueDto>>(
      MANUFACTURING_API.materialIssue.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<MaterialIssueDto>> {
    return this.http.get<ApiResponse<MaterialIssueDto>>(MANUFACTURING_API.materialIssue.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<MaterialIssueDto[]>> {
    return this.http.get<ApiResponse<MaterialIssueDto[]>>(MANUFACTURING_API.materialIssue.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateMaterialIssueDto): Observable<ApiResponse<MaterialIssueDto>> {
    return this.http.post<ApiResponse<MaterialIssueDto>>(MANUFACTURING_API.materialIssue.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateMaterialIssueDto): Observable<ApiResponse<MaterialIssueDto>> {
    return this.http.put<ApiResponse<MaterialIssueDto>>(MANUFACTURING_API.materialIssue.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.materialIssue.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
