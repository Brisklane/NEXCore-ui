import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import { InventoryLookupsDto, LookupItemDto } from '../models/inventory-lookup.model';

@Injectable({ providedIn: 'root' })
export class InventoryLookupService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  getAll(): Observable<ApiResponse<InventoryLookupsDto>> {
    return this.http.get<ApiResponse<InventoryLookupsDto>>(INVENTORY_API.inventoryLookup.getAll, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getItemTypes(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getItemTypes, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getItemConditions(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getItemConditions, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getCostingMethods(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getCostingMethods, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getWarehouseTypes(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getWarehouseTypes, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getBarcodeTypes(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getBarcodeTypes, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getPriceLists(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getPriceLists, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getDocumentTypes(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getDocumentTypes, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getDocumentStatuses(): Observable<ApiResponse<LookupItemDto[]>> {
    return this.http.get<ApiResponse<LookupItemDto[]>>(INVENTORY_API.inventoryLookup.getDocumentStatuses, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
