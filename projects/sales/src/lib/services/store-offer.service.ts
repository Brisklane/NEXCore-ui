import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  StoreOfferDto,
  CreateStoreOfferDto,
  UpdateStoreOfferDto,
} from '../models/store-offer.model';

@Injectable({ providedIn: 'root' })
export class StoreOfferService {
  constructor(private http: HttpClient) {}

  getByStore(storeId: string): Observable<ApiResponse<StoreOfferDto[]>> {
    return this.http.get<ApiResponse<StoreOfferDto[]>>(SALES_API.storeOffer.byStore(storeId));
  }

  getAllByStore(storeId: string): Observable<ApiResponse<StoreOfferDto[]>> {
    return this.http.get<ApiResponse<StoreOfferDto[]>>(SALES_API.storeOffer.byStoreAll(storeId));
  }

  getAll(): Observable<ApiResponse<StoreOfferDto[]>> {
    return this.http.get<ApiResponse<StoreOfferDto[]>>(SALES_API.storeOffer.getAll);
  }

  getById(id: string): Observable<ApiResponse<StoreOfferDto>> {
    return this.http.get<ApiResponse<StoreOfferDto>>(SALES_API.storeOffer.getById(id));
  }

  create(dto: CreateStoreOfferDto): Observable<ApiResponse<StoreOfferDto>> {
    return this.http.post<ApiResponse<StoreOfferDto>>(SALES_API.storeOffer.create, dto);
  }

  update(id: string, dto: UpdateStoreOfferDto): Observable<ApiResponse<StoreOfferDto>> {
    return this.http.put<ApiResponse<StoreOfferDto>>(SALES_API.storeOffer.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.storeOffer.delete(id));
  }

  toggle(id: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(SALES_API.storeOffer.toggle(id), {});
  }
}
