import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { MachineDowntimeDto, CreateMachineDowntimeDto, UpdateMachineDowntimeDto } from '../models/machine-downtime.model';

@Injectable({ providedIn: 'root' })
export class MachineDowntimeService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<MachineDowntimeDto>> {
    return this.http.get<PaginatedResponse<MachineDowntimeDto>>(
      MANUFACTURING_API.machineDowntime.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<MachineDowntimeDto>> {
    return this.http.get<ApiResponse<MachineDowntimeDto>>(MANUFACTURING_API.machineDowntime.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByWorkCenter(workCenterId: string): Observable<ApiResponse<MachineDowntimeDto[]>> {
    return this.http.get<ApiResponse<MachineDowntimeDto[]>>(MANUFACTURING_API.machineDowntime.getByWorkCenter(workCenterId), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<MachineDowntimeDto[]>> {
    return this.http.get<ApiResponse<MachineDowntimeDto[]>>(MANUFACTURING_API.machineDowntime.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateMachineDowntimeDto): Observable<ApiResponse<MachineDowntimeDto>> {
    return this.http.post<ApiResponse<MachineDowntimeDto>>(MANUFACTURING_API.machineDowntime.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateMachineDowntimeDto): Observable<ApiResponse<MachineDowntimeDto>> {
    return this.http.put<ApiResponse<MachineDowntimeDto>>(MANUFACTURING_API.machineDowntime.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.machineDowntime.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
