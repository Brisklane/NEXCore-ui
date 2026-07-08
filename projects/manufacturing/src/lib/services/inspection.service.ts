import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  InspectionDto, CreateInspectionDto, UpdateInspectionDto,
  InspectionCharacteristicDto, CreateInspectionCharacteristicDto, UpdateInspectionCharacteristicDto,
} from '../models/inspection.model';

@Injectable({ providedIn: 'root' })
export class InspectionService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<InspectionDto>> {
    return this.http.get<PaginatedResponse<InspectionDto>>(
      MANUFACTURING_API.inspection.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<InspectionDto>> {
    return this.http.get<ApiResponse<InspectionDto>>(MANUFACTURING_API.inspection.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<InspectionDto[]>> {
    return this.http.get<ApiResponse<InspectionDto[]>>(MANUFACTURING_API.inspection.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateInspectionDto): Observable<ApiResponse<InspectionDto>> {
    return this.http.post<ApiResponse<InspectionDto>>(MANUFACTURING_API.inspection.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateInspectionDto): Observable<ApiResponse<InspectionDto>> {
    return this.http.put<ApiResponse<InspectionDto>>(MANUFACTURING_API.inspection.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.inspection.delete(id), { headers: this.auth.getAuthHeaders() });
  }

  createCharacteristic(inspectionId: string, dto: CreateInspectionCharacteristicDto): Observable<ApiResponse<InspectionCharacteristicDto>> {
    const headers = this.auth.getAuthHeaders();
    const nestedUrl = MANUFACTURING_API.inspection.createCharacteristic(inspectionId);
    const dtoWithInspectionId = { inspectionId, ...dto };

    return this.http.post<ApiResponse<InspectionCharacteristicDto>>(nestedUrl, dto, { headers }).pipe(
      catchError((firstError) => {
        if (firstError.status !== 400 && firstError.status !== 404) {
          return throwError(() => firstError);
        }

        return this.http.post<ApiResponse<InspectionCharacteristicDto>>(nestedUrl, dtoWithInspectionId, { headers }).pipe(
          catchError((secondError) => throwError(() => secondError)),
        );
      }),
    );
  }

  updateCharacteristic(inspectionId: string, characteristicId: string, dto: UpdateInspectionCharacteristicDto): Observable<ApiResponse<InspectionCharacteristicDto>> {
    return this.http.put<ApiResponse<InspectionCharacteristicDto>>(MANUFACTURING_API.inspection.updateCharacteristic(inspectionId, characteristicId), dto, { headers: this.auth.getAuthHeaders() });
  }

  deleteCharacteristic(inspectionId: string, characteristicId: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.inspection.deleteCharacteristic(inspectionId, characteristicId), { headers: this.auth.getAuthHeaders() });
  }
}
