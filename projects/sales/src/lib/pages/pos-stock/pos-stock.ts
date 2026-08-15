import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  InventoryBalanceService, InventoryBalanceDto,
  InventoryDocumentService,
  CatalogService, CatalogResolutionDto,
} from '@nexcore/inventory';
import { SearchableSelect, SearchableOption } from '@nexcore/core';
import { PosStoreService } from '../../services/pos-store.service';
import { PosStoreDto } from '../../models/pos-store.model';

/** A balance row joined to what the product actually is. */
interface StockRow {
  balance: InventoryBalanceDto;
  code: string;
  name: string;
  variantName?: string | null;
}

/**
 * Stock as the shop floor sees it: what is on hand in this store's warehouse, and a
 * way to correct it after a count.
 *
 * Adjustments go through `quick-adjust`, which writes a posted inventory document
 * rather than editing a balance directly — so a correction leaves an audit trail and
 * the moving-average cost stays consistent with the rest of Inventory.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-stock',
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './pos-stock.html',
  styleUrls: ['./pos-stock.css'],
})
export class PosStockComponent implements OnInit {
  private balances = inject(InventoryBalanceService);
  private documents = inject(InventoryDocumentService);
  private catalog = inject(CatalogService);
  private stores = inject(PosStoreService);
  private cdr = inject(ChangeDetectorRef);

  storeList: PosStoreDto[] = [];
  storeId = '';

  rows: StockRow[] = [];
  loading = false;
  error = '';
  notice = '';

  query = '';
  lowStockOnly = false;

  /** The row being counted, or null. */
  adjusting: {
    row: StockRow;
    newQuantity: number | null;
    reason: string;
  } | null = null;
  saving = false;

  private productsById = new Map<string, CatalogResolutionDto>();

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.stores.getActive()).catch(() => null);
    this.storeList = res?.data ?? [];

    const first = this.storeList.find(s => !!s.defaultWarehouseId) ?? this.storeList[0];
    if (first) { this.storeId = first.id; await this.load(); }
    this.cdr.detectChanges();
  }

  get store(): PosStoreDto | undefined {
    return this.storeList.find(s => s.id === this.storeId);
  }

  get warehouseId(): string | null {
    return this.store?.defaultWarehouseId ?? null;
  }

  get storeOptions(): SearchableOption[] {
    return this.storeList.map(s => ({ value: s.id, label: s.tradingName ?? s.id }));
  }

  /** Filtered view; the search box matches the product code or name. */
  get visibleRows(): StockRow[] {
    const q = this.query.trim().toLowerCase();
    return this.rows.filter(r => {
      if (this.lowStockOnly && r.balance.quantityAvailable > 0) return false;
      if (!q) return true;
      return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    });
  }

  get totalValue(): number {
    return this.rows.reduce((sum, r) => sum + (r.balance.totalValue ?? 0), 0);
  }

  get outOfStockCount(): number {
    return this.rows.filter(r => r.balance.quantityAvailable <= 0).length;
  }

  async onStoreChange(): Promise<void> {
    this.notice = '';
    await this.load();
  }

  async load(): Promise<void> {
    this.rows = [];
    this.error = '';

    const warehouseId = this.warehouseId;
    if (!warehouseId) {
      // Without a warehouse there is no stock to show — and this is the same
      // misconfiguration the till warns about when an item shows zero on hand.
      this.error = 'This store has no default warehouse. Set one in POS Stores before counting stock.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    const res = await firstValueFrom(this.balances.getByWarehouse(warehouseId)).catch(() => null);
    const list = res?.data ?? [];

    // Balances carry ids only, so resolve each product once for display.
    await this.labelProducts(list.map(b => b.itemId));

    this.rows = list.map(b => {
      const hit = this.productsById.get(b.itemId);
      return {
        balance: b,
        code: hit?.itemCode ?? b.itemId.slice(0, 8),
        name: hit?.itemName ?? 'Unknown product',
        variantName: hit?.variantName ?? null,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async labelProducts(ids: string[]): Promise<void> {
    for (const id of new Set(ids)) {
      if (this.productsById.has(id)) continue;
      const hit = await firstValueFrom(this.catalog.search(id, 1)).catch(() => []);
      if (hit[0]) this.productsById.set(id, hit[0]);
    }
  }

  // ── Counting ──────────────────────────────────────────────────────────

  startAdjust(row: StockRow): void {
    this.adjusting = { row, newQuantity: row.balance.quantityOnHand, reason: '' };
    this.error = '';
    this.notice = '';
  }

  cancelAdjust(): void {
    this.adjusting = null;
  }

  /** The correction this count implies — shown so nobody posts a surprise. */
  get adjustDelta(): number | null {
    const a = this.adjusting;
    if (!a || a.newQuantity == null) return null;
    return a.newQuantity - a.row.balance.quantityOnHand;
  }

  async saveAdjust(): Promise<void> {
    const a = this.adjusting;
    const warehouseId = this.warehouseId;
    if (!a || !warehouseId) return;

    if (a.newQuantity == null || a.newQuantity < 0) {
      this.error = 'Enter the counted quantity.';
      return;
    }
    if (!a.reason.trim()) {
      // A stock correction without a reason is unauditable; the API allows it, this screen doesn't.
      this.error = 'Give a reason for the correction.';
      return;
    }

    this.saving = true;
    this.error = '';

    const res = await firstValueFrom(this.documents.quickAdjust({
      itemId: a.row.balance.itemId,
      warehouseId,
      variantId: a.row.balance.variantId ?? undefined,
      newQuantity: a.newQuantity,
      reason: a.reason.trim(),
    } as any)).catch((e: any) => {
      this.error = e?.error?.message ?? 'Could not post that adjustment.';
      return null;
    });

    this.saving = false;

    if (res?.data) {
      this.notice = `${a.row.name} counted at ${a.newQuantity}.`;
      this.adjusting = null;
      await this.load();
    }
    this.cdr.detectChanges();
  }

  trackByRow = (_: number, r: StockRow) => r.balance.id;
}
