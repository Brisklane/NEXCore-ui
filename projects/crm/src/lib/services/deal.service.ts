import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  DealDto, CreateDealDto, UpdateDealDto,
  DealProductDto, CreateDealProductDto, UpdateDealProductDto,
  DealContactDto, CreateDealContactDto,
} from '../models/deal.model';

@Injectable({ providedIn: 'root' })
export class DealService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<DealDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<DealDto>>(CRM_API.deals.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<DealDto>> {
    return this.http.get<ApiResponse<DealDto>>(CRM_API.deals.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateDealDto): Observable<ApiResponse<DealDto>> {
    return this.http.post<ApiResponse<DealDto>>(CRM_API.deals.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateDealDto): Observable<ApiResponse<DealDto>> {
    return this.http.put<ApiResponse<DealDto>>(CRM_API.deals.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.deals.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getProducts(id: string): Observable<ApiResponse<DealProductDto[]>> {
    return this.http.get<ApiResponse<DealProductDto[]>>(CRM_API.deals.getProducts(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addProduct(id: string, dto: CreateDealProductDto): Observable<ApiResponse<DealProductDto>> {
    return this.http.post<ApiResponse<DealProductDto>>(CRM_API.deals.addProduct(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  updateProduct(id: string, productId: string, dto: UpdateDealProductDto): Observable<ApiResponse<DealProductDto>> {
    return this.http.put<ApiResponse<DealProductDto>>(CRM_API.deals.updateProduct(id, productId), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  removeProduct(id: string, productId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.deals.removeProduct(id, productId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getContacts(id: string): Observable<ApiResponse<DealContactDto[]>> {
    return this.http.get<ApiResponse<DealContactDto[]>>(CRM_API.deals.getContacts(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addContact(id: string, dto: CreateDealContactDto): Observable<ApiResponse<DealContactDto>> {
    return this.http.post<ApiResponse<DealContactDto>>(CRM_API.deals.addContact(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  removeContact(id: string, contactId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.deals.removeContact(id, contactId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
