import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import {
  CurrencyDto,
  GeoCurrencyDto,
  CurrencyRateDto,
  CurrencyConversionResultDto,
  BulkConversionResultDto,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CreateCurrencyRateDto,
  UpdateCurrencyRateDto,
  CurrencyConversionRequestDto,
  BulkConversionRequestDto,
} from '../models/currency.model';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<CurrencyDto[]>> {
    return this.http.get<ApiResponse<CurrencyDto[]>>(SALES_API.currency.getAll);
  }

  /** Fetches the full ISO 4217 reference list from the Core geo endpoint. */
  getGeoCurrencies(): Observable<ApiResponse<GeoCurrencyDto[]>> {
    return this.http.get<ApiResponse<GeoCurrencyDto[]>>(SALES_API.geo.currencies);
  }

  getBase(): Observable<ApiResponse<CurrencyDto>> {
    return this.http.get<ApiResponse<CurrencyDto>>(SALES_API.currency.getBase);
  }

  getByCode(code: string): Observable<ApiResponse<CurrencyDto>> {
    return this.http.get<ApiResponse<CurrencyDto>>(SALES_API.currency.getByCode(code));
  }

  create(dto: CreateCurrencyDto): Observable<ApiResponse<CurrencyDto>> {
    return this.http.post<ApiResponse<CurrencyDto>>(SALES_API.currency.create, dto);
  }

  update(id: string, dto: UpdateCurrencyDto): Observable<ApiResponse<CurrencyDto>> {
    return this.http.put<ApiResponse<CurrencyDto>>(SALES_API.currency.update(id), dto);
  }

  getRates(id: string): Observable<ApiResponse<CurrencyRateDto[]>> {
    return this.http.get<ApiResponse<CurrencyRateDto[]>>(SALES_API.currency.getRates(id));
  }

  addRate(id: string, dto: CreateCurrencyRateDto): Observable<ApiResponse<CurrencyRateDto>> {
    return this.http.post<ApiResponse<CurrencyRateDto>>(SALES_API.currency.addRate(id), dto);
  }

  updateRate(rateId: string, dto: UpdateCurrencyRateDto): Observable<ApiResponse<CurrencyRateDto>> {
    return this.http.put<ApiResponse<CurrencyRateDto>>(SALES_API.currency.updateRate(rateId), dto);
  }

  deleteRate(rateId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.currency.deleteRate(rateId));
  }

  getLatestRates(asOfDate?: string): Observable<ApiResponse<CurrencyRateDto[]>> {
    return this.http.get<ApiResponse<CurrencyRateDto[]>>(SALES_API.currency.latestRates(asOfDate));
  }

  getRateHistory(code: string, fromDate?: string, toDate?: string): Observable<ApiResponse<CurrencyRateDto[]>> {
    return this.http.get<ApiResponse<CurrencyRateDto[]>>(
      SALES_API.currency.rateHistory(code, fromDate, toDate),
    );
  }

  convert(dto: CurrencyConversionRequestDto): Observable<ApiResponse<CurrencyConversionResultDto>> {
    return this.http.post<ApiResponse<CurrencyConversionResultDto>>(SALES_API.currency.convert, dto);
  }

  bulkConvert(dto: BulkConversionRequestDto): Observable<ApiResponse<BulkConversionResultDto>> {
    return this.http.post<ApiResponse<BulkConversionResultDto>>(SALES_API.currency.bulkConvert, dto);
  }

  rateLookup(
    from: string,
    to: string,
    rateType?: number,
    rateName?: string,
    asOfDate?: string,
  ): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      SALES_API.currency.rateLookup(from, to, rateType, rateName, asOfDate),
    );
  }
}
