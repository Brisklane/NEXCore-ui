import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  VendorProfileDto,
  UpsertVendorProfileDto,
  ReviewVendorApplicationDto,
} from '../models/pos-store.model';

@Injectable({ providedIn: 'root' })
export class StoreVendorProfileService {
  constructor(private http: HttpClient) {}

  getVendorProfile(storeId: string): Observable<ApiResponse<VendorProfileDto>> {
    return this.http.get<ApiResponse<VendorProfileDto>>(
      SALES_API.posStore.vendorProfile(storeId),
    );
  }

  upsertVendorProfile(storeId: string, dto: UpsertVendorProfileDto): Observable<ApiResponse<VendorProfileDto>> {
    return this.http.put<ApiResponse<VendorProfileDto>>(
      SALES_API.posStore.upsertVendorProfile(storeId),
      dto,
    );
  }

  submitVendorApplication(storeId: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      SALES_API.posStore.submitVendorApplication(storeId),
      {},
    );
  }

  getPendingApplications(): Observable<ApiResponse<VendorProfileDto[]>> {
    return this.http.get<ApiResponse<VendorProfileDto[]>>(
      SALES_API.posStore.pendingVendorApplications,
    );
  }

  reviewVendorApplication(storeId: string, dto: ReviewVendorApplicationDto): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      SALES_API.posStore.reviewVendorApplication(storeId),
      dto,
    );
  }
}
