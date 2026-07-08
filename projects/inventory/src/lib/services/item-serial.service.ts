import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  ItemSerialDto, ItemSerialHistoryDto, CreateItemSerialDto,
  UpdateSerialStatusDto, BulkGenerateSerialsDto, SerialLookupResultDto
} from '../models/item-serial.model';

@Injectable({ providedIn: 'root' })
export class ItemSerialService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  getByItem(itemId: string, pagination?: PaginationParams, status?: string): Observable<PaginatedResponse<ItemSerialDto>> {
    let params = new HttpParams();
    if (pagination?.pageNumber != null) params = params.set('PageNumber', pagination.pageNumber);
    if (pagination?.pageSize != null) params = params.set('PageSize', pagination.pageSize);
    if (pagination?.searchTerm) params = params.set('SearchTerm', pagination.searchTerm);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<ItemSerialDto>>(INVENTORY_API.itemSerial.getByItem(itemId), {
      headers: this.auth.getAuthHeaders(), params
    });
  }

  /** Global scan lookup by serial number OR any IMEI. */
  lookup(value: string): Observable<ApiResponse<SerialLookupResultDto>> {
    return this.http.get<ApiResponse<SerialLookupResultDto>>(INVENTORY_API.itemSerial.lookup(value), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getById(id: string): Observable<ApiResponse<ItemSerialDto>> {
    return this.http.get<ApiResponse<ItemSerialDto>>(INVENTORY_API.itemSerial.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getHistory(id: string): Observable<ApiResponse<ItemSerialHistoryDto[]>> {
    return this.http.get<ApiResponse<ItemSerialHistoryDto[]>>(INVENTORY_API.itemSerial.getHistory(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  create(dto: CreateItemSerialDto): Observable<ApiResponse<ItemSerialDto>> {
    return this.http.post<ApiResponse<ItemSerialDto>>(INVENTORY_API.itemSerial.create, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  bulkGenerate(dto: BulkGenerateSerialsDto): Observable<ApiResponse<ItemSerialDto[]>> {
    return this.http.post<ApiResponse<ItemSerialDto[]>>(INVENTORY_API.itemSerial.bulkGenerate, dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  updateStatus(id: string, dto: UpdateSerialStatusDto): Observable<ApiResponse<ItemSerialDto>> {
    return this.http.put<ApiResponse<ItemSerialDto>>(INVENTORY_API.itemSerial.updateStatus(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }

  warrantyExpiring(days = 30): Observable<ApiResponse<ItemSerialDto[]>> {
    const params = new HttpParams().set('days', days);
    return this.http.get<ApiResponse<ItemSerialDto[]>>(INVENTORY_API.itemSerial.warrantyExpiring, {
      headers: this.auth.getAuthHeaders(), params
    });
  }
}
