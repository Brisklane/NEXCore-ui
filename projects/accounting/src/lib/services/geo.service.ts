import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ACCOUNTING_API } from './accounting-api-config';

export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private currencies$: Observable<CurrencyDto[]> | null = null;

  constructor(private http: HttpClient) {}

  getCurrencies(): Observable<CurrencyDto[]> {
    if (!this.currencies$) {
      this.currencies$ = this.http
        .get<{ data: CurrencyDto[] }>(ACCOUNTING_API.geo.currencies)
        .pipe(
          map((res) => (res.data ?? []).filter((c) => c.isActive)),
          shareReplay(1),
        );
    }
    return this.currencies$;
  }
}
