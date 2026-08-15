import { CatalogService, CachedCatalogItem } from './catalog.service';
import { CatalogMatchType } from '../models/catalog-resolution.model';

/**
 * Covers the OFFLINE resolution path. A till that loses connectivity must keep the same
 * precedence the server applies — exact identifiers first, most specific first — rather
 * than reverting to the substring matching that used to ring up the wrong product.
 *
 * The service is constructed directly: resolveLocal touches neither HttpClient nor the
 * auth helper, so no TestBed is needed.
 */
describe('CatalogService.resolveLocal', () => {
  const service = new CatalogService(null as any, null as any);

  const cola: CachedCatalogItem = {
    id: 'item-cola',
    code: 'COLA-330',
    name: 'Cola 330ml',
    baseUnitId: 'unit-pcs',
    baseUnitName: 'Pieces',
    listPrice: 150,
    barcodes: [
      { barcode: '5000112637922', unitId: null, unitName: 'Pieces', quantityInBaseUnits: 1 },
      { barcode: '5000112600001', unitId: 'unit-case', unitName: 'Case', quantityInBaseUnits: 24 },
    ],
    variants: [
      { id: 'var-diet', variantCode: 'COLA-330-DIET', variantName: 'Diet', barcode: '5000112699999' },
    ],
  };

  const water: CachedCatalogItem = {
    id: 'item-water',
    code: 'WATER-500',
    name: 'Water 500ml',
    baseUnitId: 'unit-pcs',
    barcodes: [{ barcode: '5000112600002', quantityInBaseUnits: 1 }],
    variants: [],
  };

  const snapshot = [cola, water];

  it('resolves an item barcode to the base unit', () => {
    const r = service.resolveLocal('5000112637922', snapshot);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.matchType).toBe(CatalogMatchType.ItemBarcode);
    expect(r.match!.itemId).toBe('item-cola');
    expect(r.match!.quantityInBaseUnits).toBe(1);
  });

  it('resolves a case barcode to the case unit and its pack size', () => {
    const r = service.resolveLocal('5000112600001', snapshot);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.unitId).toBe('unit-case');
    expect(r.match!.quantityInBaseUnits).toBe(24);
  });

  it('resolves a variant barcode to the variant', () => {
    const r = service.resolveLocal('5000112699999', snapshot);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.matchType).toBe(CatalogMatchType.VariantBarcode);
    expect(r.match!.variantId).toBe('var-diet');
  });

  it('resolves a variant SKU to the variant', () => {
    const r = service.resolveLocal('COLA-330-DIET', snapshot);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.matchType).toBe(CatalogMatchType.VariantCode);
    expect(r.match!.variantCode).toBe('COLA-330-DIET');
  });

  it('matches an item SKU case-insensitively', () => {
    const r = service.resolveLocal('cola-330', snapshot);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.matchType).toBe(CatalogMatchType.ItemCode);
  });

  it('does not treat a partial barcode as an exact match', () => {
    const r = service.resolveLocal('50001126', snapshot);

    expect(r.isExactMatch).toBe(false);
    expect(r.match).toBeFalsy();
  });

  it('offers name candidates when nothing matches exactly', () => {
    const r = service.resolveLocal('Cola', snapshot);

    expect(r.isExactMatch).toBe(false);
    expect(r.candidates.length).toBeGreaterThan(0);
    expect(r.candidates.every((c) => c.matchType === CatalogMatchType.Name)).toBe(true);
  });

  it('prefers the item barcode over a variant when both could match', () => {
    // Same string registered as an item barcode on one product and a variant barcode on
    // another: the more specific item-barcode match must win, deterministically.
    const collide: CachedCatalogItem = {
      id: 'item-collide',
      code: 'COLLIDE',
      name: 'Collide',
      baseUnitId: 'unit-pcs',
      barcodes: [],
      variants: [{ id: 'v1', variantCode: 'V1', barcode: '5000112637922' }],
    };

    const r = service.resolveLocal('5000112637922', [collide, cola]);

    expect(r.isExactMatch).toBe(true);
    expect(r.match!.matchType).toBe(CatalogMatchType.ItemBarcode);
    expect(r.match!.itemId).toBe('item-cola');
  });

  it('returns nothing for an empty code', () => {
    const r = service.resolveLocal('   ', snapshot);

    expect(r.isExactMatch).toBe(false);
    expect(r.candidates).toEqual([]);
  });
});
