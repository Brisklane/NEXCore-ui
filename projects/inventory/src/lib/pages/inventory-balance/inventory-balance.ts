import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryReportService } from '../../services/inventory-report.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryBalanceReportDto } from '../../models/inventory-balance.model';
import { WarehouseDto } from '../../models/warehouse.model';

@Component({
  selector: 'lib-inventory-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-balance.html',
  styleUrl: './inventory-balance.css',
})
export class InventoryBalancePage implements OnInit {
  items: InventoryBalanceReportDto[] = [];
  warehouses: WarehouseDto[] = [];
  loading = false;
  error = '';

  filterWarehouseId = '';
  filterSearch = '';

  sortBy = 'itemCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  page = 1; pageSize = 25; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private service: InventoryReportService,
    private warehouseService: WarehouseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getStockSummary(this.filterWarehouseId || undefined, {
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    }).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? this.items.length;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (this.totalPages < 1) this.totalPages = 1;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load inventory balance'; this.loading = false; this.cdr.detectChanges(); },
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
  clearFilters(): void { this.filterWarehouseId = ''; this.filterSearch = ''; this.page = 1; this.load(); }
  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }

  get totalInventoryValue(): number {
    return this.items.reduce((s, i) => s + (i.totalValue ?? 0), 0);
  }
  get totalUnitsOnHand(): number {
    return this.items.reduce((s, i) => s + (i.quantityOnHand ?? 0), 0);
  }
  get totalUnitsReserved(): number {
    return this.items.reduce((s, i) => s + (i.quantityReserved ?? 0), 0);
  }
  get totalUnitsAvailable(): number {
    return this.items.reduce((s, i) => s + (i.quantityAvailable ?? 0), 0);
  }
  get uniqueItemCount(): number {
    return new Set(this.items.map(i => i.itemId)).size;
  }
}
