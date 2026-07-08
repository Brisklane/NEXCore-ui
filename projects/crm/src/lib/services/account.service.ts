import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { AccountDto, CreateAccountDto, UpdateAccountDto } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<AccountDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<AccountDto>>(CRM_API.accounts.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<AccountDto>> {
    return this.http.get<ApiResponse<AccountDto>>(CRM_API.accounts.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateAccountDto): Observable<ApiResponse<AccountDto>> {
    return this.http.post<ApiResponse<AccountDto>>(CRM_API.accounts.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateAccountDto): Observable<ApiResponse<AccountDto>> {
    return this.http.put<ApiResponse<AccountDto>>(CRM_API.accounts.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.accounts.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
