import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { ItemBatchDto, UpdateBatchStatusDto } from '../models/item-batch.model';

@Injectable({ providedIn: 'root' })
export class ItemBatchService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  getByItem(itemId: string): Observable<ApiResponse<ItemBatchDto[]>> {
    return this.http.get<ApiResponse<ItemBatchDto[]>>(INVENTORY_API.itemBatch.getByItem(itemId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getById(id: string): Observable<ApiResponse<ItemBatchDto>> {
    return this.http.get<ApiResponse<ItemBatchDto>>(INVENTORY_API.itemBatch.getById(id), {
      headers: this.auth.getAuthHeaders()
    });
  }

  expiring(days = 30): Observable<ApiResponse<ItemBatchDto[]>> {
    const params = new HttpParams().set('days', days);
    return this.http.get<ApiResponse<ItemBatchDto[]>>(INVENTORY_API.itemBatch.expiring, {
      headers: this.auth.getAuthHeaders(), params
    });
  }

  updateStatus(id: string, dto: UpdateBatchStatusDto): Observable<ApiResponse<ItemBatchDto>> {
    return this.http.put<ApiResponse<ItemBatchDto>>(INVENTORY_API.itemBatch.updateStatus(id), dto, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
