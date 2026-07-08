import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { ContactDto, CreateContactDto, UpdateContactDto } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<ContactDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<ContactDto>>(CRM_API.contacts.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<ContactDto>> {
    return this.http.get<ApiResponse<ContactDto>>(CRM_API.contacts.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateContactDto): Observable<ApiResponse<ContactDto>> {
    return this.http.post<ApiResponse<ContactDto>>(CRM_API.contacts.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateContactDto): Observable<ApiResponse<ContactDto>> {
    return this.http.put<ApiResponse<ContactDto>>(CRM_API.contacts.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.contacts.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
