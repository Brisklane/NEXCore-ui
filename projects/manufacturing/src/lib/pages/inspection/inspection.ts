import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { InspectionService } from '../../services/inspection.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ApiResponse } from '../../models/api-response.model';
import { ProductionOrderDto } from '../../models/production-order.model';
import { InspectionDto, CreateInspectionDto, UpdateInspectionDto } from '../../models/inspection.model';
import { RowHighlighter } from '@nexcore/shared';

interface InventoryItemLookupDto {
  id: string;
  code: string | null;
  name: string | null;
}

@Component({
  selector: 'lib-inspection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection.html',
  styleUrl: './inspection.css',
})
export class Inspection implements OnInit {
  items: InspectionDto[] = [];
  filteredItems: InspectionDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: InspectionDto | null = null;

  formProductionOrderId = '';
  formProductId = '';
  formProductLabel = '';
  formInspectionDate = '';
  formRemarks = '';
  formStatus = 'Pending';
  formInspectedQuantity = 0;
  formPassedQuantity = 0;
  formRejectedQuantity = 0;
  formPlannedQuantity: number | null = null;
  statusOptions = ['Pending', 'Pass', 'Fail', 'Partial'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  passCount = 0;
  failCount = 0;
  pendingCount = 0;
  overallPassRate = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  productDisplayById: Record<string, string> = {};
  productLabelsLoaded = false;
  orderNumberById: Record<string, string> = {};
  orderProductNameById: Record<string, string> = {};
  orderProductNameByNumber: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  productOptions: Array<{ id: string; label: string }> = [];

  constructor(
    private svc: InspectionService,
    private productionOrderSvc: ProductionOrderService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadProductLabels(); this.loadOrderLabels(); this.load(); }

  private refreshEditingProductContext() {
    if (!this.showForm || !this.editing) return;

    const order = this.productionOrdersById[this.formProductionOrderId];
    if (!this.formProductId && order?.productId?.trim()) {
      this.formProductId = order.productId.trim();
    }

    this.formProductLabel = this.getProductDisplayLabel(
      this.formProductId || this.editing.productId,
      this.editing.productName,
      this.formProductionOrderId || this.editing.productionOrderId,
      this.editing.orderNumber,
    );
  }

  private normalizeOrderNumber(orderNumber: string | null | undefined): string {
    return (orderNumber ?? '').trim().toLowerCase();
  }

  loadOrderLabels() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        this.allProductionOrders = r.data ?? [];
        this.productionOrdersById = {};
        this.allProductionOrders.forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
          if (o.productName?.trim()) this.orderProductNameById[o.id] = o.productName.trim();
          const normalizedOrderNumber = this.normalizeOrderNumber(o.orderNumber);
          if (normalizedOrderNumber && o.productName?.trim()) {
            this.orderProductNameByNumber[normalizedOrderNumber] = o.productName.trim();
          }
          this.productionOrdersById[o.id] = o;
        });
        this.rebuildProductionOrderOptions();
        this.refreshEditingProductContext();
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status ?? '').trim().toLowerCase();
  }

  private isEligibleInspectionOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'released' || normalized === 'inprogress' || normalized === 'completed' || normalized === 'closed';
  }

  private rebuildProductionOrderOptions() {
    // When creating: only eligible statuses AND not already inspected
    // When editing: show all (so the current order remains visible)
    const alreadyInspectedIds = new Set(this.items.map(i => i.productionOrderId).filter(Boolean));

    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(o =>
          this.isEligibleInspectionOrder(o.status) && !alreadyInspectedIds.has(o.id)
        );

    // Deduplicate by orderNumber to prevent duplicates in dropdown
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

  onProductionOrderChange() {
    const order = this.productionOrdersById[this.formProductionOrderId];
    if (!order) {
      this.formProductId = '';
      this.formProductLabel = '';
      this.formPlannedQuantity = null;
      return;
    }
    this.formProductId = order.productId || '';
    // Use order productName first (most reliable), then catalog lookup
    this.formProductLabel = order.productName?.trim()
      || this.orderProductNameById[this.formProductionOrderId]
      || (this.formProductId && this.productDisplayById[this.formProductId])
      || this.formProductId
      || '';
    this.formPlannedQuantity = order.quantityPlanned ?? null;
    this.cdr.detectChanges();
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  getPlannedQuantityContext(): string {
    if (this.formPlannedQuantity === null) return '';
    if (this.formPlannedQuantity <= 0) return '';
    return `Planned: ${this.formPlannedQuantity}`;
  }

  getInspectionContextHelp(): string {
    if (this.formPlannedQuantity !== null && this.formPlannedQuantity > 0 && this.formInspectedQuantity > this.formPlannedQuantity) {
      return `⚠ Inspected quantity (${this.formInspectedQuantity}) exceeds planned quantity (${this.formPlannedQuantity})`;
    }
    return '';
  }

  getQtySumState(): 'valid' | 'invalid' | 'empty' {
    if (this.formInspectedQuantity <= 0) return 'empty';
    const sum = (this.formPassedQuantity ?? 0) + (this.formRejectedQuantity ?? 0);
    return sum === this.formInspectedQuantity ? 'valid' : 'invalid';
  }

  getQtySumLabel(): string {
    if (this.formInspectedQuantity <= 0) return '';
    const sum = (this.formPassedQuantity ?? 0) + (this.formRejectedQuantity ?? 0);
    const diff = this.formInspectedQuantity - sum;
    if (sum === this.formInspectedQuantity) return '✓ Passed + Rejected = Inspected';
    if (diff > 0) return `${diff} remaining to allocate (${sum} of ${this.formInspectedQuantity})`;
    return `Over-allocated by ${-diff} — reduce Passed or Rejected`;
  }

  private inspectionExistsForOrder(orderId: string): boolean {
    return this.items.some(i => i.productionOrderId === orderId);
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
        this.refreshEditingProductContext();
        this.cdr.detectChanges();
      },
      error: () => {
        this.productLabelsLoaded = true;
      },
    });
  }

  getProductDisplayLabel(
    productId: string | null | undefined,
    productName: string | null | undefined,
    productionOrderId?: string | null,
    orderNumber?: string | null,
  ): string {
    // Priority 1: product name from the linked production order (most reliable — same source production-batch uses)
    if (productionOrderId) {
      const order = this.productionOrdersById[productionOrderId];
      const orderProductName = order?.productName;
      if (orderProductName?.trim()) return orderProductName.trim();
      if (this.orderProductNameById[productionOrderId]?.trim()) return this.orderProductNameById[productionOrderId].trim();
      const orderProductId = order?.productId?.trim();
      if (orderProductId && this.productDisplayById[orderProductId]) return this.productDisplayById[orderProductId];
    }
    // Priority 1b: fallback by order number (handles legacy rows where order ID is stale/mismatched)
    const normalizedOrderNumber = this.normalizeOrderNumber(orderNumber);
    if (normalizedOrderNumber && this.orderProductNameByNumber[normalizedOrderNumber]?.trim()) {
      return this.orderProductNameByNumber[normalizedOrderNumber].trim();
    }
    // Priority 2: catalog lookup by product ID
    if (productId && this.productDisplayById[productId]) return this.productDisplayById[productId];
    // Priority 3: stored product name on the inspection record itself
    if (productName?.trim()) return productName.trim();
    // Priority 4: raw product ID as last resort
    if (productId?.trim()) return productId.trim();
    return 'Unknown Product';
  }

  hasProductCatalogLabel(
    productId: string | null | undefined,
    productName: string | null | undefined,
    productionOrderId?: string | null,
    orderNumber?: string | null,
  ): boolean {
    const order = productionOrderId ? this.productionOrdersById[productionOrderId] : null;
    if (order?.productName?.trim()) return true;
    if (productionOrderId && this.orderProductNameById[productionOrderId]?.trim()) return true;
    if (order?.productId?.trim() && this.productDisplayById[order.productId.trim()]) return true;
    const normalizedOrderNumber = this.normalizeOrderNumber(orderNumber);
    if (normalizedOrderNumber && this.orderProductNameByNumber[normalizedOrderNumber]?.trim()) return true;
    if (productId && this.productDisplayById[productId]) return true;
    if (productName?.trim()) return true;
    return false;
  }

  private hydrateMissingOrderDetails() {
    const missingOrderIds = Array.from(new Set(
      this.items
        .map(i => i.productionOrderId)
        .filter((id): id is string => !!id && !this.productionOrdersById[id]),
    ));

    if (!missingOrderIds.length) {
      return;
    }

    const requests = missingOrderIds.map(id =>
      this.productionOrderSvc.getById(id).pipe(
        map(r => r.data ?? null),
        catchError(() => of(null)),
      ),
    );

    forkJoin(requests).subscribe({
      next: (orders) => {
        orders.forEach(order => {
          if (!order) return;
          this.productionOrdersById[order.id] = order;
          this.orderNumberById[order.id] = order.orderNumber?.trim() || `PO-${order.id.substring(0, 6)}`;
          if (order.productName?.trim()) this.orderProductNameById[order.id] = order.productName.trim();
          const normalizedOrderNumber = this.normalizeOrderNumber(order.orderNumber);
          if (normalizedOrderNumber && order.productName?.trim()) {
            this.orderProductNameByNumber[normalizedOrderNumber] = order.productName.trim();
          }
        });
        this.rebuildProductionOrderOptions();
        this.refreshEditingProductContext();
        this.cdr.detectChanges();
      },
    });
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

        // Seed lookup maps from inspection payload so labels render even when order lookup is delayed.
        this.items.forEach(item => {
          if (!item.productionOrderId) return;
          if (item.orderNumber?.trim() && !this.orderNumberById[item.productionOrderId]) {
            this.orderNumberById[item.productionOrderId] = item.orderNumber.trim();
          }
          if (item.productName?.trim() && !this.orderProductNameById[item.productionOrderId]) {
            this.orderProductNameById[item.productionOrderId] = item.productName.trim();
          }
          const normalizedOrderNumber = this.normalizeOrderNumber(item.orderNumber);
          if (normalizedOrderNumber && item.productName?.trim() && !this.orderProductNameByNumber[normalizedOrderNumber]) {
            this.orderProductNameByNumber[normalizedOrderNumber] = item.productName.trim();
          }
        });

        this.calcMetrics();
        this.applyFilters();
        this.rebuildProductionOrderOptions();
        this.hydrateMissingOrderDetails();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load inspections'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.passCount = this.items.filter(i => i.status === 'Pass').length;
    this.failCount = this.items.filter(i => i.status === 'Fail').length;
    this.pendingCount = this.items.filter(i => !i.status || i.status === 'Pending').length;
    const totalInspected = this.items.reduce((s, i) => s + (i.inspectedQty ?? 0), 0);
    const totalPassed = this.items.reduce((s, i) => s + (i.passedQty ?? 0), 0);
    this.overallPassRate = totalInspected > 0 ? Math.round((totalPassed / totalInspected) * 100) : 0;
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = !this.filterSearch ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productionOrderId?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const matchStatus = this.filterStatus === 'all' || item.status === this.filterStatus;
      return matchSearch && matchStatus;
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

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.filteredItems.some((i: any) => i?.id === c.id)) this.filteredItems = [c, ...this.filteredItems];
    this.highlighter.flash(c.id, this.cdr);
  }

  getPassRate(item: InspectionDto): number {
    if (!item.inspectedQty) return 0;
    return Math.round(((item.passedQty ?? 0) / item.inspectedQty) * 100);
  }

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = { Pass: 'badge-completed', Fail: 'badge-cancelled', Pending: 'badge-draft', Partial: 'badge-inprogress' };
    return map[status ?? ''] ?? 'badge-draft';
  }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }

  openEdit(item: InspectionDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    const order = this.productionOrdersById[this.formProductionOrderId];
    this.formProductId = item.productId ?? order?.productId ?? '';
    this.formProductLabel = this.getProductDisplayLabel(
      this.formProductId,
      item.productName,
      this.formProductionOrderId,
      item.orderNumber,
    );
    this.formInspectionDate = item.inspectedAt ? item.inspectedAt.substring(0, 10) : '';
    this.formRemarks = item.remarks ?? '';
    this.formStatus = item.status ?? 'Pending';
    this.formInspectedQuantity = item.inspectedQty ?? 0;
    this.formPassedQuantity = item.passedQty ?? 0;
    this.formRejectedQuantity = item.rejectedQty ?? 0;
    this.formPlannedQuantity = order?.quantityPlanned ?? null;
    this.rebuildProductionOrderOptions();
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formProductId = ''; this.formProductLabel = '';
    this.formInspectionDate = ''; this.formRemarks = ''; this.formStatus = 'Pending';
    this.formInspectedQuantity = 0; this.formPassedQuantity = 0;
    this.formRejectedQuantity = 0; this.formPlannedQuantity = null;
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order ID is required.'; this.cdr.detectChanges(); return; }
    if (!this.formProductId.trim()) { this.error = 'Product ID is required.'; this.cdr.detectChanges(); return; }
    if (this.formInspectedQuantity <= 0) { this.error = 'Inspected quantity must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (this.formPassedQuantity < 0 || this.formRejectedQuantity < 0) {
      this.error = 'Passed and rejected quantities cannot be negative.'; this.cdr.detectChanges(); return;
    }
    if (this.formPassedQuantity + this.formRejectedQuantity !== this.formInspectedQuantity) {
      this.error = 'Passed quantity + Rejected quantity must equal Inspected quantity.'; this.cdr.detectChanges(); return;
    }
    if (this.formPlannedQuantity !== null && this.formPlannedQuantity > 0 && this.formInspectedQuantity > this.formPlannedQuantity) {
      this.error = `Inspected quantity (${this.formInspectedQuantity}) cannot exceed planned quantity (${this.formPlannedQuantity}).`; this.cdr.detectChanges(); return;
    }
    if (!this.editing && !this.isEligibleInspectionOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Inspection can be created only for Released, InProgress, Completed, or Closed production orders.'; this.cdr.detectChanges(); return;
    }
    if (!this.editing && this.inspectionExistsForOrder(this.formProductionOrderId)) {
      this.error = 'An inspection for this production order already exists. Edit it instead or delete the existing one first.'; this.cdr.detectChanges(); return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateInspectionDto = { inspectedQty: this.formInspectedQuantity, passedQty: this.formPassedQuantity, rejectedQty: this.formRejectedQuantity, status: this.formStatus, inspectedAt: this.formInspectionDate || undefined, remarks: this.formRemarks || undefined };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateInspectionDto = { productionOrderId: this.formProductionOrderId, productId: this.formProductId, inspectedQty: this.formInspectedQuantity, passedQty: this.formPassedQuantity, inspectedAt: this.formInspectionDate || undefined, remarks: this.formRemarks || undefined };
      this.svc.create(dto).subscribe({
        next: (res) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  delete(item: InspectionDto) {
    const orderLabel = item.orderNumber?.trim() || this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete inspection for order "${orderLabel}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => {
          this.items = this.items.filter(i => i.id !== item.id);
          this.calcMetrics();
          this.applyFilters();
          this.rebuildProductionOrderOptions();
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
