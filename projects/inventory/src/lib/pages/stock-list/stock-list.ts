import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowHighlighter } from '@nexcore/shared';
import { InventoryReportService } from '../../services/inventory-report.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryDocumentService } from '../../services/inventory-document.service';
import { InventoryBalanceReportDto } from '../../models/inventory-balance.model';
import { WarehouseDto } from '../../models/warehouse.model';

@Component({
  selector: 'lib-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-list.html',
  styleUrl: './stock-list.css',
})
export class StockList implements OnInit {
  items: InventoryBalanceReportDto[] = [];
  warehouses: WarehouseDto[] = [];
  loading = false;
  error = '';
  success = '';

  filterWarehouseId = '';
  filterSearch = '';
  private searchDebounce: any;

  sortBy = 'itemCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  page = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  /** Row key = itemId + warehouseId (these rows have no single id). Used to flash the adjusted row. */
  rowKey(item: InventoryBalanceReportDto): string { return item.itemId + item.warehouseId; }
  highlighter = new RowHighlighter();
  private justAdjustedKey: string | null = null;

  /** Rows ordered so the just-adjusted row floats to the top while it's highlighted. */
  get displayItems(): InventoryBalanceReportDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(i => this.rowKey(i) === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  // Quick-adjust modal state
  adjustItem: InventoryBalanceReportDto | null = null;
  adjustNewQty: number = 0;
  adjustReason = '';
  adjustSaving = false;
  adjustError = '';

  constructor(
    private reportService: InventoryReportService,
    private warehouseService: WarehouseService,
    private documentService: InventoryDocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const pagination = {
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
    this.reportService.getStockSummary(this.filterWarehouseId || undefined, pagination).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? this.items.length;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (this.totalPages < 1) this.totalPages = 1;
        if (this.justAdjustedKey) { this.highlighter.flash(this.justAdjustedKey, this.cdr); this.justAdjustedKey = null; }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load stock data';
        this.loading = false;
        this.cdr.detectChanges();
      },
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

  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterWarehouseId = ''; this.filterSearch = ''; this.page = 1; this.load(); }
  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  stockStatus(item: InventoryBalanceReportDto): 'ok' | 'low' | 'out' {
    if (item.quantityAvailable <= 0) return 'out';
    if (item.quantityAvailable <= item.quantityReserved * 0.2) return 'low';
    return 'ok';
  }

  openAdjust(item: InventoryBalanceReportDto): void {
    this.adjustItem = item;
    this.adjustNewQty = item.quantityOnHand;
    this.adjustReason = '';
    this.adjustError = '';
    this.adjustSaving = false;
    this.success = '';
    this.cdr.detectChanges();
  }

  cancelAdjust(): void {
    this.adjustItem = null;
    this.cdr.detectChanges();
  }

  confirmAdjust(): void {
    if (!this.adjustItem) return;
    if (this.adjustNewQty < 0) {
      this.adjustError = 'Quantity cannot be negative.';
      this.cdr.detectChanges();
      return;
    }
    this.adjustSaving = true;
    this.adjustError = '';
    this.documentService.quickAdjust({
      itemId: this.adjustItem.itemId,
      warehouseId: this.adjustItem.warehouseId,
      newQuantity: this.adjustNewQty,
      reason: this.adjustReason || null,
    }).subscribe({
      next: (res) => {
        this.adjustSaving = false;
        if (!res.success) {
          this.adjustError = res.message || 'Adjustment failed.';
          this.cdr.detectChanges();
          return;
        }
        this.success = res.message || 'Quantity adjusted successfully.';
        this.justAdjustedKey = this.adjustItem ? this.rowKey(this.adjustItem) : null;
        this.adjustItem = null;
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.adjustSaving = false;
        this.adjustError = err.error?.message || 'Failed to adjust quantity.';
        this.cdr.detectChanges();
      },
    });
  }
}
