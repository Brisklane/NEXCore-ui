import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  SalesInvoiceDto,
  CreateSalesInvoiceDto,
  CancelInvoiceDto,
  RegisterInvoicePaymentDto,
  SendInvoiceDto,
  CreateCreditNoteFromInvoiceDto,
  CreditNoteDto,
} from '../models/sales-invoice.model';

@Injectable({ providedIn: 'root' })
export class SalesInvoiceService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SalesInvoiceDto[]>> {
    return this.http.get<ApiResponse<SalesInvoiceDto[]>>(SALES_API.salesInvoice.getAll);
  }

  getById(id: string): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.get<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.getById(id));
  }

  create(dto: CreateSalesInvoiceDto): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.create, dto);
  }

  getOverdue(): Observable<ApiResponse<SalesInvoiceDto[]>> {
    return this.http.get<ApiResponse<SalesInvoiceDto[]>>(SALES_API.salesInvoice.overdue);
  }

  confirm(id: string): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.confirm(id), {});
  }

  cancel(id: string, dto: CancelInvoiceDto): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.cancel(id), dto);
  }

  byNumber(n: string): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.get<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.byNumber(n));
  }

  byCustomer(contactId: string): Observable<ApiResponse<SalesInvoiceDto[]>> {
    return this.http.get<ApiResponse<SalesInvoiceDto[]>>(SALES_API.salesInvoice.byCustomer(contactId));
  }

  byOrder(salesOrderId: string): Observable<ApiResponse<SalesInvoiceDto[]>> {
    return this.http.get<ApiResponse<SalesInvoiceDto[]>>(SALES_API.salesInvoice.byOrder(salesOrderId));
  }

  resetToDraft(id: string): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.resetToDraft(id), {});
  }

  registerPayment(id: string, dto: RegisterInvoicePaymentDto): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.registerPayment(id), dto);
  }

  send(id: string, dto: SendInvoiceDto): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesInvoice.send(id), dto);
  }

  creditNote(id: string, dto: CreateCreditNoteFromInvoiceDto): Observable<ApiResponse<CreditNoteDto>> {
    return this.http.post<ApiResponse<CreditNoteDto>>(SALES_API.salesInvoice.creditNote(id), dto);
  }

  /** Printable HTML invoice document (rendered from the default receipt template). */
  getDocumentHtml(id: string): Observable<string> {
    return this.http.get(SALES_API.salesInvoice.document(id), {
      responseType: 'text',
    });
  }
}
