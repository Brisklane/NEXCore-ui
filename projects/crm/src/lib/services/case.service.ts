import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  CaseDto, CreateCaseDto, UpdateCaseDto,
  CaseCommentDto, CreateCaseCommentDto,
} from '../models/case.model';

@Injectable({ providedIn: 'root' })
export class CaseService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<CaseDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('page',     String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    if (opts?.search)   params = params.set('search',   opts.search);
    return this.http.get<PaginatedResponse<CaseDto>>(CRM_API.cases.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  getById(id: string): Observable<ApiResponse<CaseDto>> {
    return this.http.get<ApiResponse<CaseDto>>(CRM_API.cases.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateCaseDto): Observable<ApiResponse<CaseDto>> {
    return this.http.post<ApiResponse<CaseDto>>(CRM_API.cases.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateCaseDto): Observable<ApiResponse<CaseDto>> {
    return this.http.put<ApiResponse<CaseDto>>(CRM_API.cases.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(CRM_API.cases.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getComments(id: string): Observable<ApiResponse<CaseCommentDto[]>> {
    return this.http.get<ApiResponse<CaseCommentDto[]>>(CRM_API.cases.getComments(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  addComment(id: string, dto: CreateCaseCommentDto): Observable<ApiResponse<CaseCommentDto>> {
    return this.http.post<ApiResponse<CaseCommentDto>>(CRM_API.cases.addComment(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteComment(id: string, commentId: string): Observable<void> {
    return this.http.delete<void>(CRM_API.cases.deleteComment(id, commentId), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
