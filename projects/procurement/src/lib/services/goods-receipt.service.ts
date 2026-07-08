import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  GoodsReceiptDto, CreateGoodsReceiptDto, UpdateGoodsReceiptDto, InspectGoodsReceiptLineDto,
} from '../models/goods-receipt.model';

@Injectable({ providedIn: 'root' })
export class GoodsReceiptService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<GoodsReceiptDto>> {
    return this.http.get<PaginatedResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.getAll, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<GoodsReceiptDto>> {
    return this.http.get<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.getById(id), { headers: this.headers });
  }
  getByStatus(status: number): Observable<ApiResponse<GoodsReceiptDto[]>> {
    return this.http.get<ApiResponse<GoodsReceiptDto[]>>(PROCUREMENT_API.goodsReceipt.getByStatus(status), { headers: this.headers });
  }
  getByPO(poId: string): Observable<ApiResponse<GoodsReceiptDto[]>> {
    return this.http.get<ApiResponse<GoodsReceiptDto[]>>(PROCUREMENT_API.goodsReceipt.getByPO(poId), { headers: this.headers });
  }
  create(dto: CreateGoodsReceiptDto): Observable<ApiResponse<GoodsReceiptDto>> {
    return this.http.post<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdateGoodsReceiptDto): Observable<ApiResponse<GoodsReceiptDto>> {
    return this.http.put<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.update(id), dto, { headers: this.headers });
  }
  post(id: string, fiscalPeriodId?: string): Observable<ApiResponse<GoodsReceiptDto>> {
    let params = new HttpParams();
    if (fiscalPeriodId) params = params.set('fiscalPeriodId', fiscalPeriodId);
    return this.http.post<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.post(id), {}, { headers: this.headers, params });
  }
  cancel(id: string): Observable<ApiResponse<GoodsReceiptDto>> {
    return this.http.post<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.cancel(id), {}, { headers: this.headers });
  }
  inspect(id: string, lines: InspectGoodsReceiptLineDto[]): Observable<ApiResponse<GoodsReceiptDto>> {
    return this.http.post<ApiResponse<GoodsReceiptDto>>(PROCUREMENT_API.goodsReceipt.inspect(id), lines, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.goodsReceipt.delete(id), { headers: this.headers });
  }
}
