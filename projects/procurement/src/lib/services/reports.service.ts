import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@nexcore/core';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import {
  PurchaseAnalysisDto, VendorAnalysisDto, ApAgingDto, ThreeWayMatchDto, SpendByCategoryDto,
} from '../models/reports.model';

@Injectable({ providedIn: 'root' })
export class ProcurementReportsService {
  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}
  private get h() { return this.auth.getAuthHeaders(); }

  purchaseAnalysis(): Observable<ApiResponse<PurchaseAnalysisDto>> {
    return this.http.get<ApiResponse<PurchaseAnalysisDto>>(PROCUREMENT_API.reports.purchaseAnalysis, { headers: this.h });
  }
  vendorAnalysis(): Observable<ApiResponse<VendorAnalysisDto>> {
    return this.http.get<ApiResponse<VendorAnalysisDto>>(PROCUREMENT_API.reports.vendorAnalysis, { headers: this.h });
  }
  apAging(): Observable<ApiResponse<ApAgingDto>> {
    return this.http.get<ApiResponse<ApAgingDto>>(PROCUREMENT_API.reports.apAging, { headers: this.h });
  }
  threeWayMatch(): Observable<ApiResponse<ThreeWayMatchDto>> {
    return this.http.get<ApiResponse<ThreeWayMatchDto>>(PROCUREMENT_API.reports.threeWayMatch, { headers: this.h });
  }
  spendByCategory(): Observable<ApiResponse<SpendByCategoryDto>> {
    return this.http.get<ApiResponse<SpendByCategoryDto>>(PROCUREMENT_API.reports.spendByCategory, { headers: this.h });
  }
}
