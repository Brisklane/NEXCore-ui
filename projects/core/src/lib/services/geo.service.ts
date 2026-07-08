import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { CountryDto, SubdivisionDto, CityDto } from '../models/geo.models';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class GeoService {
  private countriesCache$: Observable<CountryDto[]> | null = null;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryDto[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.http
        .get<ApiResponse<CountryDto[]>>(API_CONFIG.geo.countries)
        .pipe(
          map(r => r.data ?? []),
          catchError(() => of([])),
          shareReplay(1),
        );
    }
    return this.countriesCache$;
  }

  getSubdivisions(countryCode: string): Observable<SubdivisionDto[]> {
    return this.http
      .get<ApiResponse<SubdivisionDto[]>>(API_CONFIG.geo.subdivisions(countryCode))
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([])),
      );
  }

  getCities(countryCode: string, subdivisionCode?: string): Observable<CityDto[]> {
    return this.http
      .get<ApiResponse<CityDto[]>>(API_CONFIG.geo.cities(countryCode, subdivisionCode))
      .pipe(
        map(r => r.data ?? []),
        catchError(() => of([])),
      );
  }

  flagUrl(countryCode: string | null): string {
    return `https://flagcdn.com/w40/${(countryCode ?? '').toLowerCase()}.png`;
  }

  dialCode(country: CountryDto): string {
    return country.phoneCode ? `+${country.phoneCode}` : '';
  }
}
