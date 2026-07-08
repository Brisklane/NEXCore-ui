import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  PurchaseInvoiceDto, CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto,
  HoldInvoiceDto, DisputeInvoiceDto,
} from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseInvoiceDto>> {
    return this.http.get<PaginatedResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.getAll, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.get<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.getById(id), { headers: this.headers });
  }
  getByStatus(status: number): Observable<ApiResponse<PurchaseInvoiceDto[]>> {
    return this.http.get<ApiResponse<PurchaseInvoiceDto[]>>(PROCUREMENT_API.invoice.getByStatus(status), { headers: this.headers });
  }
  getByVendor(vendorId: string): Observable<ApiResponse<PurchaseInvoiceDto[]>> {
    return this.http.get<ApiResponse<PurchaseInvoiceDto[]>>(PROCUREMENT_API.invoice.getByVendor(vendorId), { headers: this.headers });
  }
  getOverdue(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseInvoiceDto>> {
    return this.http.get<PaginatedResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.getOverdue, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getPendingPayment(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseInvoiceDto>> {
    return this.http.get<PaginatedResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.getPendingPayment, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  create(dto: CreatePurchaseInvoiceDto): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdatePurchaseInvoiceDto): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.put<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.update(id), dto, { headers: this.headers });
  }
  approve(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.approve(id), {}, { headers: this.headers });
  }
  post(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.post(id), {}, { headers: this.headers });
  }
  hold(id: string, dto: HoldInvoiceDto): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.hold(id), dto, { headers: this.headers });
  }
  releaseHold(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.releaseHold(id), {}, { headers: this.headers });
  }
  dispute(id: string, dto: DisputeInvoiceDto): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.dispute(id), dto, { headers: this.headers });
  }
  resolveDispute(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.resolveDispute(id), {}, { headers: this.headers });
  }
  cancel(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.cancel(id), {}, { headers: this.headers });
  }
  threeWayMatch(id: string): Observable<ApiResponse<PurchaseInvoiceDto>> {
    return this.http.post<ApiResponse<PurchaseInvoiceDto>>(PROCUREMENT_API.invoice.threeWayMatch(id), {}, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.invoice.delete(id), { headers: this.headers });
  }
}
