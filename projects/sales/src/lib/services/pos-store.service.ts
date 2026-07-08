import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { PosStoreDto, CreatePosStoreDto, UpdatePosStoreDto, NearbyStoreDto, SetStoreOnlineStatusDto } from '../models/pos-store.model';

@Injectable({ providedIn: 'root' })
export class PosStoreService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<PosStoreDto[]>> {
    return this.http.get<ApiResponse<PosStoreDto[]>>(SALES_API.posStore.getAll);
  }

  getById(id: string): Observable<ApiResponse<PosStoreDto>> {
    return this.http.get<ApiResponse<PosStoreDto>>(SALES_API.posStore.getById(id));
  }

  create(dto: CreatePosStoreDto): Observable<ApiResponse<PosStoreDto>> {
    return this.http.post<ApiResponse<PosStoreDto>>(SALES_API.posStore.create, dto);
  }

  update(id: string, dto: UpdatePosStoreDto): Observable<ApiResponse<PosStoreDto>> {
    return this.http.put<ApiResponse<PosStoreDto>>(SALES_API.posStore.update(id), dto);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(SALES_API.posStore.delete(id));
  }

  getActive(): Observable<ApiResponse<PosStoreDto[]>> {
    return this.http.get<ApiResponse<PosStoreDto[]>>(SALES_API.posStore.active);
  }

  getOnlineEnabled(): Observable<ApiResponse<PosStoreDto[]>> {
    return this.http.get<ApiResponse<PosStoreDto[]>>(SALES_API.posStore.onlineEnabled);
  }

  getMenu(id: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(SALES_API.posStore.menu(id));
  }

  getNearby(lat: number, lng: number, radiusKm = 5): Observable<ApiResponse<NearbyStoreDto[]>> {
    return this.http.get<ApiResponse<NearbyStoreDto[]>>(
      SALES_API.posStore.nearby(lat, lng, radiusKm),
    );
  }

  setOnlineStatus(id: string, dto: SetStoreOnlineStatusDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(SALES_API.posStore.setOnlineStatus(id), dto);
  }
}
