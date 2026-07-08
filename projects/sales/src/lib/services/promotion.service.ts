import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { SalesAuthHelper } from './sales-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  PromotionDto,
  PromotionItemDto,
  CreatePromotionDto,
  UpdatePromotionDto,
  CreatePromotionItemDto,
} from '../models/promotion.model';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  constructor(private http: HttpClient, private auth: SalesAuthHelper) {}

  getAll(): Observable<ApiResponse<PromotionDto[]>> {
    return this.http.get<ApiResponse<PromotionDto[]>>(SALES_API.promotion.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<PromotionDto>> {
    return this.http.get<ApiResponse<PromotionDto>>(SALES_API.promotion.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreatePromotionDto): Observable<ApiResponse<PromotionDto>> {
    return this.http.post<ApiResponse<PromotionDto>>(SALES_API.promotion.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdatePromotionDto): Observable<ApiResponse<PromotionDto>> {
    return this.http.put<ApiResponse<PromotionDto>>(SALES_API.promotion.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.promotion.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getActive(at?: string): Observable<ApiResponse<PromotionDto[]>> {
    return this.http.get<ApiResponse<PromotionDto[]>>(SALES_API.promotion.active(at), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  activate(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.promotion.activate(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  pause(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.promotion.pause(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  cancel(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.promotion.cancel(id), {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addItem(id: string, dto: CreatePromotionItemDto): Observable<ApiResponse<PromotionItemDto>> {
    return this.http.post<ApiResponse<PromotionItemDto>>(SALES_API.promotion.addItem(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteItem(id: string, itemId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.promotion.deleteItem(id, itemId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
