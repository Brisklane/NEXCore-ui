import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { CRM_API } from './crm-api-config';
import { CrmAuthHelper } from './crm-auth-helper';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { ContactDto, CreateContactDto, UpdateContactDto } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient, private auth: CrmAuthHelper) {}

  /**
   * The API binds `PaginationParams` — `PageNumber`, `PageSize`, `SearchTerm`. Sending
   * `page`/`search` bound to nothing, so every call silently returned an unfiltered
   * first page. `PageSize` is also capped at 100 server-side, so asking for more is not
   * a way to load "everything"; page or search instead.
   */
  getAll(opts?: { page?: number; pageSize?: number; search?: string }): Observable<PaginatedResponse<ContactDto>> {
    let params = new HttpParams();
    if (opts?.page)     params = params.set('PageNumber', String(opts.page));
    if (opts?.pageSize) params = params.set('PageSize',   String(opts.pageSize));
    if (opts?.search)   params = params.set('SearchTerm', opts.search);
    return this.http.get<PaginatedResponse<ContactDto>>(CRM_API.contacts.getAll, {
      headers: this.auth.getAuthHeaders(),
      params,
    });
  }

  /**
   * Every contact, fetched page by page.
   *
   * `PageSize` is clamped to 100 server-side, so a single large request quietly returns
   * only the first 100 — which is how a POS ends up unable to find most of its customers.
   * Use this where a complete set is genuinely needed (an offline snapshot); prefer
   * {@link getAll} with `search` for interactive lookup.
   */
  getAllPages(maxPages = 50): Observable<ContactDto[]> {
    const PAGE_SIZE = 100;

    const fetchFrom = (page: number, acc: ContactDto[]): Observable<ContactDto[]> =>
      this.getAll({ page, pageSize: PAGE_SIZE }).pipe(
        switchMap(res => {
          const rows = res.data ?? [];
          const all = acc.concat(rows);
          const total = res.pagination?.totalCount ?? all.length;
          const done = all.length >= total || rows.length < PAGE_SIZE || page >= maxPages;
          return done ? of(all) : fetchFrom(page + 1, all);
        }),
      );

    return fetchFrom(1, []);
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
