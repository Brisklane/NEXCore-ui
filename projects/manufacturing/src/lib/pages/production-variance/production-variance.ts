import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionVarianceService } from '../../services/production-variance.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { CostEntryService } from '../../services/cost-entry.service';
import { ProductionOrderDto } from '../../models/production-order.model';
import { ProductionVarianceDto, CreateProductionVarianceDto, UpdateProductionVarianceDto } from '../../models/production-variance.model';
import { CostEntryDto } from '../../models/cost-entry.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-production-variance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './production-variance.html',
  styleUrl: './production-variance.css',
})
export class ProductionVariance implements OnInit {
  private readonly varianceOverrideStorageKey = 'manufacturing.productionVariance.overrides.v1';
  items: ProductionVarianceDto[] = [];
  filteredItems: ProductionVarianceDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: ProductionVarianceDto | null = null;

  formProductionOrderId = '';
  formCostEntryId = '';
  formVarianceType = 'Material';
  formStandardAmount = 0;
  formActualAmount = 0;
  formNotes = '';
  varianceTypes = ['Material', 'Labor', 'Machine', 'Overhead'];

  filterSearch = '';
  filterSettled = 'all';

  totalCount = 0;
  favorableCount = 0;
  unfavorableCount = 0;
  settledCount = 0;
  totalVarianceAmount = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  orderNumberById: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  allCostEntries: CostEntryDto[] = [];
  costEntryOptions: Array<{ id: string; label: string }> = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private svc: ProductionVarianceService,
    private productionOrderSvc: ProductionOrderService,
    private costEntrySvc: CostEntryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadOrderLabels(); this.loadCostEntries(); this.load(); }

  get displayRows(): any[] {
    let rows: any[] = [...this.filteredItems];
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
    if (!this.filteredItems.some((i: any) => i?.id === c.id)) this.filteredItems = [c, ...this.filteredItems];
    this.highlighter.flash(c.id, this.cdr);
  }

  private readOverrides(): Record<string, Partial<ProductionVarianceDto>> {
    try {
      const raw = localStorage.getItem(this.varianceOverrideStorageKey);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, Partial<ProductionVarianceDto>>;
    } catch {
      return {};
    }
  }

  private writeOverrides(overrides: Record<string, Partial<ProductionVarianceDto>>) {
    try {
      localStorage.setItem(this.varianceOverrideStorageKey, JSON.stringify(overrides));
    } catch {
      // No-op: storage can fail in private mode or when quota is exceeded.
    }
  }

  private applyOverrides(items: ProductionVarianceDto[]): ProductionVarianceDto[] {
    const overrides = this.readOverrides();
    return items.map((item) => {
      const override = overrides[item.id];
      return override ? ({ ...item, ...override } as ProductionVarianceDto) : item;
    });
  }

  private saveItemOverride(item: ProductionVarianceDto) {
    const overrides = this.readOverrides();
    overrides[item.id] = {
      varianceCategory: item.varianceCategory,
      notes: item.notes,
      standardMaterialCost: item.standardMaterialCost,
      actualMaterialCost: item.actualMaterialCost,
      materialVariance: item.materialVariance,
      standardLaborCost: item.standardLaborCost,
      actualLaborCost: item.actualLaborCost,
      laborVariance: item.laborVariance,
      standardMachineCost: item.standardMachineCost,
      actualMachineCost: item.actualMachineCost,
      machineVariance: item.machineVariance,
      standardOverheadCost: item.standardOverheadCost,
      actualOverheadCost: item.actualOverheadCost,
      overheadVariance: item.overheadVariance,
      totalVariance: item.totalVariance,
    };
    this.writeOverrides(overrides);
  }

  private removeItemOverride(id: string) {
    const overrides = this.readOverrides();
    if (!overrides[id]) return;
    delete overrides[id];
    this.writeOverrides(overrides);
  }

  loadCostEntries() {
    this.costEntrySvc.getAll().subscribe({
      next: (r) => {
        this.allCostEntries = r.data ?? [];
        this.rebuildCostEntryOptions();
        this.cdr.detectChanges();
      },
      error: () => {
        this.allCostEntries = [];
        this.costEntryOptions = [];
        this.cdr.detectChanges();
      },
    });
  }

  onProductionOrderChange() {
    this.rebuildCostEntryOptions();
    this.formCostEntryId = '';
    if (this.costEntryOptions.length > 0) {
      this.formCostEntryId = this.costEntryOptions[0].id;
      this.onCostEntryChange();
    } else {
      this.formStandardAmount = 0;
      this.formActualAmount = 0;
    }
    this.cdr.detectChanges();
  }

  onCostEntryChange() {
    const selected = this.allCostEntries.find(c => c.id === this.formCostEntryId);
    if (!selected) return;
    this.formStandardAmount = this.getCostEntryAmountForType(selected, this.formVarianceType);
    this.cdr.detectChanges();
  }

  onVarianceTypeChange() {
    if (this.editing) {
      this.formStandardAmount = this.getStandardAmountForType(this.editing, this.formVarianceType);
      this.formActualAmount = this.getActualAmountForType(this.editing, this.formVarianceType);
      this.cdr.detectChanges();
    } else {
      this.onCostEntryChange();
    }
  }

  private getCostEntryAmountForType(entry: CostEntryDto, varianceType: string): number {
    if (varianceType === 'Labor') return entry.laborCost ?? 0;
    if (varianceType === 'Machine') return entry.machineCost ?? 0;
    if (varianceType === 'Overhead') return entry.overheadCost ?? 0;
    return entry.materialCost ?? 0;
  }

  private rebuildCostEntryOptions() {
    if (!this.formProductionOrderId.trim()) {
      this.costEntryOptions = [];
      return;
    }

    const matchingEntries = this.allCostEntries.filter(c => c.productionOrderId === this.formProductionOrderId);
    this.costEntryOptions = matchingEntries
      .map(c => {
        const posted = c.postedAt ? new Date(c.postedAt).toLocaleDateString() : 'N/A';
        return { id: c.id, label: `${posted} - Total ${c.totalCost?.toFixed(2) ?? '0.00'}` };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
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

  private isEligibleVarianceOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'completed' || normalized === 'closed';
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(o => this.isEligibleVarianceOrder(o.status));

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

  private getVarianceCostPayload(): Partial<CreateProductionVarianceDto> {
    return {
      standardMaterialCost: this.formVarianceType === 'Material' ? this.formStandardAmount : undefined,
      actualMaterialCost: this.formVarianceType === 'Material' ? this.formActualAmount : undefined,
      standardLaborCost: this.formVarianceType === 'Labor' ? this.formStandardAmount : undefined,
      actualLaborCost: this.formVarianceType === 'Labor' ? this.formActualAmount : undefined,
      standardMachineCost: this.formVarianceType === 'Machine' ? this.formStandardAmount : undefined,
      actualMachineCost: this.formVarianceType === 'Machine' ? this.formActualAmount : undefined,
      standardOverheadCost: this.formVarianceType === 'Overhead' ? this.formStandardAmount : undefined,
      actualOverheadCost: this.formVarianceType === 'Overhead' ? this.formActualAmount : undefined,
    };
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = this.applyOverrides(r.data ?? []);
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.calcMetrics();
        this.applyFilters();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load variances'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.favorableCount = this.items.filter(i => (i.totalVariance ?? 0) < 0).length;
    this.unfavorableCount = this.items.filter(i => (i.totalVariance ?? 0) > 0).length;
    this.settledCount = this.items.filter(i => i.isSettled).length;
    this.totalVarianceAmount = this.items.reduce((s, i) => s + (i.totalVariance ?? 0), 0);
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = !this.filterSearch ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productionOrderId?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.varianceCategory?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const matchSettled = this.filterSettled === 'all' ||
        (this.filterSettled === 'settled' && item.isSettled) ||
        (this.filterSettled === 'unsettled' && !item.isSettled);
      return matchSearch && matchSettled;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() { this.applyFilters(); }

  isFavorable(variance: number): boolean { return variance < 0; }

  getVarianceClass(variance: number): string {
    if (variance < 0) return 'text-success';
    if (variance > 0) return 'text-danger';
    return '';
  }

  settleVariance(item: ProductionVarianceDto) {
    const dto: UpdateProductionVarianceDto = { isSettled: true, settledAt: new Date().toISOString() };
    this.svc.update(item.id, dto).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to settle variance'; this.cdr.detectChanges(); },
    });
  }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }

  openEdit(item: ProductionVarianceDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formVarianceType = item.varianceCategory ?? 'Material';
    this.formStandardAmount = this.getStandardAmountForType(item, this.formVarianceType);
    this.formActualAmount = this.getActualAmountForType(item, this.formVarianceType);
    this.formNotes = item.notes ?? '';
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  private getStandardAmountForType(item: ProductionVarianceDto, varianceType: string): number {
    if (varianceType === 'Labor') return item.standardLaborCost ?? 0;
    if (varianceType === 'Machine') return item.standardMachineCost ?? 0;
    if (varianceType === 'Overhead') return item.standardOverheadCost ?? 0;
    return item.standardMaterialCost ?? 0;
  }

  private getActualAmountForType(item: ProductionVarianceDto, varianceType: string): number {
    if (varianceType === 'Labor') return item.actualLaborCost ?? 0;
    if (varianceType === 'Machine') return item.actualMachineCost ?? 0;
    if (varianceType === 'Overhead') return item.actualOverheadCost ?? 0;
    return item.actualMaterialCost ?? 0;
  }

  reset() {
    this.formProductionOrderId = ''; this.formCostEntryId = ''; this.formVarianceType = 'Material';
    this.formStandardAmount = 0; this.formActualAmount = 0; this.formNotes = '';
    this.costEntryOptions = [];
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order ID is required.'; this.cdr.detectChanges(); return; }
    if (!this.editing && !this.formCostEntryId.trim()) { this.error = 'Cost entry is required.'; this.cdr.detectChanges(); return; }
    if (this.formStandardAmount < 0 || this.formActualAmount < 0) { this.error = 'Cost amounts cannot be negative.'; this.cdr.detectChanges(); return; }
    if (!this.editing && this.formStandardAmount === 0 && this.formActualAmount === 0) {
      this.error = 'Standard or actual amount must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editing && !this.isEligibleVarianceOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Variance can be recorded only for Completed or Closed production orders.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateProductionVarianceDto = {
        varianceCategory: this.formVarianceType,
        notes: this.formNotes || null,
      };
      const editingId = this.editing.id;
      this.svc.update(editingId, dto).subscribe({
        next: () => {
          // Patch the local item directly because the backend update endpoint
          // does not recompute variance columns from cost fields.
          const std = this.formStandardAmount;
          const act = this.formActualAmount;
          const variance = act - std;
          const idx = this.items.findIndex(i => i.id === editingId);
          if (idx >= 0) {
            const base = this.items[idx];
            const matVar      = this.formVarianceType === 'Material'  ? variance : (base.materialVariance  ?? 0);
            const laborVar    = this.formVarianceType === 'Labor'     ? variance : (base.laborVariance     ?? 0);
            const machineVar  = this.formVarianceType === 'Machine'   ? variance : (base.machineVariance   ?? 0);
            const overheadVar = this.formVarianceType === 'Overhead'  ? variance : (base.overheadVariance  ?? 0);
            this.items[idx] = {
              ...base,
              varianceCategory:    this.formVarianceType,
              notes:               this.formNotes || null,
              standardMaterialCost:  this.formVarianceType === 'Material'  ? std : (base.standardMaterialCost  ?? 0),
              actualMaterialCost:    this.formVarianceType === 'Material'  ? act : (base.actualMaterialCost    ?? 0),
              materialVariance:      matVar,
              standardLaborCost:     this.formVarianceType === 'Labor'     ? std : (base.standardLaborCost     ?? 0),
              actualLaborCost:       this.formVarianceType === 'Labor'     ? act : (base.actualLaborCost       ?? 0),
              laborVariance:         laborVar,
              standardMachineCost:   this.formVarianceType === 'Machine'   ? std : (base.standardMachineCost   ?? 0),
              actualMachineCost:     this.formVarianceType === 'Machine'   ? act : (base.actualMachineCost     ?? 0),
              machineVariance:       machineVar,
              standardOverheadCost:  this.formVarianceType === 'Overhead'  ? std : (base.standardOverheadCost  ?? 0),
              actualOverheadCost:    this.formVarianceType === 'Overhead'  ? act : (base.actualOverheadCost    ?? 0),
              overheadVariance:      overheadVar,
              totalVariance:         matVar + laborVar + machineVar + overheadVar,
            };
            this.saveItemOverride(this.items[idx]);
          }
          this.showForm = false;
          this.calcMetrics();
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const costPayload = this.getVarianceCostPayload();
      const dto: CreateProductionVarianceDto = {
        productionOrderId: this.formProductionOrderId,
        costEntryId: this.formCostEntryId,
        standardMaterialCost: costPayload.standardMaterialCost ?? 0,
        actualMaterialCost: costPayload.actualMaterialCost ?? 0,
        standardLaborCost: costPayload.standardLaborCost ?? 0,
        actualLaborCost: costPayload.actualLaborCost ?? 0,
        standardMachineCost: costPayload.standardMachineCost ?? 0,
        actualMachineCost: costPayload.actualMachineCost ?? 0,
        standardOverheadCost: costPayload.standardOverheadCost ?? 0,
        actualOverheadCost: costPayload.actualOverheadCost ?? 0,
        varianceCategory: this.formVarianceType,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  delete(item: ProductionVarianceDto) {
    const orderLabel = item.orderNumber?.trim() || this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete variance for order "${orderLabel}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => {
          this.removeItemOverride(item.id);
          this.load();
        },
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
