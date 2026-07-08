import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { DeliveryDto, CreateDeliveryDto, ShipDeliveryDto } from '../models/delivery.model';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<DeliveryDto[]>> {
    return this.http.get<ApiResponse<DeliveryDto[]>>(SALES_API.delivery.getAll);
  }

  getById(id: string): Observable<ApiResponse<DeliveryDto>> {
    return this.http.get<ApiResponse<DeliveryDto>>(SALES_API.delivery.getById(id));
  }

  create(dto: CreateDeliveryDto): Observable<ApiResponse<DeliveryDto>> {
    return this.http.post<ApiResponse<DeliveryDto>>(SALES_API.delivery.create, dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.delivery.delete(id));
  }

  ship(id: string, dto: ShipDeliveryDto): Observable<ApiResponse<DeliveryDto>> {
    return this.http.post<ApiResponse<DeliveryDto>>(SALES_API.delivery.ship(id), dto);
  }

  deliver(id: string): Observable<ApiResponse<DeliveryDto>> {
    return this.http.post<ApiResponse<DeliveryDto>>(SALES_API.delivery.deliver(id), {});
  }

  byStatus(status: string): Observable<ApiResponse<DeliveryDto[]>> {
    return this.http.get<ApiResponse<DeliveryDto[]>>(SALES_API.delivery.byStatus(status));
  }
}
