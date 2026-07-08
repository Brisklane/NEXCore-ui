import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { PriceListDto, CreatePriceListDto, UpdatePriceListDto } from '../models/price-list.model';

@Injectable({ providedIn: 'root' })
export class PriceListService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<PriceListDto[]>> {
    return this.http.get<ApiResponse<PriceListDto[]>>(SALES_API.priceList.getAll);
  }

  getById(id: string): Observable<ApiResponse<PriceListDto>> {
    return this.http.get<ApiResponse<PriceListDto>>(SALES_API.priceList.getById(id));
  }

  create(dto: CreatePriceListDto): Observable<ApiResponse<PriceListDto>> {
    return this.http.post<ApiResponse<PriceListDto>>(SALES_API.priceList.create, dto);
  }

  update(id: string, dto: UpdatePriceListDto): Observable<ApiResponse<PriceListDto>> {
    return this.http.put<ApiResponse<PriceListDto>>(SALES_API.priceList.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.priceList.delete(id));
  }

  getActive(): Observable<ApiResponse<PriceListDto[]>> {
    return this.http.get<ApiResponse<PriceListDto[]>>(SALES_API.priceList.active);
  }
}
