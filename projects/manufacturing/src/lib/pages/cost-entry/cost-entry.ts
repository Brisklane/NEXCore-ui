import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostEntryService } from '../../services/cost-entry.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { CostEntryDto, CreateCostEntryDto, UpdateCostEntryDto } from '../../models/cost-entry.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-cost-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-entry.html',
  styleUrl: './cost-entry.css',
})
export class CostEntry implements OnInit {
  items: CostEntryDto[] = [];
  loading = false; error = ''; showForm = false; editing: CostEntryDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  formProductionOrderId = ''; formCostType = 'Material'; formAmount = 0;
  formCurrency = ''; formEntryDate = ''; formDescription = '';
  costTypes = ['Material', 'Labor', 'Machine', 'Overhead', 'Scrap'];
  orderNumberById: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private svc: CostEntryService,
    private productionOrderSvc: ProductionOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadOrderLabels(); this.load(); }

  get displayRows(): any[] {
    let rows: any[] = [...this.items];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const id = this.highlighter.id;
    if (id != null) {
      const idx = rows.findIndex(r => r?.id === id);
      if (idx > 0) { const [row] = rows.splice(idx, 1); rows.unshift(row); }
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.items.some((i: any) => i?.id === c.id)) this.items = [c, ...this.items];
    this.highlighter.flash(c.id, this.cdr);
  }

  loadOrderLabels() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        this.allProductionOrders = r.data ?? [];
        this.productionOrdersById = {};
        this.allProductionOrders.forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
          this.productionOrdersById[o.id] = o;
        });
        this.rebuildProductionOrderOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  private isEligibleCostOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'released' || normalized === 'inprogress' || normalized === 'completed' || normalized === 'closed';
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(o => this.isEligibleCostOrder(o.status));

    const seen = new Set<string>();
    const uniqueOrders = optionsSource.filter(o => {
      const key = (o.orderNumber?.trim() || o.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.productionOrderOptions = uniqueOrders.map(o => ({
      id: o.id,
      label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  getSelectedOrderLabel(): string {
    return this.getOrderLabel(this.formProductionOrderId);
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  getStatusOptionLabel(status: string): string {
    if (status === 'InProgress') return 'In Progress';
    if (status === 'OnHold') return 'On Hold';
    return status;
  }

  private getCostPayload() {
    return {
      materialCost: this.formCostType === 'Material' ? this.formAmount : undefined,
      laborCost: this.formCostType === 'Labor' ? this.formAmount : undefined,
      overheadCost: this.formCostType === 'Overhead' ? this.formAmount : undefined,
      machineCost: this.formCostType === 'Machine' ? this.formAmount : undefined,
      scrapCost: this.formCostType === 'Scrap' ? this.formAmount : undefined,
    };
  }

  load() {
    this.loading = true; this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load cost entries'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }
  openEdit(item: CostEntryDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formCostType = 'Material';
    this.formAmount = item.materialCost ?? 0;
    if ((item.laborCost ?? 0) > 0) { this.formCostType = 'Labor'; this.formAmount = item.laborCost ?? 0; }
    if ((item.overheadCost ?? 0) > 0) { this.formCostType = 'Overhead'; this.formAmount = item.overheadCost ?? 0; }
    if ((item.machineCost ?? 0) > 0) { this.formCostType = 'Machine'; this.formAmount = item.machineCost ?? 0; }
    if ((item.scrapCost ?? 0) > 0) { this.formCostType = 'Scrap'; this.formAmount = item.scrapCost ?? 0; }
    this.formCurrency = '';
    this.formEntryDate = item.postedAt ? item.postedAt.substring(0, 10) : '';
    this.formDescription = item.notes ?? '';
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }
  reset() { this.formProductionOrderId = ''; this.formCostType = 'Material'; this.formAmount = 0; this.formCurrency = ''; this.formEntryDate = new Date().toISOString().substring(0, 10); this.formDescription = ''; }
  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) {
      this.error = 'Production Order ID is required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formAmount <= 0) {
      this.error = 'Amount must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editing && !this.isEligibleCostOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Cost entry can be created only for Released, InProgress, Completed, or Closed production orders.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateCostEntryDto = { ...this.getCostPayload(), postedAt: this.formEntryDate || undefined, notes: this.formDescription || undefined };
      this.svc.update(this.editing.id, dto).subscribe({ next: () => { this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); } });
    } else {
      const dto: CreateCostEntryDto = { productionOrderId: this.formProductionOrderId, ...this.getCostPayload(), postedAt: this.formEntryDate || undefined, notes: this.formDescription || undefined };
      this.svc.create(dto).subscribe({ next: (res) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); } });
    }
  }

  delete(item: CostEntryDto) {
    const orderLabel = item.orderNumber?.trim() || this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete cost entry for order "${orderLabel}"?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}
