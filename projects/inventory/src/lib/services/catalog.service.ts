import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { INVENTORY_API } from './inventory-api-config';
import { InventoryAuthHelper } from './inventory-auth-helper';
import { ApiResponse } from '../models/api-response.model';
import {
  CatalogMatchType,
  CatalogResolutionDto,
  CatalogResolveResultDto,
  CatalogSyncPageDto,
} from '../models/catalog-resolution.model';

/** Returned on failure so a sync loop terminates instead of spinning. */
const EMPTY_SYNC_PAGE: CatalogSyncPageDto = {
  entries: [], hasMore: false, nextSince: null, nextSinceId: null, serverTime: '',
};

/**
 * Catalogue identity for selling surfaces.
 *
 * The server is the authority: it knows every identifier a product answers to and how
 * many base units a scanned pack represents. `resolveLocal` mirrors that ordering
 * against a cached snapshot so an offline till behaves the same way rather than falling
 * back to a substring guess.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private http: HttpClient, private auth: InventoryAuthHelper) {}

  /**
   * Resolve a scanned or typed code. Returns `isExactMatch` with a single match, or
   * candidates to choose from — never a silent best guess.
   */
  resolve(code: string, fallbackToSearch = true): Observable<CatalogResolveResultDto> {
    const params = new HttpParams()
      .set('code', code)
      .set('fallbackToSearch', fallbackToSearch);

    return this.http
      .get<ApiResponse<CatalogResolveResultDto>>(INVENTORY_API.catalog.resolve, {
        headers: this.auth.getAuthHeaders(),
        params,
      })
      .pipe(
        map((r) => r.data ?? { isExactMatch: false, candidates: [] }),
        catchError(() => of({ isExactMatch: false, candidates: [] } as CatalogResolveResultDto)),
      );
  }

  /**
   * One page of catalogue changes since a watermark. Callers replay pages while
   * `hasMore` is true, carrying `nextSince`/`nextSinceId` forward — the pair is a
   * keyset, so rows sharing a timestamp can't be skipped at a page boundary.
   */
  syncPage(since?: string | null, sinceId?: string | null, pageSize = 500)
    : Observable<CatalogSyncPageDto> {
    let params = new HttpParams().set('pageSize', pageSize);
    if (since) params = params.set('since', since);
    if (sinceId) params = params.set('sinceId', sinceId);

    return this.http
      .get<ApiResponse<CatalogSyncPageDto>>(INVENTORY_API.catalog.sync, {
        headers: this.auth.getAuthHeaders(),
        params,
      })
      .pipe(
        map((r) => r.data ?? EMPTY_SYNC_PAGE),
        catchError(() => of(EMPTY_SYNC_PAGE)),
      );
  }

  /** Free-text catalogue search across names, item SKUs, variant SKUs and barcodes. */
  search(query: string, limit = 25): Observable<CatalogResolutionDto[]> {
    if (!query?.trim()) return of([]);

    const params = new HttpParams().set('q', query.trim()).set('limit', limit);

    return this.http
      .get<ApiResponse<CatalogResolutionDto[]>>(INVENTORY_API.catalog.search, {
        headers: this.auth.getAuthHeaders(),
        params,
      })
      .pipe(
        map((r) => r.data ?? []),
        catchError(() => of([])),
      );
  }

  /**
   * Offline equivalent of {@link resolve}, run against a cached catalogue snapshot.
   *
   * Applies the same precedence as the server — item barcode, then variant barcode,
   * then variant SKU, then item SKU, all exact — so a till that loses connectivity
   * keeps ringing up the right product rather than reverting to substring matching.
   * Pack quantities come from whatever the snapshot recorded for the barcode's unit.
   */
  resolveLocal(code: string, snapshot: CachedCatalogItem[]): CatalogResolveResultDto {
    const needle = (code ?? '').trim().toLowerCase();
    if (!needle) return { isExactMatch: false, candidates: [] };

    const exact = (
      pick: (item: CachedCatalogItem) => CatalogResolutionDto | null,
    ): CatalogResolutionDto | null => {
      for (const item of snapshot) {
        const hit = pick(item);
        if (hit) return hit;
      }
      return null;
    };

    const match =
      // 1. Item barcode — carries its own unit, so a case scans as a case.
      exact((item) => {
        const bc = (item.barcodes ?? []).find((b) => (b.barcode ?? '').toLowerCase() === needle);
        return bc ? this.fromCache(item, CatalogMatchType.ItemBarcode, bc.barcode, bc) : null;
      }) ??
      // 2. Variant barcode.
      exact((item) => {
        const v = (item.variants ?? []).find((x) => (x.barcode ?? '').toLowerCase() === needle);
        return v ? this.fromCache(item, CatalogMatchType.VariantBarcode, v.barcode, null, v) : null;
      }) ??
      // 3. Variant SKU.
      exact((item) => {
        const v = (item.variants ?? []).find((x) => (x.variantCode ?? '').toLowerCase() === needle);
        return v ? this.fromCache(item, CatalogMatchType.VariantCode, v.variantCode, null, v) : null;
      }) ??
      // 4. Item SKU.
      exact((item) =>
        (item.code ?? '').toLowerCase() === needle
          ? this.fromCache(item, CatalogMatchType.ItemCode, item.code)
          : null,
      );

    if (match) return { isExactMatch: true, match, candidates: [] };

    // No identifier matched — offer name candidates, same as the server does.
    const candidates = snapshot
      .filter(
        (i) =>
          (i.name ?? '').toLowerCase().includes(needle) ||
          (i.code ?? '').toLowerCase().includes(needle),
      )
      .slice(0, 25)
      .map((i) => this.fromCache(i, CatalogMatchType.Name, i.name));

    return { isExactMatch: false, candidates };
  }

  /** Shape a cached item (+ optional barcode/variant) like a server resolution. */
  private fromCache(
    item: CachedCatalogItem,
    matchType: CatalogMatchType,
    matchedValue?: string | null,
    barcode?: CachedCatalogBarcode | null,
    variant?: CachedCatalogVariant | null,
  ): CatalogResolutionDto {
    const unitId = barcode?.unitId ?? item.baseUnitId;

    return {
      matchType,
      matchedValue,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      itemType: item.itemType,
      trackingType: item.trackingType,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      imageUrl: item.imageUrl,
      isActive: item.isActive !== false,
      variantId: variant?.id ?? null,
      variantCode: variant?.variantCode ?? null,
      variantName: variant?.variantName ?? null,
      unitId,
      unitName: barcode?.unitName ?? item.baseUnitName,
      baseUnitId: item.baseUnitId,
      baseUnitName: item.baseUnitName,
      quantityInBaseUnits: barcode?.quantityInBaseUnits ?? 1,
      listPrice: item.listPrice ?? null,
    };
  }
}

/** Minimum an offline snapshot must carry for {@link CatalogService.resolveLocal}. */
export interface CachedCatalogItem {
  id: string;
  code: string;
  name: string;
  baseUnitId: string;
  baseUnitName?: string | null;
  itemType?: string | null;
  trackingType?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  listPrice?: number | null;
  barcodes?: CachedCatalogBarcode[];
  variants?: CachedCatalogVariant[];
}

export interface CachedCatalogBarcode {
  barcode: string;
  unitId?: string | null;
  unitName?: string | null;
  /** Base units per one of this barcode's unit; 1 unless it is a pack/case barcode. */
  quantityInBaseUnits?: number;
}

export interface CachedCatalogVariant {
  id: string;
  variantCode: string;
  variantName?: string | null;
  barcode?: string | null;
}
