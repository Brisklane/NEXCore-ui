import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MANUFACTURING_API } from './manufacturing-api-config';
import { ManufacturingAuthHelper } from './manufacturing-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import { FinishedGoodsReceiptDto, CreateFinishedGoodsReceiptDto, UpdateFinishedGoodsReceiptDto } from '../models/finished-goods-receipt.model';

@Injectable({ providedIn: 'root' })
export class FinishedGoodsReceiptService {
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

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<FinishedGoodsReceiptDto>> {
    return this.http.get<PaginatedResponse<FinishedGoodsReceiptDto>>(
      MANUFACTURING_API.finishedGoodsReceipt.getAll,
      { headers: this.auth.getAuthHeaders(), params: this.buildParams(pagination) }
    );
  }

  getById(id: string): Observable<ApiResponse<FinishedGoodsReceiptDto>> {
    return this.http.get<ApiResponse<FinishedGoodsReceiptDto>>(MANUFACTURING_API.finishedGoodsReceipt.getById(id), { headers: this.auth.getAuthHeaders() });
  }

  getByOrder(productionOrderId: string): Observable<ApiResponse<FinishedGoodsReceiptDto[]>> {
    return this.http.get<ApiResponse<FinishedGoodsReceiptDto[]>>(MANUFACTURING_API.finishedGoodsReceipt.getByOrder(productionOrderId), { headers: this.auth.getAuthHeaders() });
  }

  create(dto: CreateFinishedGoodsReceiptDto): Observable<ApiResponse<FinishedGoodsReceiptDto>> {
    return this.http.post<ApiResponse<FinishedGoodsReceiptDto>>(MANUFACTURING_API.finishedGoodsReceipt.create, dto, { headers: this.auth.getAuthHeaders() });
  }

  update(id: string, dto: UpdateFinishedGoodsReceiptDto): Observable<ApiResponse<FinishedGoodsReceiptDto>> {
    return this.http.put<ApiResponse<FinishedGoodsReceiptDto>>(MANUFACTURING_API.finishedGoodsReceipt.update(id), dto, { headers: this.auth.getAuthHeaders() });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(MANUFACTURING_API.finishedGoodsReceipt.delete(id), { headers: this.auth.getAuthHeaders() });
  }
}
