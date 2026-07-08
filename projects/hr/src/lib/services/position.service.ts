import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HR_API } from './hr-api-config';
import { HrAuthHelper } from './hr-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { PositionDto, CreatePositionDto, UpdatePositionDto } from '../models/position.model';

@Injectable({ providedIn: 'root' })
export class PositionService {
  constructor(private http: HttpClient, private auth: HrAuthHelper) {}

  getAll(): Observable<ApiResponse<PositionDto[]>> {
    return this.http.get<ApiResponse<PositionDto[]>>(HR_API.position.getAll, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  getById(id: string): Observable<ApiResponse<PositionDto>> {
    return this.http.get<ApiResponse<PositionDto>>(HR_API.position.getById(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }

  create(dto: CreatePositionDto): Observable<ApiResponse<PositionDto>> {
    return this.http.post<ApiResponse<PositionDto>>(HR_API.position.create, dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  update(id: string, dto: UpdatePositionDto): Observable<ApiResponse<PositionDto>> {
    return this.http.put<ApiResponse<PositionDto>>(HR_API.position.update(id), dto, {
      headers: this.auth.getAuthHeaders(),
    });
  }

  delete(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(HR_API.position.delete(id), {
      headers: this.auth.getAuthHeaders(),
    });
  }
}
