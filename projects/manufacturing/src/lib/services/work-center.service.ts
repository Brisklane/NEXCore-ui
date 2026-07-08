import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  WorkCenterDto, CreateWorkCenterDto, UpdateWorkCenterDto,
  WorkCenterShiftDto, CreateWorkCenterShiftDto, UpdateWorkCenterShiftDto,
} from '../models/work-center.model';

@Injectable({ providedIn: 'root' })
export class WorkCenterService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<WorkCenterDto>> {
    return this.http.get<PaginatedResponse<WorkCenterDto>>(
      MANUFACTURING_API.workCenter.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<WorkCenterDto>> {
    return this.http.get<ApiResponse<WorkCenterDto>>(MANUFACTURING_API.workCenter.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateWorkCenterDto): Observable<ApiResponse<WorkCenterDto>> {
    return this.http.post<ApiResponse<WorkCenterDto>>(MANUFACTURING_API.workCenter.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateWorkCenterDto): Observable<ApiResponse<WorkCenterDto>> {
    return this.http.put<ApiResponse<WorkCenterDto>>(MANUFACTURING_API.workCenter.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.workCenter.delete(id), { headers: this.auth.getAuthHeaders() });
  }

  getShifts(workCenterId: string): Observable<ApiResponse<WorkCenterShiftDto[]>> {
    return this.http.get<ApiResponse<WorkCenterShiftDto[]>>(MANUFACTURING_API.workCenter.getShifts(workCenterId), { headers: this.auth.getAuthHeaders() });
  }

  createShift(workCenterId: string, dto: CreateWorkCenterShiftDto): Observable<ApiResponse<WorkCenterShiftDto>> {
    const url = MANUFACTURING_API.workCenter.createShift(workCenterId);
    console.info('[WorkCenterService] createShift', { url, workCenterId, dto });
    return this.http.post<ApiResponse<WorkCenterShiftDto>>(url, dto, { headers: this.auth.getAuthHeaders() });
  }

  updateShift(workCenterId: string, shiftId: string, dto: UpdateWorkCenterShiftDto): Observable<ApiResponse<WorkCenterShiftDto>> {
    const url = MANUFACTURING_API.workCenter.updateShift(workCenterId, shiftId);
    console.info('[WorkCenterService] updateShift', { url, workCenterId, shiftId, dto });
    return this.http.put<ApiResponse<WorkCenterShiftDto>>(url, dto, { headers: this.auth.getAuthHeaders() });
  }

  deleteShift(workCenterId: string, shiftId: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.workCenter.deleteShift(workCenterId, shiftId), { headers: this.auth.getAuthHeaders() });
  }
}
