import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { RiderDto, CreateRiderDto, UpdateRiderDto, RiderAssignmentDto, CreateRiderAssignmentDto } from '../models/rider.model';

@Injectable({ providedIn: 'root' })
export class RiderService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<RiderDto[]>> {
    return this.http.get<ApiResponse<RiderDto[]>>(SALES_API.rider.getAll);
  }

  getById(id: string): Observable<ApiResponse<RiderDto>> {
    return this.http.get<ApiResponse<RiderDto>>(SALES_API.rider.getById(id));
  }

  create(dto: CreateRiderDto): Observable<ApiResponse<RiderDto>> {
    return this.http.post<ApiResponse<RiderDto>>(SALES_API.rider.create, dto);
  }

  update(id: string, dto: UpdateRiderDto): Observable<ApiResponse<RiderDto>> {
    return this.http.put<ApiResponse<RiderDto>>(SALES_API.rider.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.rider.delete(id));
  }

  getAvailable(storeId?: string): Observable<ApiResponse<RiderDto[]>> {
    let url = SALES_API.rider.available;
    if (storeId) url += `?storeId=${storeId}`;
    return this.http.get<ApiResponse<RiderDto[]>>(url);
  }

  assign(dto: CreateRiderAssignmentDto): Observable<ApiResponse<RiderAssignmentDto>> {
    return this.http.post<ApiResponse<RiderAssignmentDto>>(SALES_API.rider.assign, dto);
  }
}
