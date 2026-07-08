import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiResponse } from '@nexcore/core';
import { SelectOption } from '@nexcore/shared';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';
import { CURRENCY_OPTIONS } from '../models/procurement-constants';

interface GeoCurrencyDto {
  code: string;
  name: string;
  symbol?: string;
}

/**
 * Loads the full ISO-4217 currency list from Core GeoReference and exposes it as
 * SelectOption[] for dropdowns. Result is cached for the session; falls back to the
 * built-in short list if the endpoint is unavailable.
 */
@Injectable({ providedIn: 'root' })
export class CurrencyLookupService {
  private cache$?: Observable<SelectOption[]>;

  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  getOptions(): Observable<SelectOption[]> {
    if (!this.cache$) {
      this.cache$ = this.http
        .get<ApiResponse<GeoCurrencyDto[]>>(PROCUREMENT_API.geo.currencies, { headers: this.auth.getAuthHeaders() })
        .pipe(
          map(res => (res.data ?? []).map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))),
          map(opts => (opts.length ? opts : CURRENCY_OPTIONS)),
          catchError(() => of(CURRENCY_OPTIONS)),
          shareReplay(1),
        );
    }
    return this.cache$;
  }
}
