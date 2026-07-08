import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  PosCheckoutDto,
  PosCheckoutResultDto,
  PosTransactionDto,
  OfflineSyncRequest,
  OfflineSyncResult,
} from '../models/pos-transaction.model';
import { ThermalReceiptDto } from '../models/pos-settings.model';

/**
 * All HTTP calls in this service are authenticated by the global authInterceptor,
 * which attaches the Bearer token and handles 401 / token-expiry centrally.
 * Do NOT add manual Authorization headers here.
 */
@Injectable({ providedIn: 'root' })
export class PosTransactionService {
  constructor(private http: HttpClient) {}

  checkout(dto: PosCheckoutDto): Observable<ApiResponse<PosCheckoutResultDto>> {
    return this.http.post<ApiResponse<PosCheckoutResultDto>>(SALES_API.posTransaction.checkout, dto);
  }

  offlineSync(request: OfflineSyncRequest): Observable<ApiResponse<OfflineSyncResult>> {
    return this.http.post<ApiResponse<OfflineSyncResult>>(SALES_API.posTransaction.offlineSync, request);
  }

  getById(id: string): Observable<ApiResponse<PosTransactionDto>> {
    return this.http.get<ApiResponse<PosTransactionDto>>(SALES_API.posTransaction.getById(id));
  }

  getByNumber(transactionNumber: string): Observable<ApiResponse<PosTransactionDto>> {
    return this.http.get<ApiResponse<PosTransactionDto>>(SALES_API.posTransaction.byNumber(transactionNumber));
  }

  getBySession(sessionId: string): Observable<ApiResponse<PosTransactionDto[]>> {
    return this.http.get<ApiResponse<PosTransactionDto[]>>(SALES_API.posTransaction.bySession(sessionId));
  }

  getByDateRange(from: string, to?: string): Observable<ApiResponse<PosTransactionDto[]>> {
    return this.http.get<ApiResponse<PosTransactionDto[]>>(SALES_API.posTransaction.byDate(from, to));
  }

  getReceipt(id: string, paperSize?: string): Observable<ApiResponse<ThermalReceiptDto>> {
    return this.http.get<ApiResponse<ThermalReceiptDto>>(SALES_API.posTransaction.receipt(id, paperSize));
  }

  getReceiptHtml(id: string): Observable<string> {
    return this.http.get(SALES_API.posTransaction.receiptHtml(id), { responseType: 'text' });
  }

  getReceiptPdf(id: string): Observable<Blob> {
    return this.http.get(SALES_API.posTransaction.receiptPdf(id), { responseType: 'blob' });
  }
}
