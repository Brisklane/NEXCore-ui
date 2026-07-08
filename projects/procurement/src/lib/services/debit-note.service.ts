import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import { VendorDebitNoteDto, CreateVendorDebitNoteDto } from '../models/debit-note.model';
import { PurchaseReturnDto } from '../models/purchase-return.model';

@Injectable({ providedIn: 'root' })
export class VendorDebitNoteService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<VendorDebitNoteDto>> {
    return this.http.get<PaginatedResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.getAll, { headers: this.h, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.get<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.getById(id), { headers: this.h });
  }
  getEligibleReturns(): Observable<ApiResponse<PurchaseReturnDto[]>> {
    return this.http.get<ApiResponse<PurchaseReturnDto[]>>(PROCUREMENT_API.vendorDebitNote.eligibleReturns, { headers: this.h });
  }
  create(dto: CreateVendorDebitNoteDto): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.post<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.create, dto, { headers: this.h });
  }
  send(id: string): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.post<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.send(id), {}, { headers: this.h });
  }
  acknowledge(id: string): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.post<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.acknowledge(id), {}, { headers: this.h });
  }
  settle(id: string): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.post<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.settle(id), {}, { headers: this.h });
  }
  cancel(id: string): Observable<ApiResponse<VendorDebitNoteDto>> {
    return this.http.post<ApiResponse<VendorDebitNoteDto>>(PROCUREMENT_API.vendorDebitNote.cancel(id), {}, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendorDebitNote.delete(id), { headers: this.h });
  }
}
