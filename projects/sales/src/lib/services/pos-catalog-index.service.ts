import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CatalogService, CatalogSyncEntryDto, CatalogSyncPageDto, CachedCatalogItem,
} from '@nexcore/inventory';
import { PosDataCache } from './pos-data-cache.service';

/**
 * The till's local product index.
 *
 * Replaces downloading the whole catalogue on every start: the index lives in IndexedDB
 * and is brought up to date with a delta sync — only what changed since the last run,
 * including tombstones so withdrawn products actually leave the till.
 *
 * Each entry carries its barcodes with `quantityInBaseUnits` already resolved, so an
 * offline till sells a case of 24 as 24 rather than 1.
 */
@Injectable({ providedIn: 'root' })
export class PosCatalogIndex {
  private static readonly INDEX_KEY = 'catalog:index';
  private static readonly WATERMARK_KEY = 'catalog:watermark';

  /** Safety net so a bad watermark can't spin forever. 200 x 500 = 100k rows. */
  private static readonly MAX_PAGES = 200;

  private entries = new Map<string, CatalogSyncEntryDto>();
  private loaded = false;

  constructor(private catalog: CatalogService, private cache: PosDataCache) {}

  /** Products currently in the index, newest sync applied. */
  get items(): CatalogSyncEntryDto[] {
    return [...this.entries.values()];
  }

  get size(): number {
    return this.entries.size;
  }

  /** Load the persisted index into memory. Cheap no-op once done. */
  async load(): Promise<void> {
    if (this.loaded) return;

    const stored = await this.cache.get<CatalogSyncEntryDto[]>(PosCatalogIndex.INDEX_KEY);
    this.entries = new Map((stored ?? []).map((e) => [e.itemId, e]));
    this.loaded = true;
  }

  /**
   * Bring the index up to date. Returns how many rows changed — 0 means the till was
   * already current, which is the normal case after the first run.
   *
   * Safe to call on every till start: with a watermark it costs one small request.
   */
  async sync(): Promise<{ applied: number; removed: number; upToDate: boolean }> {
    await this.load();

    let since = await this.cache.get<string>(PosCatalogIndex.WATERMARK_KEY);
    let sinceId: string | null = null;
    let applied = 0;
    let removed = 0;

    for (let page = 0; page < PosCatalogIndex.MAX_PAGES; page++) {
      const result: CatalogSyncPageDto =
        await firstValueFrom(this.catalog.syncPage(since, sinceId, 500));

      for (const entry of result.entries ?? []) {
        if (entry.isDeleted) {
          if (this.entries.delete(entry.itemId)) removed++;
        } else {
          this.entries.set(entry.itemId, entry);
          applied++;
        }
      }

      // Only advance the watermark once the page is applied, so an interrupted sync
      // resumes from the last fully-applied position rather than skipping rows.
      if (result.nextSince) {
        since = result.nextSince;
        sinceId = result.nextSinceId ?? null;
        await this.cache.set(PosCatalogIndex.WATERMARK_KEY, since);
      }

      if (!result.hasMore) break;
    }

    if (applied || removed) await this.persist();

    return { applied, removed, upToDate: applied === 0 && removed === 0 };
  }

  /**
   * Index entries shaped like the `ItemDto` the product grid renders, so the till can
   * drop the second full-catalogue download. Only the fields the grid actually reads
   * are populated — id/code/name/category for filtering, one image, one price.
   */
  asMenuItems(): any[] {
    return this.items.map((e) => ({
      id: e.itemId,
      code: e.code,
      name: e.name,
      categoryId: e.categoryId,
      itemType: e.itemType,
      trackingType: e.trackingType,
      baseUnitId: e.baseUnitId,
      isActive: e.isActive,
      images: e.imageUrl ? [{ url: e.imageUrl }] : [],
      prices: e.listPrice != null ? [{ salePrice: e.listPrice, isActive: true }] : [],
      barcodes: (e.barcodes ?? []).map((b) => ({ barcode: b.barcode, unitId: b.unitId })),
      variants: e.variants ?? [],
    }));
  }

  /** Shape for {@link CatalogService.resolveLocal} — the offline scan path. */
  snapshot(): CachedCatalogItem[] {
    return this.items.map((e) => ({
      id: e.itemId,
      code: e.code,
      name: e.name,
      baseUnitId: e.baseUnitId,
      baseUnitName: e.baseUnitName,
      itemType: e.itemType,
      trackingType: e.trackingType,
      categoryId: e.categoryId,
      categoryName: e.categoryName,
      isActive: e.isActive,
      listPrice: e.listPrice,
      barcodes: (e.barcodes ?? []).map((b) => ({
        barcode: b.barcode,
        unitId: b.unitId,
        unitName: b.unitName,
        quantityInBaseUnits: b.quantityInBaseUnits,
      })),
      variants: (e.variants ?? []).map((v) => ({
        id: v.id,
        variantCode: v.variantCode,
        variantName: v.variantName,
        barcode: v.barcode,
      })),
    }));
  }

  /** Wipe the index and watermark — forces a full resync on the next call. */
  async reset(): Promise<void> {
    this.entries.clear();
    this.loaded = true;
    await this.cache.set(PosCatalogIndex.INDEX_KEY, []);
    await this.cache.set(PosCatalogIndex.WATERMARK_KEY, null);
  }

  private persist(): Promise<void> {
    return this.cache.set(PosCatalogIndex.INDEX_KEY, this.items);
  }
}
