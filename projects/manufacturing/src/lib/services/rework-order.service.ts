import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { ReworkOrderDto, CreateReworkOrderDto, UpdateReworkOrderDto } from '../models/rework-order.model';

@Injectable({ providedIn: 'root' })
export class ReworkOrderService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ReworkOrderDto>> {
    return this.http.get<PaginatedResponse<ReworkOrderDto>>(
      MANUFACTURING_API.reworkOrder.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<ReworkOrderDto>> {
    return this.http.get<ApiResponse<ReworkOrderDto>>(MANUFACTURING_API.reworkOrder.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<ReworkOrderDto[]>> {
    return this.http.get<ApiResponse<ReworkOrderDto[]>>(MANUFACTURING_API.reworkOrder.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateReworkOrderDto): Observable<ApiResponse<ReworkOrderDto>> {
    const headers = this.auth.getAuthHeaders();
    return this.http.post<ApiResponse<ReworkOrderDto>>(MANUFACTURING_API.reworkOrder.create, dto, { headers }).pipe(
      catchError((firstError) => {
        if (firstError?.status !== 400) {
          return throwError(() => firstError);
        }

        // Fallback for APIs that bind command bodies as { request: <dto> }.
        return this.http.post<ApiResponse<ReworkOrderDto>>(
          MANUFACTURING_API.reworkOrder.create,
          { request: dto },
          { headers },
        );
      }),
    );
  }

  update(id: string, dto: UpdateReworkOrderDto): Observable<ApiResponse<ReworkOrderDto>> {
    return this.http.put<ApiResponse<ReworkOrderDto>>(MANUFACTURING_API.reworkOrder.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.reworkOrder.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
