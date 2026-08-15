import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceListService } from '../../services/price-list.service';
import { PriceListDto, CreatePriceListDto, UpdatePriceListDto,
         PriceListItemDto } from '../../models/price-list.model';
import { CatalogService, CatalogResolutionDto } from '@nexcore/inventory';
import { SearchableSelect, SearchableOption } from '@nexcore/core';
import { firstValueFrom } from 'rxjs';
import { CurrencyService } from '../../services/currency.service';
import { GeoCurrencyDto } from '../../models/currency.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-price-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './price-lists.html',
  styleUrl: './price-lists.css',
})
export class PriceListsComponent implements OnInit {
  priceLists: PriceListDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showForm = false;
  editingItem: PriceListDto | null = null;

  // ── Lines ───────────────────────────────────────────────────────────────
  /** Priced lines for the selected list. */
  lines: PriceListItemDto[] = [];
  linesLoading = false;
  lineError = '';

  /** Product suggestions for the picker, fed by the catalogue resolver. */
  productOptions: SearchableOption[] = [];
  productSearching = false;
  private productsById = new Map<string, CatalogResolutionDto>();

  newLine: {
    productId: string;
    unitPrice: number | null;
    minQuantity: number | null;
    maxQuantity: number | null;
  } = { productId: '', unitPrice: null, minQuantity: null, maxQuantity: null };
  searchQuery = '';
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  formCode = '';
  formName = '';
  formCurrencyCode = '';
  formValidFrom = '';
  formValidTo = '';
  formIsActive = true;
  formAutoCode = true;

  currencies: GeoCurrencyDto[] = [];

  /** True when a manually-typed code clashes with an existing price list. */
  get codeTaken(): boolean {
    if (this.formAutoCode || this.editingItem) return false;
    const code = this.formCode.trim().toUpperCase();
    if (!code) return false;
    return this.priceLists.some(pl =>
      pl.id !== this.editingItem?.id &&
      (pl.code ?? '').toUpperCase() === code);
  }
  onAutoCodeToggle() {
    this.formCode = this.formAutoCode ? this.nextPriceListCode() : '';
  }

  get filteredPriceLists(): PriceListDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    let rows = !q ? [...this.priceLists] : this.priceLists.filter(pl =>
      (pl.code ?? '').toLowerCase().includes(q) ||
      (pl.name ?? '').toLowerCase().includes(q) ||
      (pl.currencyCode ?? '').toLowerCase().includes(q)
    );
    rows = [...rows];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  constructor(
    private priceListService: PriceListService,
    private currencyService: CurrencyService,
    private catalog: CatalogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
    this.currencyService.getGeoCurrencies().subscribe({
      next: (res) => { this.currencies = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  /** Normalise an ISO date/datetime to the yyyy-MM-dd a <input type="date"> needs. */
  private toDateInput(value: string | null): string {
    if (!value) return '';
    return value.length >= 10 ? value.substring(0, 10) : value;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.priceListService.getAll().subscribe({
      next: (res) => {
        this.priceLists = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load price lists.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingItem = null;
    this.resetForm();
    this.formAutoCode = true;
    this.formCode = this.nextPriceListCode();
    this.showForm = true;
  }

  /** Preview of the next sequential code (PL-####) — mirrors the backend generator. */
  private nextPriceListCode(): string {
    let max = 0;
    for (const pl of this.priceLists) {
      const c = pl.code ?? '';
      if (/^PL-\d+$/i.test(c)) {
        const n = parseInt(c.slice(3), 10);
        if (n > max) max = n;
      }
    }
    return `PL-${String(max + 1).padStart(4, '0')}`;
  }

  /** Active only while not expired — a past Valid To means it's no longer active. */
  statusLabel(pl: PriceListDto): string {
    if (pl.validTo && new Date(pl.validTo) < new Date()) return 'Expired';
    return pl.isActive ? 'Active' : 'Inactive';
  }
  statusBadgeClass(pl: PriceListDto): string {
    return this.statusLabel(pl) === 'Active' ? 'badge badge-active' : 'badge badge-inactive';
  }

  openEditForm(item: PriceListDto) {
    void this.loadLines(item.id);
    this.editingItem = item;
    this.formCode = item.code ?? '';
    this.formName = item.name ?? '';
    this.formCurrencyCode = item.currencyCode ?? '';
    this.formValidFrom = this.toDateInput(item.validFrom);
    this.formValidTo = this.toDateInput(item.validTo);
    this.formIsActive = item.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formCurrencyCode = '';
    this.formValidFrom = '';
    this.formValidTo = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingItem = null;
    this.resetForm();
  }

  save() {
    if (!this.formName) {
      this.error = 'Name is required.';
      return;
    }
    if (!this.editingItem && !this.formAutoCode && !this.formCode.trim()) {
      this.error = 'Enter a code or switch to auto-generate.';
      return;
    }
    if (this.codeTaken) {
      this.error = `Code "${this.formCode}" is already in use.`;
      return;
    }
    if (this.editingItem) {
      const dto: UpdatePriceListDto = {
        name: this.formName,
        currencyCode: this.formCurrencyCode || null,
        isActive: this.formIsActive,
        validFrom: this.formValidFrom || null,
        validTo: this.formValidTo || null,
      };
      this.priceListService.update(this.editingItem.id, dto).subscribe({
        next: () => {
          this.successMsg = 'Price list updated.';
          this.cancelForm();
          this.load();
        },
        error: () => {
          this.error = 'Failed to update price list.';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreatePriceListDto = {
        // Auto: send empty so the backend assigns a unique code. Manual: send the typed code.
        code: this.formAutoCode ? '' : this.formCode.trim(),
        name: this.formName,
        currencyCode: this.formCurrencyCode || null,
        validFrom: this.formValidFrom || null,
        validTo: this.formValidTo || null,
      };
      this.priceListService.create(dto).subscribe({
        next: (res) => {
          this.successMsg = 'Price list created.';
          this.cancelForm();
          this.load();
          this.highlighter.flash(res.data?.id, this.cdr);
        },
        error: () => {
          this.error = 'Failed to create price list.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  // ── Lines ───────────────────────────────────────────────────────────────

  private async loadLines(priceListId?: string): Promise<void> {
    this.lines = [];
    this.lineError = '';
    this.resetNewLine();
    if (!priceListId) return;

    this.linesLoading = true;
    const res = await firstValueFrom(this.priceListService.getItems(priceListId)).catch(() => null);
    this.lines = res?.data ?? [];
    this.linesLoading = false;

    // Names aren't stored on the line, so resolve the ones we're showing.
    await this.labelProducts(this.lines.map(l => l.productId));
    this.cdr.detectChanges();
  }

  /** Fill in product code/name for lines, using the catalogue resolver. */
  private async labelProducts(ids: string[]): Promise<void> {
    for (const id of new Set(ids)) {
      if (this.productsById.has(id)) continue;
      // The resolver matches by code, so ask by id through the item search fallback.
      const hit = await firstValueFrom(this.catalog.search(id, 1)).catch(() => []);
      if (hit[0]) this.productsById.set(id, hit[0]);
    }
  }

  productLabel(productId: string): string {
    const hit = this.productsById.get(productId);
    return hit ? `${hit.itemCode} — ${hit.itemName}` : productId.slice(0, 8) + '…';
  }

  async onProductSearch(term: string): Promise<void> {
    if (!term?.trim()) { this.productOptions = []; return; }
    this.productSearching = true;
    const results = await firstValueFrom(this.catalog.search(term, 25)).catch(() => []);
    for (const r of results) this.productsById.set(r.itemId, r);
    this.productOptions = results.map(r => ({
      value: r.itemId,
      label: `${r.itemCode} — ${r.itemName}`,
    }));
    this.productSearching = false;
    this.cdr.detectChanges();
  }

  private resetNewLine(): void {
    this.newLine = { productId: '', unitPrice: null, minQuantity: null, maxQuantity: null };
    this.productOptions = [];
  }

  async addLine(): Promise<void> {
    const list = this.editingItem;
    if (!list?.id) { this.lineError = 'Save the price list first.'; return; }

    const { productId, unitPrice, minQuantity, maxQuantity } = this.newLine;
    if (!productId) { this.lineError = 'Pick a product.'; return; }
    if (unitPrice == null || unitPrice < 0) { this.lineError = 'Enter a price.'; return; }
    if (minQuantity != null && maxQuantity != null && minQuantity > maxQuantity) {
      this.lineError = 'Minimum quantity cannot exceed the maximum.'; return;
    }

    this.lineError = '';
    const res = await firstValueFrom(
      this.priceListService.addItem(list.id, { productId, unitPrice, minQuantity, maxQuantity })
    ).catch((e: any) => {
      // The API rejects overlapping quantity bands — surface that verbatim.
      this.lineError = e?.error?.message ?? 'Could not add that line.';
      return null;
    });

    if (res?.data) {
      this.lines = [...this.lines, res.data];
      this.resetNewLine();
    }
    this.cdr.detectChanges();
  }

  async savePrice(line: PriceListItemDto, value: string): Promise<void> {
    const price = parseFloat(value);
    if (isNaN(price) || price < 0) return;
    if (price === line.unitPrice) return;

    const res = await firstValueFrom(
      this.priceListService.updateItem(line.id, { unitPrice: price })
    ).catch(() => null);

    if (res?.data) line.unitPrice = res.data.unitPrice;
    else this.lineError = 'Could not update that price.';
    this.cdr.detectChanges();
  }

  async removeLine(line: PriceListItemDto): Promise<void> {
    await firstValueFrom(this.priceListService.deleteItem(line.id)).catch(() => null);
    this.lines = this.lines.filter(l => l.id !== line.id);
    this.cdr.detectChanges();
  }

  /** Human-readable quantity band; null bounds are unbounded. */
  band(line: PriceListItemDto): string {
    const lo = line.minQuantity ?? null;
    const hi = line.maxQuantity ?? null;
    if (lo == null && hi == null) return 'Any qty';
    if (hi == null) return `${lo}+`;
    if (lo == null) return `up to ${hi}`;
    return `${lo}–${hi}`;
  }

  delete(id: string) {
    if (!confirm('Delete this price list?')) return;
    this.priceListService.delete(id).subscribe({
      next: () => {
        this.successMsg = 'Price list deleted.';
        this.load();
      },
      error: () => {
        this.error = 'Failed to delete price list.';
        this.cdr.detectChanges();
      },
    });
  }
}
