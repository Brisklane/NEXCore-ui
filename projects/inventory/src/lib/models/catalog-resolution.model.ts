/**
 * Which identifier a scanned/typed code matched. Mirrors the API enum, which
 * serialises as a number — ordered from most specific (a barcode scan) to least
 * (a name guess).
 */
export enum CatalogMatchType {
  ItemBarcode = 0,
  VariantBarcode = 1,
  VariantCode = 2,
  ItemCode = 3,
  Name = 4,
}

/**
 * One resolved sellable line: which item, which variant, in which unit, and how many
 * base units that unit represents.
 *
 * `quantityInBaseUnits` is the important one — a barcode may belong to a non-base unit
 * (the EAN on a case of 24), so selling it must add 24 base units, not 1.
 */
export interface CatalogResolutionDto {
  matchType: CatalogMatchType;
  matchedValue?: string | null;

  itemId: string;
  itemCode: string;
  itemName: string;
  itemType?: string | null;
  trackingType?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  isActive: boolean;

  variantId?: string | null;
  variantCode?: string | null;
  variantName?: string | null;

  unitId: string;
  unitName?: string | null;
  baseUnitId: string;
  baseUnitName?: string | null;
  /** Base units per one `unitId`. 1 for a loose item, 24 for a case-of-24 barcode. */
  quantityInBaseUnits: number;

  /** Catalogue list price for `unitId` — indicative; Sales pricing decides at checkout. */
  listPrice?: number | null;
}

/** Either exactly one hit, or candidates to choose from. Never a silent guess. */
export interface CatalogResolveResultDto {
  isExactMatch: boolean;
  match?: CatalogResolutionDto | null;
  candidates: CatalogResolutionDto[];
}

// ── Delta sync ──────────────────────────────────────────────────────────────

/** One catalogue entry as a till needs it — enough to search, scan and price offline. */
export interface CatalogSyncEntryDto {
  itemId: string;
  code: string;
  name: string;
  categoryId?: string | null;
  categoryName?: string | null;
  itemType?: string | null;
  trackingType?: string | null;
  baseUnitId: string;
  baseUnitName?: string | null;
  listPrice?: number | null;
  /** Primary image URL (API-relative) for the till's product grid. */
  imageUrl?: string | null;
  isActive: boolean;
  /** True when the row should be dropped locally — deleted or deactivated. */
  isDeleted: boolean;
  changedAt: string;
  barcodes: CatalogSyncBarcodeDto[];
  variants: CatalogSyncVariantDto[];
}

export interface CatalogSyncBarcodeDto {
  barcode: string;
  unitId?: string | null;
  unitName?: string | null;
  /** Base units this barcode represents — 24 for a case-of-24. */
  quantityInBaseUnits: number;
}

export interface CatalogSyncVariantDto {
  id: string;
  variantCode: string;
  variantName?: string | null;
  barcode?: string | null;
}

/** A page of changes. `nextSince`+`nextSinceId` form the keyset for the next call. */
export interface CatalogSyncPageDto {
  entries: CatalogSyncEntryDto[];
  nextSince?: string | null;
  nextSinceId?: string | null;
  hasMore: boolean;
  serverTime: string;
}
