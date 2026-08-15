import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosShiftReportDto, PosSalesSummaryDto, PosProductSalesDto,
  PosCashierSalesDto, PosHourlySalesDto, PosTenderTotalDto,
} from '../models/pos-report.model';

/**
 * POS reporting. Everything here is read-only — in particular a Z read does **not** close
 * the session, so a manager can take yesterday's figures without touching a till.
 */
@Injectable({ providedIn: 'root' })
export class PosReportService {
  constructor(private http: HttpClient) {}

  /** Mid-shift snapshot of an open session. */
  xRead(sessionId: string): Observable<ApiResponse<PosShiftReportDto>> {
    return this.http.get<ApiResponse<PosShiftReportDto>>(SALES_API.posReport.xRead(sessionId));
  }

  /** End-of-shift read. Marked provisional if the session is still open. */
  zRead(sessionId: string): Observable<ApiResponse<PosShiftReportDto>> {
    return this.http.get<ApiResponse<PosShiftReportDto>>(SALES_API.posReport.zRead(sessionId));
  }

  /**
   * Dates are sent as plain `yyyy-MM-dd`. The API widens a bare `to` to the end of that
   * day, so a one-day range covers the whole day's trading rather than just midnight.
   */
  private range(from: string, to: string, storeId?: string | null): HttpParams {
    let params = new HttpParams().set('from', from).set('to', to);
    if (storeId) params = params.set('storeId', storeId);
    return params;
  }

  salesSummary(from: string, to: string, storeId?: string | null): Observable<ApiResponse<PosSalesSummaryDto>> {
    return this.http.get<ApiResponse<PosSalesSummaryDto>>(
      SALES_API.posReport.salesSummary, { params: this.range(from, to, storeId) });
  }

  byProduct(from: string, to: string, storeId?: string | null, top = 50): Observable<ApiResponse<PosProductSalesDto[]>> {
    return this.http.get<ApiResponse<PosProductSalesDto[]>>(
      SALES_API.posReport.byProduct, { params: this.range(from, to, storeId).set('top', top) });
  }

  byCashier(from: string, to: string, storeId?: string | null): Observable<ApiResponse<PosCashierSalesDto[]>> {
    return this.http.get<ApiResponse<PosCashierSalesDto[]>>(
      SALES_API.posReport.byCashier, { params: this.range(from, to, storeId) });
  }

  byHour(from: string, to: string, storeId?: string | null): Observable<ApiResponse<PosHourlySalesDto[]>> {
    return this.http.get<ApiResponse<PosHourlySalesDto[]>>(
      SALES_API.posReport.byHour, { params: this.range(from, to, storeId) });
  }

  tenderMix(from: string, to: string, storeId?: string | null): Observable<ApiResponse<PosTenderTotalDto[]>> {
    return this.http.get<ApiResponse<PosTenderTotalDto[]>>(
      SALES_API.posReport.tenderMix, { params: this.range(from, to, storeId) });
  }
}
