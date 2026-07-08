import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from '../models/currency.model';
import { HrLookupItemDto } from '../models/hr-lookup-item.model';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<CurrencyDto[]>> {
    return this.http.get<ApiResponse<CurrencyDto[]>>(HR_API.currency.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getLookup(): Observable<ApiResponse<HrLookupItemDto[]>> {
    return this.getAll().pipe(
      map(res => ({
        ...res,
        data: (res.data ?? []).map(c => ({
          id: c.id,
          name: c.currencyName ? `${c.currencyCode} - ${c.currencyName}` : (c.currencyCode ?? c.id),
          code: c.currencyCode,
        })),
      }))
    );
  }

  getById(id: string): Observable<ApiResponse<CurrencyDto>> {
    return this.http.get<ApiResponse<CurrencyDto>>(HR_API.currency.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreateCurrencyDto): Observable<ApiResponse<CurrencyDto>> {
    return this.http.post<ApiResponse<CurrencyDto>>(HR_API.currency.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdateCurrencyDto): Observable<ApiResponse<CurrencyDto>> {
    return this.http.put<ApiResponse<CurrencyDto>>(HR_API.currency.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(HR_API.currency.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
