import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  RequestForQuotationDto, CreateRFQDto, UpdateRFQDto,
  SubmitVendorQuotationDto, EvaluateQuotationDto, VendorQuotationDto,
} from '../models/rfq.model';
import { PurchaseOrderDto } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class RfqService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<RequestForQuotationDto>> {
    return this.http.get<PaginatedResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.getAll, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.get<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.getById(id), { headers: this.headers });
  }
  getByStatus(status: number): Observable<ApiResponse<RequestForQuotationDto[]>> {
    return this.http.get<ApiResponse<RequestForQuotationDto[]>>(PROCUREMENT_API.rfq.getByStatus(status), { headers: this.headers });
  }
  create(dto: CreateRFQDto): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.post<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdateRFQDto): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.put<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.update(id), dto, { headers: this.headers });
  }
  send(id: string): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.post<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.send(id), {}, { headers: this.headers });
  }
  close(id: string): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.post<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.close(id), {}, { headers: this.headers });
  }
  cancel(id: string): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.post<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.cancel(id), {}, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.rfq.delete(id), { headers: this.headers });
  }
  submitQuotation(rfqId: string, dto: SubmitVendorQuotationDto): Observable<ApiResponse<VendorQuotationDto>> {
    return this.http.post<ApiResponse<VendorQuotationDto>>(PROCUREMENT_API.rfq.submitQuotation(rfqId), dto, { headers: this.headers });
  }
  evaluate(rfqId: string, evaluations: EvaluateQuotationDto[]): Observable<ApiResponse<RequestForQuotationDto>> {
    return this.http.post<ApiResponse<RequestForQuotationDto>>(PROCUREMENT_API.rfq.evaluate(rfqId), evaluations, { headers: this.headers });
  }
  award(rfqId: string, quotationId: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.rfq.award(rfqId, quotationId), {}, { headers: this.headers });
  }
}
