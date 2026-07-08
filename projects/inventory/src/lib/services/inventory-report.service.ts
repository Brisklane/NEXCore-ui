import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';
import {
  StockLedgerReportDto,
  StockValuationReportDto,
  InventoryAgingReportDto,
  LowStockAlertDto
} from '../models/inventory-report.model';
import { InventoryBalanceReportDto, ItemStockTotalDto } from '../models/inventory-balance.model';

@Injectable({ providedIn: 'root' })
export class InventoryReportService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  getStockLedger(itemId?: string, warehouseId?: string, from?: string, to?: string): Observable<ApiResponse<StockLedgerReportDto[]>> {
    const params = new URLSearchParams();
    if (itemId) params.set('itemId', itemId);
    if (warehouseId) params.set('warehouseId', warehouseId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return this.http.get<ApiResponse<StockLedgerReportDto[]>>(
      `${INVENTORY_API.inventoryReport.getStockLedger}${qs ? '?' + qs : ''}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getStockSummary(warehouseId?: string, pagination?: PaginationParams): Observable<PaginatedResponse<InventoryBalanceReportDto>> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    if (pagination?.pageNumber != null) params = params.set('PageNumber', pagination.pageNumber);
    if (pagination?.pageSize != null) params = params.set('PageSize', pagination.pageSize);
    if (pagination?.searchTerm) params = params.set('SearchTerm', pagination.searchTerm);
    if (pagination?.sortBy) params = params.set('SortBy', pagination.sortBy);
    if (pagination?.sortDirection) params = params.set('SortDirection', pagination.sortDirection);
    return this.http.get<PaginatedResponse<InventoryBalanceReportDto>>(
      INVENTORY_API.inventoryReport.getStockSummary,
      { headers: this.auth.getAuthHeaders(), params }
    );
  }

  /**
   * Per-item on-hand/reserved/available totals in one fast call. With no warehouseId the totals are
   * summed across all warehouses (items grid); pass one to restrict to a single warehouse (POS till).
   */
  getStockByItem(warehouseId?: string): Observable<ApiResponse<ItemStockTotalDto[]>> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouseId', warehouseId);
    return this.http.get<ApiResponse<ItemStockTotalDto[]>>(
      INVENTORY_API.inventoryReport.getStockByItem,
      { headers: this.auth.getAuthHeaders(), params }
    );
  }

  getStockValuation(asOfDate?: string): Observable<ApiResponse<StockValuationReportDto[]>> {
    const qs = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.http.get<ApiResponse<StockValuationReportDto[]>>(
      `${INVENTORY_API.inventoryReport.getStockValuation}${qs}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getInventoryAging(warehouseId?: string): Observable<ApiResponse<InventoryAgingReportDto[]>> {
    const qs = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return this.http.get<ApiResponse<InventoryAgingReportDto[]>>(
      `${INVENTORY_API.inventoryReport.getInventoryAging}${qs}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  getLowStockAlert(): Observable<ApiResponse<LowStockAlertDto[]>> {
    return this.http.get<ApiResponse<LowStockAlertDto[]>>(INVENTORY_API.inventoryReport.getLowStockAlert, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
