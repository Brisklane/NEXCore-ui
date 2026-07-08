import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  PurchaseRequisitionDto, CreatePurchaseRequisitionDto,
  UpdatePurchaseRequisitionDto, RejectRequisitionDto,
} from '../models/requisition.model';
import { PurchaseOrderDto } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class RequisitionService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseRequisitionDto>> {
    return this.http.get<PaginatedResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.getAll, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.get<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.getById(id), { headers: this.headers });
  }
  getByStatus(status: number): Observable<ApiResponse<PurchaseRequisitionDto[]>> {
    return this.http.get<ApiResponse<PurchaseRequisitionDto[]>>(PROCUREMENT_API.requisition.getByStatus(status), { headers: this.headers });
  }
  getPendingApproval(): Observable<ApiResponse<PurchaseRequisitionDto[]>> {
    return this.http.get<ApiResponse<PurchaseRequisitionDto[]>>(PROCUREMENT_API.requisition.getPendingApproval, { headers: this.headers });
  }
  create(dto: CreatePurchaseRequisitionDto): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.post<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdatePurchaseRequisitionDto): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.put<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.update(id), dto, { headers: this.headers });
  }
  submit(id: string): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.post<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.submit(id), {}, { headers: this.headers });
  }
  approve(id: string): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.post<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.approve(id), {}, { headers: this.headers });
  }
  reject(id: string, dto: RejectRequisitionDto): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.post<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.reject(id), dto, { headers: this.headers });
  }
  cancel(id: string): Observable<ApiResponse<PurchaseRequisitionDto>> {
    return this.http.post<ApiResponse<PurchaseRequisitionDto>>(PROCUREMENT_API.requisition.cancel(id), {}, { headers: this.headers });
  }
  convertToOrder(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.http.post<ApiResponse<PurchaseOrderDto>>(PROCUREMENT_API.requisition.convertToOrder(id), {}, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.requisition.delete(id), { headers: this.headers });
  }
}
