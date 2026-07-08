import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubContractOrderService } from '../../services/subcontract-order.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductionOrderDto, ProductionOrderOperationDto } from '../../models/production-order.model';
import { SubContractOrderDto, CreateSubContractOrderDto, UpdateSubContractOrderDto } from '../../models/subcontract-order.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-subcontract-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subcontract-order.html',
  styleUrl: './subcontract-order.css',
})
export class SubcontractOrder implements OnInit {
  items: SubContractOrderDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: SubContractOrderDto | null = null;

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  formProductionOrderId = '';
  formProductionOrderOperationId = '';
  formVendorId = '';
  formQuantitySent = 0;
  formUnitOfMeasure = '';
  formUnitCost = 0;
  formExpectedReturnDate = '';
  formStatus = 'Draft';

  statusOptions = ['Draft', 'Sent', 'Confirmed', 'Received', 'Closed', 'Cancelled'];
  orderNumberById: Record<string, string> = {};
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  productionOrderOperationOptions: Array<{ id: string; label: string }> = [];
  vendorOptions: Array<{ id: string; label: string }> = [];
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  operationsLoading = false;

  private readonly guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(
    private svc: SubContractOrderService,
    private productionOrderSvc: ProductionOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadOrderLabels(); this.load(); }

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

  private isEligibleSubcontractOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'released' || normalized === 'inprogress' || normalized === 'completed' || normalized === 'closed';
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter(o => this.isEligibleSubcontractOrder(o.status));

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
    return this.getOrderLabel(this.formProductionOrderId || null);
  }

  onProductionOrderChange() {
    this.formProductionOrderOperationId = '';
    this.productionOrderOperationOptions = [];
    this.operationsLoading = false;

    const orderId = this.formProductionOrderId.trim();
    if (!orderId) {
      this.cdr.detectChanges();
      return;
    }

    this.operationsLoading = true;
    this.cdr.detectChanges();
    this.productionOrderSvc.getOperations(orderId).subscribe({
      next: (r) => {
        const operations = r.data ?? [];
        this.productionOrderOperationOptions = operations
          .map(op => ({ id: op.id, label: this.getOperationLabel(op) }))
          .sort((a, b) => a.label.localeCompare(b.label));

        if (this.productionOrderOperationOptions.length > 0) {
          this.formProductionOrderOperationId = this.productionOrderOperationOptions[0].id;
        }
        this.operationsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.productionOrderOperationOptions = [];
        this.formProductionOrderOperationId = '';
        this.operationsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private getOperationLabel(op: ProductionOrderOperationDto): string {
    const seq = op.sequenceNo ?? 0;
    const name = op.operationName?.trim() || 'Operation';
    const workCenter = op.workCenterName?.trim();
    return workCenter ? `${seq}. ${name} (${workCenter})` : `${seq}. ${name}`;
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

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load subcontract orders'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }

  openEdit(item: SubContractOrderDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formProductionOrderOperationId = item.productionOrderOperationId ?? '';
    this.formVendorId = item.vendorId ?? '';
    this.formQuantitySent = item.quantitySent ?? 0;
    this.formUnitOfMeasure = item.unitOfMeasure ?? '';
    this.formUnitCost = item.unitCost ?? 0;
    this.formExpectedReturnDate = item.expectedReturnDate ? item.expectedReturnDate.substring(0, 10) : '';
    this.formStatus = item.status ?? 'Draft';
    this.rebuildProductionOrderOptions();
    this.showForm = true;

    if (this.formProductionOrderId) {
      this.onProductionOrderChange();
    }
  }

  reset() {
    this.formProductionOrderId = '';
    this.formProductionOrderOperationId = '';
    this.formVendorId = '';
    this.formQuantitySent = 0;
    this.formUnitOfMeasure = '';
    this.formUnitCost = 0;
    this.formExpectedReturnDate = '';
    this.formStatus = 'Draft';
    this.productionOrderOperationOptions = [];
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  private toIsoDateOrUndefined(dateValue: string): string | undefined {
    const trimmed = dateValue.trim();
    if (!trimmed) return undefined;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }

  private buildCreateDto(): CreateSubContractOrderDto {
    const dto: CreateSubContractOrderDto = {
      vendorId: this.formVendorId.trim(),
      quantitySent: this.formQuantitySent,
      unitCost: this.formUnitCost,
      status: this.formStatus || 'Sent',
      sentAt: new Date().toISOString(),
    };

    if (this.formProductionOrderId.trim()) {
      dto.productionOrderId = this.formProductionOrderId.trim();
      dto.productionOrderOperationId = this.formProductionOrderOperationId.trim();
    }

    const unit = this.formUnitOfMeasure.trim();
    if (unit) {
      dto.unitOfMeasure = unit;
    }

    const expected = this.toIsoDateOrUndefined(this.formExpectedReturnDate);
    if (expected) {
      dto.expectedReturnDate = expected;
    }

    return dto;
  }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order is required.'; this.cdr.detectChanges(); return; }
    if (!this.guidPattern.test(this.formProductionOrderId.trim())) { this.error = 'Production Order ID is invalid.'; this.cdr.detectChanges(); return; }
    if (!this.formVendorId.trim()) { this.error = 'Vendor ID is required.'; this.cdr.detectChanges(); return; }
    if (!this.guidPattern.test(this.formVendorId.trim())) { this.error = 'Vendor ID must be a valid GUID.'; this.cdr.detectChanges(); return; }
    if (this.formQuantitySent <= 0) { this.error = 'Quantity must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (this.formUnitCost < 0) { this.error = 'Unit cost cannot be negative.'; this.cdr.detectChanges(); return; }
    if (this.operationsLoading) { this.error = 'Operations are still loading. Please wait and try again.'; this.cdr.detectChanges(); return; }
    if (this.formExpectedReturnDate && this.formExpectedReturnDate < new Date().toISOString().substring(0, 10)) {
      this.error = 'Expected return date cannot be in the past.'; this.cdr.detectChanges(); return;
    }
    if (!this.isEligibleSubcontractOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Subcontract order can be created only for Released, InProgress, Completed, or Closed production orders.'; this.cdr.detectChanges(); return;
    }
    if (!this.formProductionOrderOperationId.trim()) {
      this.error = 'Operation is required for the selected production order.'; this.cdr.detectChanges(); return;
    }
    if (!this.guidPattern.test(this.formProductionOrderOperationId.trim())) {
      this.error = 'Selected operation is invalid. Please reselect the production order and operation.'; this.cdr.detectChanges(); return;
    }
    if (!this.productionOrderOperationOptions.some(op => op.id === this.formProductionOrderOperationId.trim())) {
      this.error = 'Selected operation does not belong to this production order.'; this.cdr.detectChanges(); return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateSubContractOrderDto = { vendorId: this.formVendorId, quantitySent: this.formQuantitySent, unitOfMeasure: this.formUnitOfMeasure, unitCost: this.formUnitCost, expectedReturnDate: this.formExpectedReturnDate || undefined, status: this.formStatus };
      this.svc.update(this.editing.id, dto).subscribe({ next: () => { this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); } });
    } else {
      const dto = this.buildCreateDto();
      this.svc.create(dto).subscribe({ next: (res) => { this.justCreated = res.data ?? null; this.showForm = false; this.load(); }, error: () => { this.error = 'Unable to create subcontract order. Check Vendor ID/Operation and try again.'; this.cdr.detectChanges(); } });
    }
  }

  delete(item: SubContractOrderDto) {
    const orderLabel = item.orderNumber?.trim() || this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete subcontract order "${orderLabel}"?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}
