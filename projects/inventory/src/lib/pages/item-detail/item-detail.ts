import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env';
import { ItemService } from '../../services/item.service';
import { InventoryBalanceService } from '../../services/inventory-balance.service';
import { WarehouseService } from '../../services/warehouse.service';
import { ItemSerialService } from '../../services/item-serial.service';
import { ItemBatchService } from '../../services/item-batch.service';
import { InventoryReportService } from '../../services/inventory-report.service';
import { ItemDto } from '../../models/item.model';
import { InventoryBalanceDto } from '../../models/inventory-balance.model';
import { ItemSerialDto } from '../../models/item-serial.model';
import { ItemBatchDto } from '../../models/item-batch.model';
import { StockLedgerReportDto } from '../../models/inventory-report.model';
import { SERIAL_STATUS_META } from '../serial-lookup/serial-lookup';

type DetailTab = 'overview' | 'stock' | 'serials' | 'batches' | 'movement';

@Component({
  selector: 'lib-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.css',
})
export class ItemDetailPage implements OnInit, OnChanges {
  /** When embedded in the Products master–detail, the parent drives the selected id here. */
  @Input() itemIdInput?: string | null;
  @Input() embedded = false;
  @Output() closed = new EventEmitter<void>();

  itemId = '';
  item: ItemDto | null = null;
  loading = true;
  error = '';

  activeTab: DetailTab = 'overview';

  balances: InventoryBalanceDto[] = [];
  warehouseNames: Record<string, string> = {};

  serials: ItemSerialDto[] = [];
  serialsLoaded = false;
  serialTotal = 0;
  batches: ItemBatchDto[] = [];
  batchesLoaded = false;
  ledger: StockLedgerReportDto[] = [];
  ledgerLoaded = false;

  // Bulk-generate serials inline panel
  showGenerate = false;
  gen = { prefix: '', startNumber: 1, count: 10, padding: 5 };
  generating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private balanceService: InventoryBalanceService,
    private warehouseService: WarehouseService,
    private serialService: ItemSerialService,
    private batchService: ItemBatchService,
    private reportService: InventoryReportService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { for (const w of res.data ?? []) this.warehouseNames[w.id] = w.name ?? ''; this.cdr.detectChanges(); },
    });
    // Route-driven (standalone page). Embedded mode is driven by ngOnChanges instead.
    if (!this.embedded) {
      this.itemId = this.route.snapshot.paramMap.get('id') ?? '';
      if (this.itemId) this.load();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemIdInput'] && this.itemIdInput && this.itemIdInput !== this.itemId) {
      this.itemId = this.itemIdInput;
      this.load();
    }
  }

  /** Reset per-item state then (re)load the selected product. */
  private load(): void {
    this.item = null; this.error = '';
    this.activeTab = 'overview';
    this.balances = [];
    this.serials = []; this.serialsLoaded = false; this.serialTotal = 0;
    this.batches = []; this.batchesLoaded = false;
    this.ledger = []; this.ledgerLoaded = false;
    this.showGenerate = false;
    this.loadItem();
    this.loadBalances();
  }

  loadItem(): void {
    this.loading = true;
    this.itemService.getById(this.itemId).subscribe({
      next: (res) => {
        this.item = res.data ?? null;
        this.loading = false;
        this.cdr.detectChanges();
        // Default to the relevant tracking tab when the item is serial/lot tracked.
        if (this.item?.trackingType === 'Serial') this.setTab('serials');
        else if (this.item?.trackingType === 'Lot') this.setTab('batches');
      },
      error: (err: HttpErrorResponse) => { this.error = err?.error?.message || 'Failed to load item'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadBalances(): void {
    this.balanceService.getByItem(this.itemId).subscribe({
      next: (res) => { this.balances = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  setTab(tab: DetailTab): void {
    this.activeTab = tab;
    if (tab === 'serials' && !this.serialsLoaded) this.loadSerials();
    if (tab === 'batches' && !this.batchesLoaded) this.loadBatches();
    if (tab === 'movement' && !this.ledgerLoaded) this.loadLedger();
    this.cdr.detectChanges();
  }

  loadSerials(): void {
    this.serialService.getByItem(this.itemId, { pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => { this.serials = res.data ?? []; this.serialTotal = res.pagination?.totalCount ?? this.serials.length; this.serialsLoaded = true; this.cdr.detectChanges(); },
      error: () => { this.serialsLoaded = true; this.cdr.detectChanges(); },
    });
  }

  loadBatches(): void {
    this.batchService.getByItem(this.itemId).subscribe({
      next: (res) => { this.batches = res.data ?? []; this.batchesLoaded = true; this.cdr.detectChanges(); },
      error: () => { this.batchesLoaded = true; this.cdr.detectChanges(); },
    });
  }

  loadLedger(): void {
    this.reportService.getStockLedger(this.itemId).subscribe({
      next: (res) => { this.ledger = res.data ?? []; this.ledgerLoaded = true; this.cdr.detectChanges(); },
      error: () => { this.ledgerLoaded = true; this.cdr.detectChanges(); },
    });
  }

  generateSerials(): void {
    if (this.gen.count < 1) return;
    this.generating = true;
    this.serialService.bulkGenerate({
      itemId: this.itemId,
      prefix: this.gen.prefix,
      startNumber: this.gen.startNumber,
      count: this.gen.count,
      padding: this.gen.padding,
    }).subscribe({
      next: () => { this.generating = false; this.showGenerate = false; this.serialsLoaded = false; this.loadSerials(); },
      error: (err: HttpErrorResponse) => { this.error = err?.error?.message || 'Failed to generate serials'; this.generating = false; this.cdr.detectChanges(); },
    });
  }

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  get onHand(): number { return this.balances.reduce((s, b) => s + (b.quantityOnHand ?? 0), 0); }
  get reserved(): number { return this.balances.reduce((s, b) => s + (b.quantityReserved ?? 0), 0); }
  get available(): number { return this.balances.reduce((s, b) => s + (b.quantityAvailable ?? 0), 0); }
  get stockValue(): number { return this.balances.reduce((s, b) => s + (b.totalValue ?? 0), 0); }

  get stockStatus(): 'in' | 'low' | 'out' {
    if (this.onHand <= 0) return 'out';
    const reorder = this.item?.reorderLevel ?? 0;
    if (reorder > 0 && this.onHand <= reorder) return 'low';
    return 'in';
  }

  get trackingType(): string {
    return this.item?.trackingType ?? (this.item?.isSerialTracked ? 'Serial' : this.item?.isBatchTracked ? 'Lot' : 'None');
  }
  get trackingLabel(): string { return this.trackingType === 'Serial' ? 'Serial' : this.trackingType === 'Lot' ? 'Lot' : 'Qty'; }
  get trackingIcon(): string { return this.trackingType === 'Serial' ? 'barcode' : this.trackingType === 'Lot' ? 'inventory' : 'tag'; }

  itemInitial(): string { const s = (this.item?.name || this.item?.code || '?').trim(); return s ? s.charAt(0).toUpperCase() : '?'; }
  primaryImageUrl(): string {
    const imgs = this.item?.images ?? [];
    const primary = imgs.find(i => i.isPrimary) ?? imgs[0];
    if (!primary?.url) return '';
    return primary.url.startsWith('/') ? environment.apiBaseUrl + primary.url : primary.url;
  }
  warehouseName(id: string): string { return this.warehouseNames[id] || id.substring(0, 8); }

  serialPill(status: string | null): string { return SERIAL_STATUS_META[status ?? '']?.pill ?? 'pill-muted'; }
  serialLabel(status: string | null): string { return SERIAL_STATUS_META[status ?? '']?.label ?? (status ?? '—'); }

  batchPill(status: string): string {
    switch (status) {
      case 'Active': return 'pill-instock2';
      case 'Quarantine': return 'pill-reserved';
      case 'Expired': return 'pill-out';
      case 'Recalled': return 'pill-defective';
      default: return 'pill-muted';
    }
  }
  expiryClass(days: number | null): string {
    if (days == null) return '';
    if (days < 0) return 'warranty-expired';
    if (days <= 30) return 'warranty-soon';
    return 'warranty-ok';
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  back(): void {
    if (this.embedded) { this.closed.emit(); return; }
    this.router.navigate(['..'], { relativeTo: this.route });
  }
  edit(): void { this.router.navigate(['/inventory/products', this.itemId, 'edit']); }
}
