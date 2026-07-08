import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { buildPaginationParams } from './pagination-params';
import { LandedCostDto, CreateLandedCostDto } from '../models/landed-cost.model';

@Injectable({ providedIn: 'root' })
export class LandedCostService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  getAll(pagination?: PaginationParams): Observable<PaginatedResponse<LandedCostDto>> {
    return this.http.get<PaginatedResponse<LandedCostDto>>(PROCUREMENT_API.landedCost.getAll,
      { headers: this.h, params: buildPaginationParams(pagination) });
  }
  getById(id: string): Observable<ApiResponse<LandedCostDto>> {
    return this.http.get<ApiResponse<LandedCostDto>>(PROCUREMENT_API.landedCost.getById(id), { headers: this.h });
  }
  create(dto: CreateLandedCostDto): Observable<ApiResponse<LandedCostDto>> {
    return this.http.post<ApiResponse<LandedCostDto>>(PROCUREMENT_API.landedCost.create, dto, { headers: this.h });
  }
  post(id: string): Observable<ApiResponse<LandedCostDto>> {
    return this.http.post<ApiResponse<LandedCostDto>>(PROCUREMENT_API.landedCost.post(id), {}, { headers: this.h });
  }
  cancel(id: string): Observable<ApiResponse<LandedCostDto>> {
    return this.http.post<ApiResponse<LandedCostDto>>(PROCUREMENT_API.landedCost.cancel(id), {}, { headers: this.h });
  }
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(PROCUREMENT_API.landedCost.delete(id), { headers: this.h });
  }
}
