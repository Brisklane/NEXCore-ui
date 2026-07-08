import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import { PurchaseReturnDto, CreatePurchaseReturnDto } from '../models/purchase-return.model';

@Injectable({ providedIn: 'root' })
export class PurchaseReturnService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseReturnDto>> {
    return this.http.get<PaginatedResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.getAll, { headers: this.h, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<PurchaseReturnDto>> {
    return this.http.get<ApiResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.getById(id), { headers: this.h });
  }
  create(dto: CreatePurchaseReturnDto): Observable<ApiResponse<PurchaseReturnDto>> {
    return this.http.post<ApiResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.create, dto, { headers: this.h });
  }
  approve(id: string): Observable<ApiResponse<PurchaseReturnDto>> {
    return this.http.post<ApiResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.approve(id), {}, { headers: this.h });
  }
  post(id: string): Observable<ApiResponse<PurchaseReturnDto>> {
    return this.http.post<ApiResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.post(id), {}, { headers: this.h });
  }
  cancel(id: string): Observable<ApiResponse<PurchaseReturnDto>> {
    return this.http.post<ApiResponse<PurchaseReturnDto>>(PROCUREMENT_API.purchaseReturn.cancel(id), {}, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.purchaseReturn.delete(id), { headers: this.h });
  }
}
