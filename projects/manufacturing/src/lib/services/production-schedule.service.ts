import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ProductionScheduleDto, CreateProductionScheduleDto, UpdateProductionScheduleDto } from '../models/production-schedule.model';

@Injectable({ providedIn: 'root' })
export class ProductionScheduleService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ProductionScheduleDto>> {
    return this.http.get<PaginatedResponse<ProductionScheduleDto>>(
      MANUFACTURING_API.productionSchedule.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<ProductionScheduleDto>> {
    return this.http.get<ApiResponse<ProductionScheduleDto>>(MANUFACTURING_API.productionSchedule.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<ProductionScheduleDto[]>> {
    return this.http.get<ApiResponse<ProductionScheduleDto[]>>(MANUFACTURING_API.productionSchedule.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  getByWorkCenter(workCenterId: string): Observable<ApiResponse<ProductionScheduleDto[]>> {
    return this.http.get<ApiResponse<ProductionScheduleDto[]>>(MANUFACTURING_API.productionSchedule.getByWorkCenter(workCenterId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateProductionScheduleDto): Observable<ApiResponse<ProductionScheduleDto>> {
    return this.http.post<ApiResponse<ProductionScheduleDto>>(MANUFACTURING_API.productionSchedule.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateProductionScheduleDto): Observable<ApiResponse<ProductionScheduleDto>> {
    return this.http.put<ApiResponse<ProductionScheduleDto>>(MANUFACTURING_API.productionSchedule.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.productionSchedule.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
