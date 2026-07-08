import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryReportService } from '../../services/inventory-report.service';
import { WarehouseService } from '../../services/warehouse.service';
import { ItemService } from '../../services/item.service';
import {
  StockLedgerReportDto,
  StockValuationReportDto,
  InventoryAgingReportDto,
  LowStockAlertDto,
} from '../../models/inventory-report.model';
import { InventoryBalanceReportDto } from '../../models/inventory-balance.model';
import { WarehouseDto } from '../../models/warehouse.model';
import { ItemDto } from '../../models/item.model';

type ReportTab = 'stockSummary' | 'stockLedger' | 'valuation' | 'aging' | 'lowStock';

@Component({
  selector: 'lib-inventory-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-reports.html',
  styleUrl: './inventory-reports.css',
})
export class InventoryReportsPage implements OnInit {
  activeTab: ReportTab = 'stockSummary';

  warehouses: WarehouseDto[] = [];
  items: ItemDto[] = [];

  // Stock Summary
  stockSummary: InventoryBalanceReportDto[] = [];
  summaryWarehouseId = '';
  summaryPage = 1;
  summaryPageSize = 25;
  summaryTotal = 0;
  summaryTotalPages = 1;
  summaryPageSizeOptions = [10, 25, 50, 100];

  // Stock Ledger — both required by backend
  ledger: StockLedgerReportDto[] = [];
  ledgerItemId = '';
  ledgerWarehouseId = '';
  ledgerFrom = '';
  ledgerTo = '';

  // Stock Valuation
  valuation: StockValuationReportDto[] = [];
  valuationAsOfDate = '';

  // Inventory Aging
  aging: InventoryAgingReportDto[] = [];
  agingWarehouseId = '';

  // Low Stock
  lowStock: LowStockAlertDto[] = [];

  loading = false;
  error = '';

  constructor(
    private service: InventoryReportService,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load dropdowns with a large page to cover most real-world datasets
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.warehouses = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.itemService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.items = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.loadStockSummary();
  }

  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.error = '';
    // Auto-load on switch except stock ledger (requires item+warehouse selection)
    switch (tab) {
      case 'stockSummary': this.loadStockSummary(); break;
      case 'valuation':    if (!this.valuation.length) this.loadValuation(); break;
      case 'aging':        if (!this.aging.length) this.loadAging(); break;
      case 'lowStock':     if (!this.lowStock.length) this.loadLowStock(); break;
      // stockLedger: user must pick item + warehouse then click Run
    }
  }

  // ── Stock Summary ────────────────────────────────────────────
  loadStockSummary(): void {
    this.loading = true; this.error = '';
    this.service.getStockSummary(this.summaryWarehouseId || undefined, {
      pageNumber: this.summaryPage, pageSize: this.summaryPageSize,
    }).subscribe({
      next: (res) => {
        this.stockSummary = res.data ?? [];
        this.summaryTotal = res.pagination?.totalCount ?? res.totalCount ?? this.stockSummary.length;
        this.summaryPage = res.pagination?.pageNumber ?? res.pageNumber ?? this.summaryPage;
        this.summaryTotalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.summaryTotal / this.summaryPageSize);
        if (this.summaryTotalPages < 1) this.summaryTotalPages = 1;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load stock summary'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  summaryGoToPage(p: number): void { this.summaryPage = p; this.loadStockSummary(); }
  summaryPageSizeChange(): void { this.summaryPage = 1; this.loadStockSummary(); }

  // ── Stock Ledger ─────────────────────────────────────────────
  loadLedger(): void {
    if (!this.ledgerItemId) { this.error = 'Please select an item.'; this.cdr.detectChanges(); return; }
    if (!this.ledgerWarehouseId) { this.error = 'Please select a warehouse.'; this.cdr.detectChanges(); return; }
    this.loading = true; this.error = '';
    this.service.getStockLedger(
      this.ledgerItemId,
      this.ledgerWarehouseId,
      this.ledgerFrom || undefined,
      this.ledgerTo || undefined
    ).subscribe({
      next: (res) => { this.ledger = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load stock ledger'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Stock Valuation ──────────────────────────────────────────
  loadValuation(): void {
    this.loading = true; this.error = '';
    this.service.getStockValuation(this.valuationAsOfDate || undefined).subscribe({
      next: (res) => { this.valuation = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load stock valuation'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Inventory Aging ──────────────────────────────────────────
  loadAging(): void {
    this.loading = true; this.error = '';
    this.service.getInventoryAging(this.agingWarehouseId || undefined).subscribe({
      next: (res) => { this.aging = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load inventory aging'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Low Stock Alerts ─────────────────────────────────────────
  loadLowStock(): void {
    this.loading = true; this.error = '';
    this.service.getLowStockAlert().subscribe({
      next: (res) => { this.lowStock = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load low stock alerts'; this.loading = false; this.cdr.detectChanges(); },
    });
  }
}
