import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowHighlighter } from '@nexcore/shared';
import { WarehouseService } from '../../services/warehouse.service';
import {
  WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto,
  BinDto, CreateBinDto,
} from '../../models/warehouse.model';
import { InventoryLookupService } from '../../services/inventory-lookup.service';
import { LookupItemDto } from '../../models/inventory-lookup.model';

@Component({
  selector: 'lib-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class WarehousesPage implements OnInit {
  items: WarehouseDto[] = [];
  loading = false; error = ''; showForm = false;
  editingItem: WarehouseDto | null = null;
  formTab: 'info' | 'bins' = 'info';

  /** Flashes the newly-created row green and floats it to the top. */
  highlighter = new RowHighlighter();
  private justCreated: WarehouseDto | null = null;

  filterSearch = '';
  filterStatus = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Warehouse fields
  formCode = ''; formName = ''; formAddress = ''; formCity = '';
  formRegion = ''; formPostalCode = ''; formCountry = '';
  formWarehouseType = ''; formIsActive = true;
  warehouseTypes: LookupItemDto[] = [];

  // Bin management
  bins: BinDto[] = [];
  binsLoading = false;
  newBin: CreateBinDto = { warehouseId: '', code: '', name: '', aisle: '', rack: '', level: '', position: '', capacity: null };
  binError = '';

  page = 1; pageSize = 10; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private service: WarehouseService,
    private lookup: InventoryLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.lookup.getWarehouseTypes().subscribe({ next: (res) => { this.warehouseTypes = res.data ?? []; this.cdr.detectChanges(); } });
  }

  private searchDebounce: any;
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterSearch = ''; this.filterStatus = ''; this.page = 1; this.load(); }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy, sortDirection: this.sortDirection,
      isActive: this.filterStatus === '' ? undefined : this.filterStatus === 'active',
    }).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load warehouses'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  /** List ordered so the freshly-created row sits on top while it's highlighted. */
  get displayItems(): WarehouseDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(i => i.id === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  /** After a reload following a create, prepend the new row if it fell off the page/sort, then flash it. */
  private applyJustCreated(): void {
    const created = this.justCreated;
    if (!created) return;
    this.justCreated = null;
    if (!this.items.some(i => i.id === created.id)) this.items = [created, ...this.items];
    this.highlighter.flash(created.id, this.cdr);
  }

  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  openCreateForm(): void {
    this.editingItem = null;
    this.resetForm();
    this.formCode = `WHS-${(this.totalCount + 1).toString().padStart(6, '0')}`;
    this.formTab = 'info';
    this.showForm = true;
  }

  openEditForm(item: WarehouseDto): void {
    this.editingItem = item; this.formCode = item.code ?? ''; this.formName = item.name ?? '';
    this.formAddress = item.address ?? ''; this.formCity = item.city ?? '';
    this.formRegion = item.region ?? ''; this.formPostalCode = item.postalCode ?? '';
    this.formCountry = item.country ?? ''; this.formWarehouseType = item.warehouseType ?? '';
    this.formIsActive = item.isActive;
    this.formTab = 'info';
    this.bins = [];
    this.binError = '';
    this.resetNewBin(item.id);
    this.showForm = true;
    this.loadBins(item.id);
  }

  onTabChange(tab: 'info' | 'bins'): void {
    this.formTab = tab;
    if (tab === 'bins' && this.editingItem) this.loadBins(this.editingItem.id);
  }

  loadBins(warehouseId: string): void {
    this.binsLoading = true;
    this.service.getBins(warehouseId).subscribe({
      next: (res) => {
        this.bins = res.data ?? [];
        this.resetNewBin(warehouseId);
        this.binsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.binsLoading = false; this.cdr.detectChanges(); },
    });
  }

  resetNewBin(warehouseId: string): void {
    const nextCode = `BIN-${(this.bins.length + 1).toString().padStart(4, '0')}`;
    this.newBin = { warehouseId, code: nextCode, name: '', aisle: '', rack: '', level: '', position: '', capacity: null };
  }

  addBin(): void {
    if (!this.editingItem) return;
    if (!this.newBin.code?.trim() && !this.newBin.name?.trim()) {
      this.binError = 'Bin code or name is required.'; this.cdr.detectChanges(); return;
    }
    this.binError = '';
    this.service.createBin(this.editingItem.id, { ...this.newBin, warehouseId: this.editingItem.id }).subscribe({
      next: (res) => {
        if (!res.success) { this.binError = res.message || 'Failed to create bin'; this.cdr.detectChanges(); return; }
        this.resetNewBin(this.editingItem!.id);
        this.loadBins(this.editingItem!.id);
      },
      error: (err: HttpErrorResponse) => { this.binError = err.error?.message || 'Failed to create bin'; this.cdr.detectChanges(); },
    });
  }

  deleteBin(bin: BinDto): void {
    if (!confirm(`Delete bin "${bin.code || bin.name}"?`)) return;
    this.service.deleteBin(bin.id).subscribe({
      next: () => { if (this.editingItem) this.loadBins(this.editingItem.id); },
      error: (err: HttpErrorResponse) => { this.binError = err.error?.message || 'Failed to delete bin'; this.cdr.detectChanges(); },
    });
  }

  resetForm(): void {
    this.formCode = ''; this.formName = ''; this.formAddress = ''; this.formCity = '';
    this.formRegion = ''; this.formPostalCode = ''; this.formCountry = '';
    this.formWarehouseType = ''; this.formIsActive = true;
    this.bins = []; this.binError = '';
  }

  cancelForm(): void { this.showForm = false; this.editingItem = null; this.resetForm(); }

  save(): void {
    if (!this.formName.trim()) { this.error = 'Warehouse name is required.'; this.cdr.detectChanges(); return; }
    const obs = this.editingItem
      ? this.service.update(this.editingItem.id, {
          code: this.formCode || null, name: this.formName || null,
          address: this.formAddress || null, city: this.formCity || null,
          region: this.formRegion || null, postalCode: this.formPostalCode || null,
          country: this.formCountry || null, warehouseType: this.formWarehouseType || null,
          isActive: this.formIsActive,
        } as UpdateWarehouseDto)
      : this.service.create({
          code: this.formCode || null, name: this.formName || null,
          address: this.formAddress || null, city: this.formCity || null,
          region: this.formRegion || null, postalCode: this.formPostalCode || null,
          country: this.formCountry || null, warehouseType: this.formWarehouseType || null,
        } as CreateWarehouseDto);
    const isCreate = !this.editingItem;
    obs.subscribe({
      next: (res) => {
        if (!res.success) { this.error = res.message || 'Failed to save'; this.cdr.detectChanges(); return; }
        if (isCreate) this.justCreated = res.data ?? null;
        this.showForm = false; this.load();
      },
      error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to save'; this.cdr.detectChanges(); },
    });
  }

  delete(item: WarehouseDto): void {
    if (!confirm(`Delete warehouse "${item.name}"? This cannot be undone.`)) return;
    this.service.delete(item.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to delete'; this.cdr.detectChanges(); },
    });
  }
}
