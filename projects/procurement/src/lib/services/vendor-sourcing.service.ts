import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import {
  ApprovedVendorListDto, CreateApprovedVendorListDto, UpdateApprovedVendorListDto, BlockApprovedVendorDto,
  VendorPerformanceDto, CreateVendorPerformanceDto, UpdateVendorPerformanceDto,
} from '../models/vendor-sourcing.model';

@Injectable({ providedIn: 'root' })
export class ApprovedVendorListService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<ApprovedVendorListDto>> {
    return this.http.get<PaginatedResponse<ApprovedVendorListDto>>(PROCUREMENT_API.approvedVendorList.getAll, { headers: this.h, params: buildPaginationParams(pagination) });
  }
  getByVendor(vendorId: string): Observable<ApiResponse<ApprovedVendorListDto[]>> {
    return this.http.get<ApiResponse<ApprovedVendorListDto[]>>(PROCUREMENT_API.approvedVendorList.getByVendor(vendorId), { headers: this.h });
  }
  create(dto: CreateApprovedVendorListDto): Observable<ApiResponse<ApprovedVendorListDto>> {
    return this.http.post<ApiResponse<ApprovedVendorListDto>>(PROCUREMENT_API.approvedVendorList.create, dto, { headers: this.h });
  }
  update(id: string, dto: UpdateApprovedVendorListDto): Observable<ApiResponse<ApprovedVendorListDto>> {
    return this.http.put<ApiResponse<ApprovedVendorListDto>>(PROCUREMENT_API.approvedVendorList.update(id), dto, { headers: this.h });
  }
  block(id: string, dto: BlockApprovedVendorDto): Observable<ApiResponse<ApprovedVendorListDto>> {
    return this.http.post<ApiResponse<ApprovedVendorListDto>>(PROCUREMENT_API.approvedVendorList.block(id), dto, { headers: this.h });
  }
  unblock(id: string): Observable<ApiResponse<ApprovedVendorListDto>> {
    return this.http.post<ApiResponse<ApprovedVendorListDto>>(PROCUREMENT_API.approvedVendorList.unblock(id), {}, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.approvedVendorList.delete(id), { headers: this.h });
  }
}

@Injectable({ providedIn: 'root' })
export class VendorPerformanceService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(): Observable<ApiResponse<VendorPerformanceDto[]>> {
    return this.http.get<ApiResponse<VendorPerformanceDto[]>>(PROCUREMENT_API.vendorPerformance.getAll, { headers: this.h });
  }
  getByVendor(vendorId: string): Observable<ApiResponse<VendorPerformanceDto[]>> {
    return this.http.get<ApiResponse<VendorPerformanceDto[]>>(PROCUREMENT_API.vendorPerformance.getByVendor(vendorId), { headers: this.h });
  }
  create(dto: CreateVendorPerformanceDto): Observable<ApiResponse<VendorPerformanceDto>> {
    return this.http.post<ApiResponse<VendorPerformanceDto>>(PROCUREMENT_API.vendorPerformance.create, dto, { headers: this.h });
  }
  update(id: string, dto: UpdateVendorPerformanceDto): Observable<ApiResponse<VendorPerformanceDto>> {
    return this.http.put<ApiResponse<VendorPerformanceDto>>(PROCUREMENT_API.vendorPerformance.update(id), dto, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.vendorPerformance.delete(id), { headers: this.h });
  }
}
