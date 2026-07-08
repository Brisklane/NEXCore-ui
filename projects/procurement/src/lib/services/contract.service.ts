import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import { PurchaseContractDto, CreatePurchaseContractDto, UpdatePurchaseContractDto, TerminateContractDto } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  private get headers() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<PurchaseContractDto>> {
    return this.http.get<PaginatedResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.getAll, { headers: this.headers, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.get<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.getById(id), { headers: this.headers });
  }
  getActive(): Observable<ApiResponse<PurchaseContractDto[]>> {
    return this.http.get<ApiResponse<PurchaseContractDto[]>>(PROCUREMENT_API.contract.getActive, { headers: this.headers });
  }
  getExpiring(days = 30): Observable<ApiResponse<PurchaseContractDto[]>> {
    return this.http.get<ApiResponse<PurchaseContractDto[]>>(PROCUREMENT_API.contract.getExpiring(days), { headers: this.headers });
  }
  getByVendor(vendorId: string): Observable<ApiResponse<PurchaseContractDto[]>> {
    return this.http.get<ApiResponse<PurchaseContractDto[]>>(PROCUREMENT_API.contract.getByVendor(vendorId), { headers: this.headers });
  }
  create(dto: CreatePurchaseContractDto): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.post<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.create, dto, { headers: this.headers });
  }
  update(id: string, dto: UpdatePurchaseContractDto): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.put<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.update(id), dto, { headers: this.headers });
  }
  activate(id: string): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.post<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.activate(id), {}, { headers: this.headers });
  }
  suspend(id: string): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.post<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.suspend(id), {}, { headers: this.headers });
  }
  terminate(id: string, dto: TerminateContractDto): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.post<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.terminate(id), dto, { headers: this.headers });
  }
  renew(id: string): Observable<ApiResponse<PurchaseContractDto>> {
    return this.http.post<ApiResponse<PurchaseContractDto>>(PROCUREMENT_API.contract.renew(id), {}, { headers: this.headers });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.contract.delete(id), { headers: this.headers });
  }
}
