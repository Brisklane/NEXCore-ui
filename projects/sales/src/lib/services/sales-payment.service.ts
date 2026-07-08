import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { SalesPaymentDto, CreateSalesPaymentDto } from '../models/sales-payment.model';

@Injectable({ providedIn: 'root' })
export class SalesPaymentService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SalesPaymentDto[]>> {
    return this.http.get<ApiResponse<SalesPaymentDto[]>>(SALES_API.salesPayment.getAll);
  }

  getById(id: string): Observable<ApiResponse<SalesPaymentDto>> {
    return this.http.get<ApiResponse<SalesPaymentDto>>(SALES_API.salesPayment.getById(id));
  }

  create(dto: CreateSalesPaymentDto): Observable<ApiResponse<SalesPaymentDto>> {
    return this.http.post<ApiResponse<SalesPaymentDto>>(SALES_API.salesPayment.create, dto);
  }

  byNumber(n: string): Observable<ApiResponse<SalesPaymentDto>> {
    return this.http.get<ApiResponse<SalesPaymentDto>>(SALES_API.salesPayment.byNumber(n));
  }

  byCustomer(customerId: string): Observable<ApiResponse<SalesPaymentDto[]>> {
    return this.http.get<ApiResponse<SalesPaymentDto[]>>(SALES_API.salesPayment.byCustomer(customerId));
  }

  byOrder(orderId: string): Observable<ApiResponse<SalesPaymentDto[]>> {
    return this.http.get<ApiResponse<SalesPaymentDto[]>>(SALES_API.salesPayment.byOrder(orderId));
  }

  byInvoice(invoiceId: string): Observable<ApiResponse<SalesPaymentDto[]>> {
    return this.http.get<ApiResponse<SalesPaymentDto[]>>(SALES_API.salesPayment.byInvoice(invoiceId));
  }
}
