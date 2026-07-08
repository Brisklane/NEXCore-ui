import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  PurchaseOrderDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, CancelPurchaseOrderDto,
} from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseOrderDto>> {
    return this.http.get<PaginatedResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.getAll, {
      headers: this.auth.getAuthHeaders(),
      params: buildPaginationParams(pagination),
    });
  }

  getById(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.get<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByNumber(number: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.get<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.getByNumber(number), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByStatus(status: number): Observable<ApiResponse<PurchaseOrderDto[]>> {
    return this.http.get<ApiResponse<PurchaseOrderDto[]>>(PROCUREMENT_API.purchaseOrder.getByStatus(status), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getByVendor(vendorId: string): Observable<ApiResponse<PurchaseOrderDto[]>> {
    return this.http.get<ApiResponse<PurchaseOrderDto[]>>(PROCUREMENT_API.purchaseOrder.getByVendor(vendorId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getPendingReceipt(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseOrderDto>> {
    return this.http.get<PaginatedResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.getPendingReceipt, {
      headers: this.auth.getAuthHeaders(),
      params: buildPaginationParams(pagination),
    });
  }

  getToInvoice(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseOrderDto>> {
    return this.http.get<PaginatedResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.getToInvoice, {
      headers: this.auth.getAuthHeaders(),
      params: buildPaginationParams(pagination),
    });
  }

  create(dto: CreatePurchaseOrderDto): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdatePurchaseOrderDto): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.put<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  confirm(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.confirm(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  sendToVendor(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.sendToVendor(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  acknowledge(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.acknowledge(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  close(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.close(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  cancel(id: string, dto: CancelPurchaseOrderDto): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.purchaseOrder.cancel(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.purchaseOrder.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
