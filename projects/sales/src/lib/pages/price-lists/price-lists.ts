import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceListService } from '../../services/price-list.service';
import { PriceListDto, CreatePriceListDto, UpdatePriceListDto } from '../../models/price-list.model';
import { CurrencyService } from '../../services/currency.service';
import { GeoCurrencyDto } from '../../models/currency.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-price-lists',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
