import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  SalesOrderDto,
  CreateSalesOrderDto,
  CreatePhoneOrderDto,
  SyncOfflineOrderDto,
  UpdateSalesOrderStatusDto,
  CreateInvoiceFromOrderDto,
} from '../models/sales-order.model';
import { SalesInvoiceDto } from '../models/sales-invoice.model';

@Injectable({ providedIn: 'root' })
export class SalesOrderService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.getAll);
  }

  getById(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.get<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.getById(id));
  }

  getFull(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.get<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.getFull(id));
  }

  create(dto: CreateSalesOrderDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.create, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.salesOrder.delete(id));
  }

  place(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.place(id), {});
  }

  updateStatus(id: string, dto: UpdateSalesOrderStatusDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.patch<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.updateStatus(id), dto);
  }

  byNumber(n: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.get<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.byNumber(n));
  }

  byStatus(status: string): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.byStatus(status));
  }

  byChannel(channel: string): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.byChannel(channel));
  }

  byCustomer(contactId: string): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.byCustomer(contactId));
  }

  activeDrafts(contactId: string): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.activeDrafts(contactId));
  }

  storeQueue(storeId: string): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.storeQueue(storeId));
  }

  phoneOrder(dto: CreatePhoneOrderDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.phoneOrder, dto);
  }

  syncOffline(dto: SyncOfflineOrderDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.syncOffline, dto);
  }

  getOrdersToInvoice(): Observable<ApiResponse<SalesOrderDto[]>> {
    return this.http.get<ApiResponse<SalesOrderDto[]>>(SALES_API.salesOrder.toInvoice);
  }

  createInvoice(id: string, dto: CreateInvoiceFromOrderDto): Observable<ApiResponse<SalesInvoiceDto>> {
    return this.http.post<ApiResponse<SalesInvoiceDto>>(SALES_API.salesOrder.createInvoice(id), dto);
  }

  lock(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.lock(id), {});
  }

  unlock(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.salesOrder.unlock(id), {});
  }
}
