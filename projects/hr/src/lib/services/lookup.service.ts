import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map, throwError } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { LookupTypeDto, CreateLookupTypeDto, LookupValueDto, CreateLookupValueDto } from '../models/lookup.model';

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAllTypes(): Observable<ApiResponse<LookupTypeDto[]>> {
    return this.http.get<ApiResponse<LookupTypeDto[]>>(HR_API.lookup.getAllTypes, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  createType(dto: CreateLookupTypeDto): Observable<ApiResponse<LookupTypeDto>> {
    return this.http.post<ApiResponse<LookupTypeDto>>(HR_API.lookup.createType, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteType(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.lookup.deleteType(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getValuesByType(typeId: string): Observable<ApiResponse<LookupValueDto[]>> {
    return this.http.get<ApiResponse<LookupValueDto[]>>(HR_API.lookup.getValuesByType(typeId), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  createValue(dto: CreateLookupValueDto): Observable<ApiResponse<LookupValueDto>> {
    return this.http.post<ApiResponse<LookupValueDto>>(HR_API.lookup.createValue, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  deleteValue(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.lookup.deleteValue(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  seedLookupValues(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(HR_API.lookup.seedValues, {}, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getValuesByTypeCode(code: string): Observable<LookupValueDto[]> {
    return this.getAllTypes().pipe(
      map(res => (res.data ?? []).find(t => t.code === code)),
      switchMap(type => {
        if (!type) return throwError(() => new Error(`Lookup type '${code}' not found`));
        return this.getValuesByType(type.id).pipe(map(r => r.data ?? []));
      }),
    );
  }
}
