import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { WorkInProgressDto, CreateWorkInProgressDto, UpdateWorkInProgressDto } from '../models/work-in-progress.model';

@Injectable({ providedIn: 'root' })
export class WorkInProgressService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<WorkInProgressDto>> {
    return this.http.get<PaginatedResponse<WorkInProgressDto>>(
      MANUFACTURING_API.wip.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<WorkInProgressDto>> {
    return this.http.get<ApiResponse<WorkInProgressDto>>(MANUFACTURING_API.wip.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<WorkInProgressDto>> {
    return this.http.get<ApiResponse<WorkInProgressDto>>(MANUFACTURING_API.wip.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateWorkInProgressDto): Observable<ApiResponse<WorkInProgressDto>> {
    return this.http.post<ApiResponse<WorkInProgressDto>>(MANUFACTURING_API.wip.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateWorkInProgressDto): Observable<ApiResponse<WorkInProgressDto>> {
    return this.http.put<ApiResponse<WorkInProgressDto>>(MANUFACTURING_API.wip.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.wip.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
