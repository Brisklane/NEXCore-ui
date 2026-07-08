import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { WorkInProgressService } from '../../services/work-in-progress.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import { WorkInProgressDto, CreateWorkInProgressDto, UpdateWorkInProgressDto } from '../../models/work-in-progress.model';
import { OptionPickerInputComponent, OptionPickerItem, OptionPickerColumn } from '../../components/option-picker-input/option-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-work-in-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, OptionPickerInputComponent],
  templateUrl: './work-in-progress.html',
  styleUrl: './work-in-progress.css',
})
export class WorkInProgress implements OnInit {
  items: WorkInProgressDto[] = [];
  filteredItems: WorkInProgressDto[] = [];
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  loading = false;
  error = '';
  showForm = false;
  editing: WorkInProgressDto | null = null;

  formProductionOrderId = '';
  formProductId = '';
  formQuantityInProgress = 0;
  formQuantityCompleted = 0;
  formQuantityRejected = 0;
  formUnitOfMeasure = '';
  formNotes = '';

  filterSearch = '';

  totalCount = 0;
  totalInProgress = 0;
  totalCompleted = 0;
  totalRejected = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;
  orderNumberById: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  poPickerOptions: OptionPickerItem[] = [];
  formPoPickerText = '';
  formProductDisplayText = '';
  readonly poColumns: OptionPickerColumn[] = [
    { key: 'order', header: 'Order #' },
    { key: 'product', header: 'Product' },
    { key: 'poStatus', header: 'Status' },
    { key: 'qty', header: 'Planned Qty' },
    { key: 'end', header: 'End Date' },
  ];
  productOptions: Array<{ id: string; label: string }> = [];

  constructor(
    private svc: WorkInProgressService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { 
    this.loadOrderLabels();
    this.loadProductLabels();
    setTimeout(() => this.load(), 100);
  }

  private normalizeId(id: string | null | undefined): string {
    return (id ?? '').trim().toLowerCase();
  }

  private rebuildProductionOrderOptions() {
    const usedOrderIds = new Set(this.items.map((item) => this.normalizeId(item.productionOrderId)));
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter((order) => !usedOrderIds.has(this.normalizeId(order.id)));

    this.productionOrderOptions = optionsSource
      .map((o) => ({
        id: o.id,
        label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this.poPickerOptions = optionsSource.map((o) => {
      const orderNum = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
      const productName = o.productName?.trim() || this.productDisplayById[o.productId] || '';
      const label = productName ? `${orderNum} · ${productName}` : orderNum;
      return {
        id: o.id,
        label,
        meta: {
          order: orderNum,
          product: productName || '—',
          poStatus: o.status || '—',
          qty: o.quantityPlanned != null ? String(o.quantityPlanned) + (o.unitOfMeasure ? ' ' + o.unitOfMeasure : '') : '—',
          end: o.endDate ? new Date(o.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        },
      };
    }).sort((a, b) => a.label.localeCompare(b.label));

    if (!this.editing && this.formProductionOrderId && !this.productionOrderOptions.some((opt) => opt.id === this.formProductionOrderId)) {
      this.formProductionOrderId = '';
      this.formProductId = '';
      this.formPoPickerText = '';
      this.formProductDisplayText = '';
    }
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

  onProductionOrderChange() {
    if (!this.formProductionOrderId.trim()) {
      this.formProductId = '';
      this.formProductDisplayText = '';
      return;
    }
    const order = this.productionOrdersById[this.formProductionOrderId];
    if (order) {
      this.formProductId = order.productId || '';
      const label = this.getProductDisplayLabel(order.productId, order.productName, this.formProductionOrderId);
      this.formProductDisplayText = label;
      this.cdr.detectChanges();
      // If still unresolved, do a direct product lookup
      if ((label === 'Unmapped Product' || !label) && order.productId) {
        this.resolveProductForDisplay(order.productId);
      }
    }
  }

  private resolveProductForDisplay(productId: string) {
    this.http.get<ApiResponse<any>>(`${BASE_URL}/api/Item/${productId}`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const item = r.data;
        if (item) {
          const code = (item.code ?? item.itemCode ?? '').trim();
          const name = (item.name ?? item.itemName ?? '').trim();
          const resolved = [code, name].filter(Boolean).join(' - ') || `PROD-${productId.substring(0, 6)}`;
          this.productDisplayById[productId] = resolved;
          if (this.formProductId === productId) {
            this.formProductDisplayText = resolved;
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {
        if (this.formProductId === productId) {
          this.formProductDisplayText = `PROD-${productId.substring(0, 6)}`;
          this.cdr.detectChanges();
        }
      },
    });
  }

  onPoSelected(item: OptionPickerItem) {
    this.formProductionOrderId = item.id;
    this.formPoPickerText = item.label;
    this.onProductionOrderChange();
  }

  getCurrentTotalQuantity(): number {
    return (this.formQuantityInProgress ?? 0) + (this.formQuantityCompleted ?? 0) + (this.formQuantityRejected ?? 0);
  }

  getSelectedPlannedQuantity(): number | null {
    if (!this.formProductionOrderId.trim()) return null;
    const planned = Number(this.productionOrdersById[this.formProductionOrderId]?.quantityPlanned);
    if (!Number.isFinite(planned)) return null;
    return planned;
  }

  isQuantityOverPlanned(): boolean {
    const planned = this.getSelectedPlannedQuantity();
    if (planned === null) return false;
    return this.getCurrentTotalQuantity() > planned;
  }

  isQuantityBalanced(): boolean {
    const planned = this.getSelectedPlannedQuantity();
    if (planned === null) return false;
    return this.getCurrentTotalQuantity() === planned;
  }

  private hasExistingWipForOrder(productionOrderId: string): boolean {
    const normalized = this.normalizeId(productionOrderId);
    return this.items.some((item) => this.normalizeId(item.productionOrderId) === normalized);
  }

  private openExistingWipForOrder(productionOrderId: string) {
    this.svc.getByOrder(productionOrderId).subscribe({
      next: (r) => {
        const existing = r?.data;
        if (!existing?.id) return;

        const ix = this.items.findIndex((item) => item.id === existing.id);
        if (ix >= 0) {
          this.items[ix] = existing;
        } else {
          this.items = [existing, ...this.items];
          this.calcMetrics();
          this.applyFilters();
          this.rebuildProductionOrderOptions();
        }

        this.error = 'This production order already has a WIP record. Loaded existing record in edit mode.';
        this.openEdit(existing);
        this.cdr.detectChanges();
      },
    });
  }

  private createWipRecord(dto: CreateWorkInProgressDto) {
    this.svc.create(dto).subscribe({
      next: () => {
        this.showForm = false;
        this.svc.getByOrder(dto.productionOrderId).subscribe({
          next: (r) => {
            const created = r?.data;
            if (created?.id) {
              const ix = this.items.findIndex((item) => item.id === created.id);
              if (ix >= 0) {
                this.items[ix] = created;
              } else {
                this.items = [created, ...this.items];
              }
              this.justCreated = created;
              this.calcMetrics();
              this.applyFilters();
              this.applyJustCreated();
              this.rebuildProductionOrderOptions();
              this.cdr.detectChanges();
            }
          },
          error: () => {
            this.load();
          },
        });
      },
      error: (err: any) => {
        const errStr = JSON.stringify(err?.error || '').toLowerCase();
        const message = String(err?.error?.message || '').toLowerCase();
        const title = String(err?.error?.title || '').toLowerCase();
        if (
          errStr.includes('duplicate') ||
          errStr.includes('ix_wip') ||
          errStr.includes('productionorderid') ||
          errStr.includes('internal server error') ||
          message.includes('internal server error') ||
          title.includes('internal server error') ||
          (err?.status === 500 && this.hasExistingWipForOrder(this.formProductionOrderId))
        ) {
          this.error = 'Production order already has a WIP record. Checking if it was previously deleted...';
          this.showForm = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.load();
          }, 1200);
        } else if (err?.error?.message) {
          this.error = err.error.message;
        } else if (err?.error?.title) {
          this.error = err.error.title;
        } else {
          this.error = 'Failed to create';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private createWithBackendDuplicateCheck(dto: CreateWorkInProgressDto) {
    this.createWipRecord(dto);
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http.get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const items = r.data ?? [];
        this.productDisplayById = items.reduce((acc, item) => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) acc[item.id] = `${code} - ${name}`;
          else if (name) acc[item.id] = name;
          else if (code) acc[item.id] = code;
          return acc;
        }, {} as Record<string, string>);
        this.productOptions = items.map(item => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          let label = '';
          if (code && name) label = `${code} - ${name}`;
          else if (name) label = name;
          else if (code) label = code;
          return { id: item.id, label };
        }).sort((a, b) => a.label.localeCompare(b.label));
        this.productLabelsLoaded = true;
        // Rebuild PO picker options so product names appear in dropdown labels
        this.rebuildProductionOrderOptions();
        // Re-derive product display text if a PO was already selected before labels arrived
        if (this.formProductionOrderId) {
          const order = this.productionOrdersById[this.formProductionOrderId];
          if (order) {
            const label = this.getProductDisplayLabel(order.productId, order.productName, this.formProductionOrderId);
            this.formProductDisplayText = label;
            if ((label === 'Unmapped Product' || !label) && order.productId) {
              this.resolveProductForDisplay(order.productId);
            }
          }
        }
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.productLabelsLoaded = true;
      },
    });
  }

  getProductDisplayLabel(productId: string | null | undefined, productName: string | null | undefined, productionOrderId?: string | null): string {
    if (productionOrderId) {
      const order = this.productionOrdersById[productionOrderId];
      if (order?.productName?.trim()) return order.productName;
    }
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    if (productName?.trim()) return productName;
    return 'Unmapped Product';
  }

  hasProductCatalogLabel(productId: string | null | undefined): boolean {
    return !!(productId && this.productDisplayById[productId]);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.rebuildProductionOrderOptions();
        this.calcMetrics();
        this.applyFilters();
        this.applyJustCreated();
        this.loading = false;
        this.showForm = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load WIP records'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.totalInProgress = this.items.reduce((s, i) => s + (i.quantityInProgress ?? 0), 0);
    this.totalCompleted = this.items.reduce((s, i) => s + (i.quantityCompleted ?? 0), 0);
    this.totalRejected = this.items.reduce((s, i) => s + (i.quantityRejected ?? 0), 0);
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      return !this.filterSearch ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productionOrderId?.toLowerCase().includes(this.filterSearch.toLowerCase());
    });
    this.cdr.detectChanges();
  }

  onFilterChange() { this.applyFilters(); }

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

  private applyJustCreated() {
    if (this.justCreated?.id != null) {
      this.highlighter.flash(this.justCreated.id, this.cdr);
      this.justCreated = null;
    }
  }

  getCompletionPct(item: WorkInProgressDto): number {
    const total = (item.quantityInProgress ?? 0) + (item.quantityCompleted ?? 0);
    if (!total) return 0;
    return Math.round(((item.quantityCompleted ?? 0) / total) * 100);
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  openEdit(item: WorkInProgressDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formPoPickerText = item.productionOrderId
      ? (this.poPickerOptions.find(o => o.id === item.productionOrderId)?.label ?? this.orderNumberById[item.productionOrderId] ?? '')
      : '';
    this.formProductId = item.productId ?? '';
    this.formProductDisplayText = this.getProductDisplayLabel(item.productId, item.productName, item.productionOrderId);
    this.formQuantityInProgress = item.quantityInProgress ?? 0;
    this.formQuantityCompleted = item.quantityCompleted ?? 0;
    this.formQuantityRejected = item.quantityRejected ?? 0;
    this.formUnitOfMeasure = item.unitOfMeasure ?? '';
    this.formNotes = item.notes ?? '';
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formPoPickerText = '';
    this.formProductId = ''; this.formProductDisplayText = '';
    this.formQuantityInProgress = 0;
    this.formQuantityCompleted = 0; this.formQuantityRejected = 0; this.formUnitOfMeasure = ''; this.formNotes = '';
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order ID is required.'; this.cdr.detectChanges(); return; }
    if (!this.formProductId.trim()) { this.error = 'Product ID is required.'; this.cdr.detectChanges(); return; }
    if (this.formQuantityInProgress < 0 || this.formQuantityCompleted < 0 || this.formQuantityRejected < 0) {
      this.error = 'Quantities cannot be negative.'; this.cdr.detectChanges(); return;
    }
    const plannedQty = this.getSelectedPlannedQuantity();
    const enteredTotal = this.getCurrentTotalQuantity();
    if (plannedQty !== null && enteredTotal > plannedQty) {
      this.error = `Total quantity (${enteredTotal}) cannot exceed planned quantity (${plannedQty}).`;
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateWorkInProgressDto = { quantityInProgress: this.formQuantityInProgress, quantityCompleted: this.formQuantityCompleted, quantityRejected: this.formQuantityRejected, unitOfMeasure: this.formUnitOfMeasure, notes: this.formNotes || null };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateWorkInProgressDto = { productionOrderId: this.formProductionOrderId, productId: this.formProductId, quantityInProgress: this.formQuantityInProgress, quantityCompleted: this.formQuantityCompleted, quantityRejected: this.formQuantityRejected, unitOfMeasure: this.formUnitOfMeasure, notes: this.formNotes || null };
      this.createWithBackendDuplicateCheck(dto);
    }
  }

  delete(item: WorkInProgressDto) {
    if (confirm('Delete this WIP record?')) {
      this.svc.delete(item.id).subscribe({
        next: () => {
          this.items = this.items.filter(x => x.id !== item.id);
          this.calcMetrics();
          this.applyFilters();
          this.rebuildProductionOrderOptions();
          this.error = 'WIP record deleted successfully.';
          setTimeout(() => { this.error = ''; this.load(); }, 2000);
        },
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
