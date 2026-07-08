import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { InventoryBalanceDto } from '../models/inventory-balance.model';

@Injectable({ providedIn: 'root' })
export class InventoryBalanceService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  getByItemWarehouse(itemId: string, warehouseId: string): Observable<ApiResponse<InventoryBalanceDto>> {
    return this.http.get<ApiResponse<InventoryBalanceDto>>(
      `${INVENTORY_API.inventoryBalance.getByItemWarehouse}?itemId=${itemId}&warehouseId=${warehouseId}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getByItem(itemId: string): Observable<ApiResponse<InventoryBalanceDto[]>> {
    return this.http.get<ApiResponse<InventoryBalanceDto[]>>(INVENTORY_API.inventoryBalance.getByItem(itemId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getByWarehouse(warehouseId: string): Observable<ApiResponse<InventoryBalanceDto[]>> {
    return this.http.get<ApiResponse<InventoryBalanceDto[]>>(INVENTORY_API.inventoryBalance.getByWarehouse(warehouseId), {
      headers: this.auth.getAuthHeaders()
    });
  }

  getLowStock(): Observable<ApiResponse<InventoryBalanceDto[]>> {
    return this.http.get<ApiResponse<InventoryBalanceDto[]>>(INVENTORY_API.inventoryBalance.getLowStock, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getTotalValue(warehouseId: string): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(INVENTORY_API.inventoryBalance.getTotalValue(warehouseId), {
      headers: this.auth.getAuthHeaders()
    });
  }
}
