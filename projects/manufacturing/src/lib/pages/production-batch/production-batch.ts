import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { RowHighlighter } from '@nexcore/shared';
import { ProductionBatchService } from '../../services/production-batch.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import {
  ProductionBatchDto,
  CreateProductionBatchDto,
  UpdateProductionBatchDto,
} from '../../models/production-batch.model';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-production-batch',
  imports: [CommonModule, FormsModule],
  templateUrl: './production-batch.html',
  styleUrl: './production-batch.css',
})
export class ProductionBatch implements OnInit {
  items: ProductionBatchDto[] = [];
  filteredItems: ProductionBatchDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: ProductionBatchDto | null = null;

  formProductionOrderId = '';
  formProductId = '';
  formQuantity = 0;
  formUnit = '';
  formManufacturingDate = '';
  formExpiryDate = '';
  formWarehouseId = '';
  formVendorBatchNumber = '';
  formNotes = '';
  formStatus = 'InProgress';
  statusOptions = ['InProgress', 'Completed', 'Cancelled', 'OnHold'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  approvedCount = 0;
  totalQty = 0;
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
  productOptions: Array<{ id: string; label: string }> = [];
  warehouseOptions: Array<{ id: string; label: string }> = [];
  warehouseDisplayById: Record<string, string> = {};
  warehousesLoaded = false;
  totalBatchedByPoId: Record<string, number> = {};

  constructor(
    private svc: ProductionBatchService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProductLabels();
    this.loadOrderLabels();
    this.loadWarehouses();
    this.load();
  }

  loadOrderLabels() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        this.allProductionOrders = r.data ?? [];
        this.productionOrdersById = {};
        this.allProductionOrders.forEach((o) => {
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

  private normalizeBatchLifecycleStatus(status: string | null | undefined): string {
    const normalized = (status ?? '').trim();
    if (normalized === 'Active') return 'InProgress';
    return normalized;
  }

  private isEligibleBatchOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'released' || normalized === 'inprogress' || normalized === 'completed' || normalized === 'closed';
  }

  isFullyBatched(poId: string): boolean {
    const order = this.productionOrdersById[poId];
    if (!order) return false;
    const planned = order.quantityPlanned ?? 0;
    if (planned <= 0) return false;
    return (this.totalBatchedByPoId[poId] ?? 0) >= planned;
  }

  getSelectedOrderPlannedQty(): number | null {
    const order = this.productionOrdersById[this.formProductionOrderId];
    return order ? (order.quantityPlanned ?? null) : null;
  }

  getSelectedOrderProducedQty(): number | null {
    const order = this.productionOrdersById[this.formProductionOrderId];
    return order ? (order.quantityProduced ?? null) : null;
  }

  /** Returns 'over' | 'exact' | 'under' | 'empty' | 'no-order' */
  getQtyHintState(): 'over' | 'exact' | 'under' | 'empty' | 'no-order' {
    const planned = this.getSelectedOrderPlannedQty();
    if (planned === null) return 'no-order';
    if (!this.formQuantity || this.formQuantity <= 0) return 'empty';
    const alreadyBatched = this.totalBatchedByPoId[this.formProductionOrderId] ?? 0;
    const total = alreadyBatched + this.formQuantity;
    if (total > planned) return 'over';
    if (total === planned) return 'exact';
    return 'under';
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(
          (o) => this.isEligibleBatchOrder(o.status) && !this.isFullyBatched(o.id)
        );

    this.productionOrderOptions = optionsSource
      .map((o) => ({
        id: o.id,
        label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  onProductionOrderChange() {
    const order = this.productionOrdersById[this.formProductionOrderId];
    if (!order) {
      this.formProductId = '';
      return;
    }
    this.formProductId = order.productId || '';
    if (!this.formUnit.trim() && order.unitOfMeasure?.trim()) {
      this.formUnit = order.unitOfMeasure.trim();
    }
    this.cdr.detectChanges();
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  loadProductLabels() {
    if (this.productLabelsLoaded) return;

    this.http
      .get<ApiResponse<InventoryItemLookupDto[]>>(`${BASE_URL}/api/Item/active`, {
        headers: this.auth.getAuthHeaders(),
      })
      .subscribe({
        next: (r) => {
          const items = r.data ?? [];
          this.productDisplayById = items.reduce(
            (acc, item) => {
              const code = item.code?.trim() ?? '';
              const name = item.name?.trim() ?? '';
              if (code && name) acc[item.id] = `${code} - ${name}`;
              else if (name) acc[item.id] = name;
              else if (code) acc[item.id] = code;
              return acc;
            },
            {} as Record<string, string>,
          );
          this.productOptions = items
            .map((item) => {
              const code = item.code?.trim() ?? '';
              const name = item.name?.trim() ?? '';
              let label = '';
              if (code && name) label = `${code} - ${name}`;
              else if (name) label = name;
              else if (code) label = code;
              return { id: item.id, label };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
          this.productLabelsLoaded = true;
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: () => {
          this.productLabelsLoaded = true;
        },
      });
  }

  loadWarehouses() {
    if (this.warehousesLoaded) return;
    this.warehousesLoaded = true;
    this.http
      .get<ApiResponse<Array<{ id: string; name: string }>>>(`${BASE_URL}/api/Warehouse/active`, {
        headers: this.auth.getAuthHeaders(),
      })
      .subscribe({
        next: (r) => {
          (r.data ?? []).forEach((w) => {
            this.warehouseDisplayById[w.id] = w.name?.trim() || `WH-${w.id.substring(0, 6)}`;
          });
          this.warehouseOptions = (r.data ?? [])
            .map((w) => ({
              id: w.id,
              label: w.name?.trim() || `WH-${w.id.substring(0, 6)}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          this.cdr.detectChanges();
        },
        error: () => {
          this.warehousesLoaded = true;
        },
      });
  }

  getProductDisplayLabel(productId: string | null | undefined, productName: string | null | undefined, productionOrderId?: string | null): string {
    if (productionOrderId) {
      const orderProductName = this.productionOrdersById[productionOrderId]?.productName;
      if (orderProductName?.trim()) return orderProductName;
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
        this.calcMetrics();
        this.applyFilters();
        this.rebuildProductionOrderOptions();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load batches';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.inProgressCount = this.items.filter((i) => this.normalizeBatchLifecycleStatus(i.status) === 'InProgress').length;
    this.completedCount = this.items.filter((i) => i.status === 'Completed').length;
    this.approvedCount = this.items.filter((i) => i.qualityApproved).length;
    this.totalQty = this.items.reduce((s, i) => s + (i.quantity ?? 0), 0);
    this.totalBatchedByPoId = {};
    this.items.forEach((i) => {
      if (i.productionOrderId) {
        this.totalBatchedByPoId[i.productionOrderId] =
          (this.totalBatchedByPoId[i.productionOrderId] ?? 0) + (i.quantity ?? 0);
      }
    });
  }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      const matchSearch =
        !this.filterSearch ||
        item.batchNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const normalizedItemStatus = this.normalizeBatchLifecycleStatus(item.status);
      const matchStatus = this.filterStatus === 'all' || normalizedItemStatus === this.filterStatus;
      return matchSearch && matchStatus;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.applyFilters();
  }

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

  getStatusClass(status: string | null): string {
    const normalizedStatus = this.normalizeBatchLifecycleStatus(status);
    const map: Record<string, string> = {
      InProgress: 'badge-inprogress',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
      OnHold: 'badge-draft',
    };
    return map[normalizedStatus] ?? '';
  }

  getStatusDisplay(status: string | null): string {
    const normalizedStatus = this.normalizeBatchLifecycleStatus(status);
    if (normalizedStatus === 'InProgress') return 'In Progress';
    return normalizedStatus || 'Unknown';
  }

  getStatusOptionLabel(status: string): string {
    if (status === 'InProgress') return 'In Progress';
    if (status === 'OnHold') return 'On Hold';
    return status;
  }

  canComplete(item: ProductionBatchDto): boolean {
    return this.normalizeBatchLifecycleStatus(item.status) === 'InProgress';
  }

  quickUpdateStatus(item: ProductionBatchDto, status: string) {
    this.svc.update(item.id, { status }).subscribe({
      next: () => this.load(),
      error: () => {
        this.error = 'Failed to update status';
        this.cdr.detectChanges();
      },
    });
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  openEdit(item: ProductionBatchDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formProductId = item.productId ?? '';
    this.formQuantity = item.quantity ?? 0;
    this.formUnit = item.unitOfMeasure ?? '';
    this.formManufacturingDate = item.manufacturingDate ? item.manufacturingDate.substring(0, 10) : '';
    this.formExpiryDate = item.expiryDate ? item.expiryDate.substring(0, 10) : '';
    this.formWarehouseId = item.warehouseId ?? '';
    this.formVendorBatchNumber = item.vendorBatchNumber ?? '';
    this.formNotes = item.notes ?? '';
    this.formStatus = item.status ?? 'InProgress';
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = '';
    this.formProductId = '';
    this.formQuantity = 0;
    this.formUnit = '';
    this.formManufacturingDate = new Date().toISOString().substring(0, 10);
    this.formExpiryDate = '';
    this.formWarehouseId = '';
    this.formVendorBatchNumber = '';
    this.formNotes = '';
    this.formStatus = 'InProgress';
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  save() {
    if (!this.formProductionOrderId.trim()) {
      this.error = 'Production Order ID is required.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.formProductId.trim()) {
      this.error = 'Product ID is required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formQuantity <= 0) {
      this.error = 'Quantity must be greater than 0.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editing) {
      const poId = this.formProductionOrderId;
      const alreadyBatched = this.totalBatchedByPoId[poId] ?? 0;
      const planned = this.productionOrdersById[poId]?.quantityPlanned ?? 0;
      if (planned > 0 && alreadyBatched >= planned) {
        this.error = `This production order has already been fully batched (${alreadyBatched} of ${planned} planned). Delete an existing batch first if you need to correct it.`;
        this.cdr.detectChanges();
        return;
      }
      if (planned > 0 && (alreadyBatched + this.formQuantity) > planned) {
        const remaining = planned - alreadyBatched;
        const confirmed = confirm(
          `Total batched quantity (${alreadyBatched} already + ${this.formQuantity} new = ${alreadyBatched + this.formQuantity}) would exceed the planned quantity (${planned}).\n\nRemaining to batch: ${remaining}.\n\nProceed only if approved for overproduction.\n\nContinue?`
        );
        if (!confirmed) { this.cdr.detectChanges(); return; }
      }
    }
    if (!this.editing && !this.isEligibleBatchOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Batch can be created only for Released, InProgress, Completed, or Closed production orders.';
      this.cdr.detectChanges();
      return;
    }
    if (
      this.formManufacturingDate &&
      this.formExpiryDate &&
      this.formExpiryDate < this.formManufacturingDate
    ) {
      this.error = 'Expiry date cannot be before manufacturing date.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateProductionBatchDto = {
        quantity: this.formQuantity,
        unitOfMeasure: this.formUnit,
        status: this.formStatus,
        manufacturingDate: this.formManufacturingDate || null,
        expiryDate: this.formExpiryDate || null,
        warehouseId: this.formWarehouseId || null,
        notes: this.formNotes || null,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
        },
        error: (err) => {
          this.error = this.formatErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
    } else {
      const order = this.productionOrdersById[this.formProductionOrderId];
      const orderNo = order?.orderNumber?.trim() || `PO-${this.formProductionOrderId.substring(0, 6)}`;
      const today = new Date().toISOString().substring(0, 10).replace(/-/g, '');
      const batchNumber = `${orderNo}-BATCH-${today}`;

      const dto: CreateProductionBatchDto = {
        batchNumber,
        productionOrderId: this.formProductionOrderId,
        productId: this.formProductId,
        quantity: this.formQuantity,
        unitOfMeasure: this.formUnit || null,
        manufacturingDate: this.formManufacturingDate || null,
        expiryDate: this.formExpiryDate || null,
        warehouseId: this.formWarehouseId || null,
        vendorBatchNumber: this.formVendorBatchNumber || null,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res) => {
          this.justCreated = res.data ?? null;
          this.showForm = false;
          this.load();
        },
        error: (err) => {
          this.error = this.formatErrorMessage(err);
          this.cdr.detectChanges();
        },
      });
    }
  }

  private formatErrorMessage(err: any): string {
    // During development, we can see details via console. For production, show generic message.
    const errorDetails = err?.error?.errors;
    if (errorDetails && typeof errorDetails === 'object') {
      const messages = Object.entries(errorDetails)
        .map(([field, msgs]: any) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
        .join(' | ');
      console.error('Batch validation errors:', messages);
      console.error('Full error response:', err?.error);
    } else {
      console.error('Batch operation error:', err?.error);
    }
    return 'An error occurred. Please check your data and try again.';
  }

  delete(item: ProductionBatchDto) {
    const batchLabel = item.batchNumber || 'this batch';
    const productLabel = this.getProductDisplayLabel(item.productId, item.productName, item.productionOrderId);
    const orderLabel = this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete batch ${batchLabel} — ${productLabel} (${orderLabel})?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => {
          this.error = 'Failed to delete';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
