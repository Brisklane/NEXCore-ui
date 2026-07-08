import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { PriceOrderRequestDto, PricedOrderDto } from '../models/pricing.model';

@Injectable({ providedIn: 'root' })
export class PricingService {
  constructor(private http: HttpClient) {}

  /**
   * Live price preview. Server recomputes every price, discount, promotion,
   * coupon and tax — display exactly what this returns. No persistence.
   */
  quote(dto: PriceOrderRequestDto): Observable<ApiResponse<PricedOrderDto>> {
    return this.http.post<ApiResponse<PricedOrderDto>>(SALES_API.pricing.quote, dto);
  }
}
