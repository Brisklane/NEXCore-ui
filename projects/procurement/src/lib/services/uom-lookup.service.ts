import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiResponse } from '@nexcore/core';
import { SelectOption } from '@nexcore/shared';
import { PROCUREMENT_API } from './procurement-api-config';
import { ProcurementAuthHelper } from './procurement-auth-helper';

export interface UnitOption {
  id: string;
  code: string;
  name: string;
}

interface UnitDto {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Loads the active Units of Measure from the Inventory module and exposes them as
 * SelectOption[] for dropdowns (value = unit id, label = "CODE — Name"). Result is
 * cached for the session. Procurement line items should reference these instead of
 * capturing a free-text UoM, so quantities stay consistent with Inventory.
 */
@Injectable({ providedIn: 'root' })
export class UomLookupService {
  private cache$?: Observable<UnitOption[]>;

  constructor(private http: HttpClient, private auth: ProcurementAuthHelper) {}

  /** Raw unit list (id/code/name), cached for the session. */
  getUnits(): Observable<UnitOption[]> {
    if (!this.cache$) {
      const url = `${PROCUREMENT_API.inventory.unitsActive}?pageNumber=1&pageSize=500`;
      this.cache$ = this.http
        .get<ApiResponse<UnitDto[]>>(url, { headers: this.auth.getAuthHeaders() })
        .pipe(
          map(res => (res.data ?? []).map(u => ({ id: u.id, code: u.code, name: u.name }))),
          catchError(() => of([] as UnitOption[])),
          shareReplay(1),
        );
    }
    return this.cache$;
  }

  /** SelectOption[] keyed by unit id, labelled "CODE — Name". */
  getOptions(): Observable<SelectOption[]> {
    return this.getUnits().pipe(
      map(units => units.map(u => ({ value: u.id, label: `${u.code} — ${u.name}` }))),
    );
  }
}
