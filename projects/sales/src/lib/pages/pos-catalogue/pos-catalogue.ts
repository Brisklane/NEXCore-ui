import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  ItemService, ItemDto, CreateItemDto, UpdateItemDto,
  ItemCategoryService, ItemCategoryDto,
  UnitService, UnitDto, ItemUomConversionDto,
  CatalogService, CatalogResolutionDto,
} from '@nexcore/inventory';
import { SearchableSelect, SearchableOption } from '@nexcore/core';

/** One variant row being edited. `id` absent = a new variant. */
interface VariantRow {
  id: string | null;
  variantCode: string;
  variantName: string;
  barcode: string;
  isActive: boolean;
}

/** One barcode row being edited. */
interface BarcodeRow {
  barcode: string;
  /** Null = the item's base unit. A non-base unit means this is a pack/case barcode. */
  unitId: string | null;
  isPrimary: boolean;
}

/**
 * POS catalogue — the shop-floor view of the product list.
 *
 * Deliberately not a second copy of the full Inventory item editor: this covers what a
 * store actually maintains day to day (name, SKU, category, price, barcodes) and writes
 * through the same Item API, so there is one source of truth.
 *
 * The barcode editor is the point of the screen. Product identity spans item SKU, item
 * barcodes and variant codes, and a barcode can belong to a non-base unit — that last
 * part is what makes a case of 24 ring up as 24 rather than 1, and there was previously
 * nowhere in the POS to set it.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-catalogue',
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './pos-catalogue.html',
  styleUrls: ['./pos-catalogue.css'],
})
export class PosCatalogueComponent implements OnInit {
  private items = inject(ItemService);
  private categories = inject(ItemCategoryService);
  private units = inject(UnitService);
  private catalog = inject(CatalogService);
  private cdr = inject(ChangeDetectorRef);

  rows: CatalogResolutionDto[] = [];
  /** Conversions for the product being edited — what makes a pack barcode work. */
  conversions: ItemUomConversionDto[] = [];
  newConversion: { fromUnitId: string; factor: number | null } = { fromUnitId: '', factor: null };
  categoryList: ItemCategoryDto[] = [];
  unitList: UnitDto[] = [];

  query = '';
  loading = false;
  saving = false;
  error = '';
  notice = '';

  /** Null when the editor is closed. */
  editing: {
    id: string | null;
    code: string;
    name: string;
    categoryId: string;
    baseUnitId: string;
    salePrice: number | null;
    isActive: boolean;
    barcodes: BarcodeRow[];
    variants: VariantRow[];
  } | null = null;

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadReferenceData(), this.search()]);
  }

  private async loadReferenceData(): Promise<void> {
    const [cats, units] = await Promise.all([
      firstValueFrom(this.categories.getActive()).catch(() => null),
      firstValueFrom(this.units.getActive()).catch(() => null),
    ]);
    this.categoryList = cats?.data ?? [];
    this.unitList = units?.data ?? [];
    this.cdr.detectChanges();
  }

  // ── Listing ───────────────────────────────────────────────────────────

  /**
   * Server-side search, so this screen scales with the catalogue rather than loading it.
   * Reuses the same resolver the till scans through, which means searching by barcode or
   * variant SKU works here exactly as it does at the register.
   */
  async search(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.rows = await firstValueFrom(this.catalog.search(this.query.trim() || 'a', 100));
    } catch {
      this.error = 'Could not load products.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  categoryName(id?: string | null): string {
    return this.categoryList.find(c => c.id === id)?.name ?? '—';
  }

  unitName(id?: string | null): string {
    return this.unitList.find(u => u.id === id)?.name ?? '';
  }

  // ── Editor ────────────────────────────────────────────────────────────

  newProduct(): void {
    this.editing = {
      id: null,
      code: '',
      name: '',
      categoryId: this.categoryList[0]?.id ?? '',
      baseUnitId: this.unitList[0]?.id ?? '',
      salePrice: null,
      isActive: true,
      barcodes: [],
      variants: [],
    };
    this.conversions = [];
    this.newConversion = { fromUnitId: '', factor: null };
    this.notice = '';
    this.error = '';
  }

  async edit(row: CatalogResolutionDto): Promise<void> {
    this.error = '';
    this.notice = '';
    const res = await firstValueFrom(this.items.getById(row.itemId)).catch(() => null);
    const item = res?.data;
    if (!item) { this.error = 'Could not load that product.'; this.cdr.detectChanges(); return; }

    this.editing = {
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? '',
      categoryId: item.categoryId ?? '',
      baseUnitId: item.baseUnitId,
      salePrice: (item.prices ?? []).find(p => p.isActive)?.salePrice
        ?? (item.prices ?? [])[0]?.salePrice ?? null,
      isActive: item.isActive,
      barcodes: (item.barcodes ?? []).map(b => ({
        barcode: b.barcode ?? '',
        unitId: b.unitId ?? null,
        isPrimary: b.isPrimary,
      })),
      variants: (item.variants ?? []).map(v => ({
        id: v.id,
        variantCode: v.variantCode ?? '',
        variantName: v.variantName ?? '',
        barcode: v.barcode ?? '',
        isActive: v.isActive !== false,
      })),
    };

    await this.loadConversions(item.id);
    this.cdr.detectChanges();
  }

  private async loadConversions(itemId: string): Promise<void> {
    const res = await firstValueFrom(this.units.getConversionsByItem(itemId)).catch(() => null);
    this.conversions = res?.data ?? [];
  }

  cancel(): void {
    this.editing = null;
    this.error = '';
  }

  addBarcode(): void {
    this.editing?.barcodes.push({
      barcode: '',
      unitId: null,
      isPrimary: !this.editing.barcodes.length,
    });
  }

  removeBarcode(i: number): void {
    this.editing?.barcodes.splice(i, 1);
  }

  /** Only one barcode can be the primary one. */
  setPrimary(i: number): void {
    if (!this.editing) return;
    this.editing.barcodes.forEach((b, idx) => (b.isPrimary = idx === i));
  }

  /** A barcode on a non-base unit — i.e. a pack or case code. */
  isPackBarcode(row: BarcodeRow): boolean {
    return !!row.unitId && row.unitId !== this.editing?.baseUnitId;
  }

  /**
   * How many base units this pack barcode is worth, or null when no conversion exists.
   * Mirrors the server resolver: conversions are directional, so both directions count.
   */
  packSize(row: BarcodeRow): number | null {
    if (!this.isPackBarcode(row) || !this.editing) return null;
    const base = this.editing.baseUnitId;

    const forward = this.conversions.find(c => c.fromUnitId === row.unitId && c.toUnitId === base);
    if (forward?.conversionFactor) return forward.conversionFactor;

    const reverse = this.conversions.find(c => c.fromUnitId === base && c.toUnitId === row.unitId);
    if (reverse?.conversionFactor) return 1 / reverse.conversionFactor;

    return null;
  }

  /** True when a pack barcode has no conversion — it would sell as a single unit. */
  isPackUnresolved(row: BarcodeRow): boolean {
    return this.isPackBarcode(row) && this.packSize(row) == null;
  }

  /** Units that could sensibly be a pack — anything but the base unit. */
  get conversionFromOptions(): SearchableOption[] {
    return this.unitList
      .filter(u => u.id !== this.editing?.baseUnitId)
      .map(u => ({ value: u.id, label: u.name ?? '' }));
  }

  async addConversion(): Promise<void> {
    const e = this.editing;
    const { fromUnitId, factor } = this.newConversion;

    if (!e?.id) { this.error = 'Save the product first, then add pack sizes.'; return; }
    if (!fromUnitId) { this.error = 'Pick the pack unit.'; return; }
    if (!factor || factor <= 0) { this.error = 'Pack size must be greater than zero.'; return; }
    if (fromUnitId === e.baseUnitId) { this.error = 'The pack unit must differ from the base unit.'; return; }
    if (this.conversions.some(c => c.fromUnitId === fromUnitId && c.toUnitId === e.baseUnitId)) {
      this.error = 'That pack size is already defined.'; return;
    }

    this.error = '';
    const res = await firstValueFrom(
      this.units.createConversion(e.id, {
        fromUnitId,
        toUnitId: e.baseUnitId,
        conversionFactor: factor,
      })
    ).catch(() => null);

    if (!res?.data) { this.error = 'Could not save that pack size.'; this.cdr.detectChanges(); return; }

    await this.loadConversions(e.id);
    this.newConversion = { fromUnitId: '', factor: null };
    this.cdr.detectChanges();
  }

  async removeConversion(id: string): Promise<void> {
    await firstValueFrom(this.units.deleteConversion(id)).catch(() => null);
    if (this.editing?.id) await this.loadConversions(this.editing.id);
    this.cdr.detectChanges();
  }

  addVariant(): void {
    this.editing?.variants.push({
      id: null, variantCode: '', variantName: '', barcode: '', isActive: true,
    });
  }

  /**
   * Drops the row from the list. On save the API retires the variant rather than
   * deleting it, so stock, batches, serials and past sales keep resolving.
   */
  removeVariant(i: number): void {
    this.editing?.variants.splice(i, 1);
  }

  private validate(): string | null {
    const e = this.editing;
    if (!e) return 'Nothing to save.';
    if (!e.code.trim()) return 'SKU is required.';
    if (!e.name.trim()) return 'Name is required.';
    if (!e.categoryId) return 'Category is required.';
    if (!e.baseUnitId) return 'Base unit is required.';

    const codes = e.barcodes.map(b => b.barcode.trim()).filter(Boolean);
    if (codes.some(c => !c)) return 'Barcodes cannot be blank.';
    if (new Set(codes).size !== codes.length) return 'The same barcode is listed twice.';

    const variantCodes = e.variants.map(v => v.variantCode.trim());
    if (variantCodes.some(c => !c)) return 'Every variant needs a code.';
    if (new Set(variantCodes.map(c => c.toLowerCase())).size !== variantCodes.length)
      return 'The same variant code is listed twice.';

    const variantBarcodes = e.variants.map(v => v.barcode.trim()).filter(Boolean);
    if (new Set(variantBarcodes).size !== variantBarcodes.length)
      return 'The same variant barcode is listed twice.';

    // A variant barcode that collides with an item barcode would make scanning ambiguous.
    const clash = variantBarcodes.find(b => codes.includes(b));
    if (clash) return `Barcode ${clash} is used by both the product and a variant.`;

    return null;
  }

  async save(): Promise<void> {
    const problem = this.validate();
    if (problem) { this.error = problem; this.cdr.detectChanges(); return; }

    const e = this.editing!;
    this.saving = true;
    this.error = '';

    const barcodes = e.barcodes
      .filter(b => b.barcode.trim())
      .map(b => ({
        barcode: b.barcode.trim(),
        unitId: b.unitId ?? undefined,
        isPrimary: b.isPrimary,
        barcodeType: 'EAN13',
      }));

    // Both DTOs expose a quick `salePrice` that upserts the Default price-list entry
    // for the base unit. UpdateItemDto has no `prices` array at all, so sending one
    // would have been silently dropped.
    const salePrice = e.salePrice ?? undefined;

    // The two DTOs differ: update rows carry an `id` so the server can edit in place
    // (and retire omissions), create rows never do — every variant is new there.
    const variantRows = e.variants
      .filter(v => v.variantCode.trim())
      .map((v, index) => ({
        variantCode: v.variantCode.trim(),
        variantName: v.variantName.trim() || v.variantCode.trim(),
        barcode: v.barcode.trim() || undefined,
        isActive: v.isActive,
        displayOrder: index,
        _id: v.id,
      }));

    const variantsForUpdate = variantRows.map(({ _id, ...rest }) => ({
      ...rest,
      ...(_id ? { id: _id } : {}),
    }));
    const variantsForCreate = variantRows.map(({ _id, isActive, ...rest }) => rest);

    try {
      if (e.id) {
        const dto: UpdateItemDto = {
          code: e.code.trim(),
          name: e.name.trim(),
          categoryId: e.categoryId,
          baseUnitId: e.baseUnitId,
          isActive: e.isActive,
          barcodes,
          variants: variantsForUpdate,
          salePrice,
        } as UpdateItemDto;
        await firstValueFrom(this.items.update(e.id, dto));
      } else {
        const dto: CreateItemDto = {
          code: e.code.trim(),
          name: e.name.trim(),
          itemType: 'Inventory',
          categoryId: e.categoryId,
          baseUnitId: e.baseUnitId,
          isActive: e.isActive,
          barcodes,
          variants: variantsForCreate,
          salePrice,
        } as CreateItemDto;
        await firstValueFrom(this.items.create(dto));
      }

      this.notice = e.id ? 'Product updated.' : 'Product created.';
      this.editing = null;
      this.conversions = [];
      await this.search();
    } catch (err: any) {
      this.error = err?.error?.message ?? 'Could not save the product.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  // ── Options for the searchable pickers ────────────────────────────────

  get categoryOptions(): SearchableOption[] {
    return this.categoryList.map(c => ({ value: c.id, label: c.name ?? '' }));
  }

  get unitOptions(): SearchableOption[] {
    return this.unitList.map(u => ({ value: u.id, label: u.name ?? '' }));
  }

  /** Barcode unit picker: base unit first, then anything else the company uses. */
  get barcodeUnitOptions(): SearchableOption[] {
    return [
      { value: '', label: 'Base unit' },
      ...this.unitList
        .filter(u => u.id !== this.editing?.baseUnitId)
        .map(u => ({ value: u.id, label: u.name ?? '' })),
    ];
  }

  trackByItem = (_: number, r: CatalogResolutionDto) => r.itemId;
}
