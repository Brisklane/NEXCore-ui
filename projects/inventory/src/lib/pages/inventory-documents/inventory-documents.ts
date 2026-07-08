import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowHighlighter } from '@nexcore/shared';
import { InventoryDocumentService } from '../../services/inventory-document.service';
import { InventoryDocumentDto } from '../../models/inventory-document.model';
import { ItemService } from '../../services/item.service';
import { WarehouseService } from '../../services/warehouse.service';
import { UnitService } from '../../services/unit.service';
import { ItemDto } from '../../models/item.model';
import { WarehouseDto } from '../../models/warehouse.model';
import { UnitDto } from '../../models/unit.model';

@Component({
  selector: 'lib-inventory-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-documents.html',
  styleUrl: './inventory-documents.css',
})
export class InventoryDocumentsPage implements OnInit {
  items: InventoryDocumentDto[] = [];
  loading = false;
  error = '';
  success = '';

  filterSearch = '';
  filterDocumentType = '';
  filterStatus = '';

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  posting = false;
  postingId = '';

  // Lookups (for resolving names in the detail view)
  itemsLookup: ItemDto[] = [];
  warehouses: WarehouseDto[] = [];
  units: UnitDto[] = [];

  // Detail modal
  detailDoc: InventoryDocumentDto | null = null;
  detailLoading = false;

  page = 1; pageSize = 25; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  /** Documents are created elsewhere; the only mutation here is Post — flash the row just posted. */
  highlighter = new RowHighlighter();
  private justPostedId: string | null = null;

  get displayItems(): InventoryDocumentDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(d => d.id === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  constructor(
    private service: InventoryDocumentService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private unitService: UnitService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.itemService.getAll({ pageNumber: 1, pageSize: 500 }).subscribe({ next: (r) => { this.itemsLookup = r.data ?? []; this.cdr.detectChanges(); } });
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.warehouses = r.data ?? []; this.cdr.detectChanges(); } });
    this.unitService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.units = r.data ?? []; this.cdr.detectChanges(); } });
  }

  itemName(id: string): string { const i = this.itemsLookup.find(x => x.id === id); return i ? `${i.code} — ${i.name}` : id; }
  warehouseName(id: string): string { return this.warehouses.find(w => w.id === id)?.name ?? id; }
  unitName(id: string): string { return this.units.find(u => u.id === id)?.name ?? id; }

  viewDocument(doc: InventoryDocumentDto): void {
    this.detailDoc = doc;
    this.detailLoading = true;
    this.error = '';
    this.service.getById(doc.id).subscribe({
      next: (res) => { this.detailDoc = res.data ?? doc; this.detailLoading = false; this.cdr.detectChanges(); },
      error: () => { this.detailLoading = false; this.cdr.detectChanges(); },
    });
  }

  closeDetail(): void { this.detailDoc = null; this.cdr.detectChanges(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll(
      { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection },
      this.filterDocumentType || undefined,
      this.filterStatus || undefined,
    ).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (this.totalPages < 1) this.totalPages = 1;
        if (this.justPostedId) { this.highlighter.flash(this.justPostedId, this.cdr); this.justPostedId = null; }
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load inventory documents'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

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

  private searchDebounce: any;
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterSearch = ''; this.filterDocumentType = ''; this.filterStatus = ''; this.page = 1; this.load(); }
  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  statusClass(status: string | null): string {
    const s = (status ?? '').toUpperCase();
    if (s === 'POSTED') return 'badge badge-posted';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'badge badge-cancelled';
    return 'badge badge-draft';
  }

  statusLabel(status: string | null): string {
    const s = (status ?? '').toUpperCase();
    if (s === 'POSTED') return 'Posted';
    if (s === 'CANCELLED' || s === 'CANCELED') return 'Cancelled';
    return status ?? 'Draft';
  }

  postDocument(doc: InventoryDocumentDto): void {
    if (!confirm(`Post document ${doc.documentNumber}? This will update inventory balances.`)) return;
    this.postingId = doc.id;
    this.posting = true;
    this.error = '';
    this.service.post(doc.id, {
      documentId: doc.id,
      postingDate: new Date().toISOString().split('T')[0],
    }).subscribe({
      next: (res) => {
        this.posting = false; this.postingId = '';
        if (!res.success) { this.error = res.message || 'Failed to post document'; this.cdr.detectChanges(); return; }
        this.success = `Document ${doc.documentNumber} posted successfully.`;
        this.justPostedId = doc.id;
        this.load();
        if (this.detailDoc?.id === doc.id) { this.viewDocument(doc); }
      },
      error: (err: HttpErrorResponse) => {
        this.posting = false; this.postingId = '';
        this.error = err.error?.message || 'Failed to post document.';
        this.cdr.detectChanges();
      },
    });
  }
}
