import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { CouponDto } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  constructor(private http: HttpClient) {}

  getActive(): Observable<ApiResponse<CouponDto[]>> {
    return this.http.get<ApiResponse<CouponDto[]>>(SALES_API.coupon.active);
  }

  validate(code: string, customerId?: string): Observable<ApiResponse<CouponDto>> {
    let url = SALES_API.coupon.validate(code);
    if (customerId) url += `?customerId=${customerId}`;
    return this.http.get<ApiResponse<CouponDto>>(url);
  }
}
