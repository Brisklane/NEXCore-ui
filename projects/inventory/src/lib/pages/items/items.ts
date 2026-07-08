import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '@env';
import { RowHighlighter } from '@nexcore/shared';
import { ItemService } from '../../services/item.service';
import { InventoryLookupService } from '../../services/inventory-lookup.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryReportService } from '../../services/inventory-report.service';
import { WarehouseDto } from '../../models/warehouse.model';
import { ItemDto } from '../../models/item.model';
import { LookupItemDto } from '../../models/inventory-lookup.model';
import { ItemDetailPage } from '../item-detail/item-detail';

/** Products master–detail: product list on the left, live detail on the right. Create/edit → full-page editor. */
@Component({
  selector: 'lib-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemDetailPage],
  templateUrl: './items.html',
  styleUrl: './items.css',
})
export class ItemsPage implements OnInit {
  items: ItemDto[] = [];
  loading = false;
  error = '';

  /** Flashes a freshly-created row (shared pattern). */
  highlighter = new RowHighlighter();

  // KPIs
  kpiLowStock = 0;
  kpiOutOfStock = 0;
  kpiStockValue: number | null = null;
  readonly skeletonRows = [0, 1, 2, 3, 4, 5];

  // Lookups / filters data
  itemTypes: LookupItemDto[] = [];
  warehouses: WarehouseDto[] = [];

  // Stock totals per item (summed across warehouses)
  stockByItem: Record<string, { onHand: number; reserved: number; available: number }> = {};
  stockDetail: Record<string, { warehouseId: string; warehouseName: string; onHand: number; reserved: number; available: number }[]> = {};
  breakdownItem: { id: string; name: string } | null = null;
  breakdownLoading = false;

  // Paging / filtering / sorting
  page = 1; pageSize = 10; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  filterSearch = '';
  filterStatus = '';
  filterWarehouseId = '';
  filterItemType = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce: any;

  constructor(
    private service: ItemService,
    private lookup: InventoryLookupService,
    private warehouseService: WarehouseService,
    private reportService: InventoryReportService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadStock();
    this.loadKpis();
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); } });
    this.lookup.getItemTypes().subscribe({ next: (res) => { this.itemTypes = res.data ?? []; this.cdr.detectChanges(); } });
  }

  // Master–detail selection (the right pane loads this product)
  selectedId: string | null = null;
  selectProduct(item: ItemDto): void { this.selectedId = item.id; }
  clearSelection(): void { this.selectedId = null; }

  // ── Navigation ──────────────────────────────────────────────────────────
  openCreate(): void { this.router.navigate(['new'], { relativeTo: this.route }); }
  openEdit(item: ItemDto): void { this.router.navigate([item.id, 'edit'], { relativeTo: this.route }); }

  // ── Filtering / sorting / paging ────────────────────────────────────────
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => this.applyFilters(), 350); }
  clearFilters(): void { this.filterSearch = ''; this.filterStatus = ''; this.filterWarehouseId = ''; this.filterItemType = ''; this.page = 1; this.load(); }
  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.page = 1; this.load();
  }
  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy, sortDirection: this.sortDirection,
      isActive: this.filterStatus === '' ? undefined : this.filterStatus === 'active',
      warehouseId: this.filterWarehouseId || undefined,
    }, this.filterItemType || undefined).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false; this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to load items'); this.loading = false; this.cdr.detectChanges(); },
    });
    this.loadStock();
  }

  loadStock(): void {
    this.reportService.getStockByItem(this.filterWarehouseId || undefined).subscribe({
      next: (res) => {
        const map: Record<string, { onHand: number; reserved: number; available: number }> = {};
        for (const t of res.data ?? []) map[t.itemId] = { onHand: t.quantityOnHand ?? 0, reserved: t.quantityReserved ?? 0, available: t.quantityAvailable ?? 0 };
        this.stockByItem = map; this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  loadKpis(): void {
    this.reportService.getLowStockAlert().subscribe({
      next: (res) => {
        const rows = res.data ?? [];
        this.kpiLowStock = rows.length;
        this.kpiOutOfStock = rows.filter(r => (r.currentQuantity ?? 0) <= 0).length;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
    this.reportService.getStockValuation().subscribe({
      next: (res) => { this.kpiStockValue = (res.data ?? []).reduce((sum, r) => sum + (r.totalValue ?? 0), 0); this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  onHand(itemId: string): number { return this.stockByItem[itemId]?.onHand ?? 0; }
  reserved(itemId: string): number { return this.stockByItem[itemId]?.reserved ?? 0; }
  available(itemId: string): number { return this.stockByItem[itemId]?.available ?? 0; }

  stockStatus(item: ItemDto): 'in' | 'low' | 'out' {
    const oh = this.onHand(item.id);
    if (oh <= 0) return 'out';
    const reorder = item.reorderLevel ?? 0;
    if (reorder > 0 && oh <= reorder) return 'low';
    return 'in';
  }

  primaryImageUrl(item: ItemDto): string {
    const imgs = item.images ?? [];
    const primary = imgs.find(i => i.isPrimary) ?? imgs[0];
    return primary?.url ? this.resolveImageUrl(primary.url) : '';
  }
  itemInitial(item: ItemDto): string { const s = (item.name || item.code || '?').trim(); return s ? s.charAt(0).toUpperCase() : '?'; }
  onThumbError(event: Event): void { (event.target as HTMLImageElement).style.visibility = 'hidden'; }
  private resolveImageUrl(url: string | null): string { if (!url) return ''; return url.startsWith('/') ? environment.apiBaseUrl + url : url; }

  // ── Per-warehouse breakdown popup ───────────────────────────────────────
  showBreakdown(item: ItemDto): void {
    this.breakdownItem = { id: item.id, name: item.name ?? item.code ?? '' };
    this.breakdownLoading = !this.stockDetail[item.id];
    this.cdr.detectChanges();
    if (this.stockDetail[item.id]) return;
    this.reportService.getStockSummary(undefined, { pageNumber: 1, pageSize: 100, searchTerm: item.code ?? undefined }).subscribe({
      next: (res) => {
        this.stockDetail[item.id] = (res.data ?? []).filter(b => b.itemId === item.id).map(b => ({
          warehouseId: b.warehouseId, warehouseName: b.warehouseName ?? '', onHand: b.quantityOnHand ?? 0, reserved: b.quantityReserved ?? 0, available: b.quantityAvailable ?? 0,
        }));
        this.breakdownLoading = false; this.cdr.detectChanges();
      },
      error: () => { this.breakdownLoading = false; this.cdr.detectChanges(); },
    });
  }
  closeBreakdown(): void { this.breakdownItem = null; this.cdr.detectChanges(); }
  get breakdownRows() { return this.breakdownItem ? (this.stockDetail[this.breakdownItem.id] ?? []) : []; }

  get displayItems(): ItemDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(i => i.id === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  deleteItem(item: ItemDto): void {
    if (!confirm(`Delete item "${item.name}"? This cannot be undone.`)) return;
    this.service.delete(item.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to delete item'); this.cdr.detectChanges(); },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const body = err.error;
    const serverErrors: string[] = Array.isArray(body?.errors) ? body.errors : [];
    const serverMsg: string = typeof body?.message === 'string' ? body.message.trim() : '';
    if (serverErrors.length) return `${fallback}: ${serverErrors.join(' | ')}`;
    if (serverMsg) return `${fallback}: ${serverMsg}`;
    return fallback;
  }
}
