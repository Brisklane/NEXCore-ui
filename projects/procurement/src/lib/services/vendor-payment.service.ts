import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import { VendorPaymentDto, CreateVendorPaymentDto, UpdateVendorPaymentDto } from '../models/vendor-payment.model';

@Injectable({ providedIn: 'root' })
export class VendorPaymentService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<VendorPaymentDto>> {
    return this.http.get<PaginatedResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.getAll,
      { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<VendorPaymentDto>> {
    return this.http.get<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.getById(id), { headers: this.headers });
  }
  getByStatus(status: number): Observable<ApiResponse<VendorPaymentDto[]>> {
    return this.http.get<ApiResponse<VendorPaymentDto[]>>(PROCUREMENT_API.payment.getByStatus(status), { headers: this.headers });
  }
  getByVendor(vendorId: string): Observable<ApiResponse<VendorPaymentDto[]>> {
    return this.http.get<ApiResponse<VendorPaymentDto[]>>(PROCUREMENT_API.payment.getByVendor(vendorId), { headers: this.headers });
  }
  create(dto: CreateVendorPaymentDto): Observable<ApiResponse<VendorPaymentDto>> {
    return this.http.post<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdateVendorPaymentDto): Observable<ApiResponse<VendorPaymentDto>> {
    return this.http.put<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.update(id), dto, { headers: this.headers });
  }
  approve(id: string): Observable<ApiResponse<VendorPaymentDto>> {
    return this.http.post<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.approve(id), {}, { headers: this.headers });
  }
  markSent(id: string, transactionReference?: string): Observable<ApiResponse<VendorPaymentDto>> {
    let params = new HttpParams();
    if (transactionReference) params = params.set('transactionReference', transactionReference);
    return this.http.post<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.markSent(id), {}, { headers: this.headers, params });
  }
  clear(id: string, bankReferenceNumber?: string): Observable<ApiResponse<VendorPaymentDto>> {
    let params = new HttpParams();
    if (bankReferenceNumber) params = params.set('bankReferenceNumber', bankReferenceNumber);
    return this.http.post<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.clear(id), {}, { headers: this.headers, params });
  }
  cancel(id: string): Observable<ApiResponse<VendorPaymentDto>> {
    return this.http.post<ApiResponse<VendorPaymentDto>>(PROCUREMENT_API.payment.cancel(id), {}, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.payment.delete(id), { headers: this.headers });
  }
}
