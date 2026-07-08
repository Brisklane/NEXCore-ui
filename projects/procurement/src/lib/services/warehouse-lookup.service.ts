import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiResponse } from '@nexcore/core';
import { SelectOption } from '@nexcore/shared';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';

export interface WarehouseOption {
  id: string;
  name: string;
}

interface WarehouseDto {
  id: string;
  name: string;
}

/**
 * Loads active warehouses (and their bins) from the Inventory module so procurement
 * screens that write stock — primarily Goods Receipt — can let users SELECT a real
 * warehouse/bin instead of typing a GUID. Warehouse list is cached for the session.
 */
@Injectable({ providedIn: 'root' })
export class WarehouseLookupService {
  private warehouses$?: Observable<WarehouseOption[]>;

  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  getWarehouses(): Observable<WarehouseOption[]> {
    if (!this.warehouses$) {
      const url = `${PROCUREMENT_API.inventory.warehousesActive}?pageNumber=1&pageSize=500`;
      this.warehouses$ = this.http
        .get<ApiResponse<WarehouseDto[]>>(url, { headers: this.auth.getAuthHeaders() })
        .pipe(
          map(res => (res.data ?? []).map(w => ({ id: w.id, name: w.name }))),
          catchError(() => of([] as WarehouseOption[])),
          shareReplay(1),
        );
    }
    return this.warehouses$;
  }

  getOptions(): Observable<SelectOption[]> {
    return this.getWarehouses().pipe(map(ws => ws.map(w => ({ value: w.id, label: w.name }))));
  }

  /** Active bins for a warehouse (not cached — scoped per warehouse). */
  getBinOptions(warehouseId: string): Observable<SelectOption[]> {
    if (!warehouseId) return of([]);
    const url = `${PROCUREMENT_API.inventory.warehouseBinsActive(warehouseId)}?pageNumber=1&pageSize=500`;
    return this.http
      .get<ApiResponse<Array<{ id: string; name: string; code?: string }>>>(url, { headers: this.auth.getAuthHeaders() })
      .pipe(
        map(res => (res.data ?? []).map(b => ({ value: b.id, label: b.code ? `${b.code} — ${b.name}` : b.name }))),
        catchError(() => of([] as SelectOption[])),
      );
  }
}
