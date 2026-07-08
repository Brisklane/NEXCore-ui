import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReworkOrderService } from '../../services/rework-order.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { InspectionService } from '../../services/inspection.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { ProductionOrderDto } from '../../models/production-order.model';
import { InspectionDto } from '../../models/inspection.model';
import { ReworkOrderDto, CreateReworkOrderDto, UpdateReworkOrderDto } from '../../models/rework-order.model';
import { MANUFACTURING_API } from '../../services/manufacturing-api-config';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-rework-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rework-order.html',
  styleUrl: './rework-order.css',
})
export class ReworkOrder implements OnInit {
  items: ReworkOrderDto[] = [];
  filteredItems: ReworkOrderDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: ReworkOrderDto | null = null;

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  formProductionOrderId = '';
  formInspectionId = '';
  formQuantity = 0;
  formUnitOfMeasure = '';
  formReason = '';
  formStartDate = '';
  formEndDate = '';
  formStatus = 'Open';
  statusOptions = ['Open', 'InProgress', 'Completed', 'Closed'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  openCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalReworkQty = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  orderNumberById: Record<string, string> = {};
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  reworkEligibleOrderIds = new Set<string>();
  hasLoadedReworkEligibility = false;
  
  inspectionsByOrderId: Record<string, InspectionDto[]> = {};
  inspectionOptions: Array<{ id: string; label: string; rejectedQty: number }> = [];
  inspectionLabelById: Record<string, string> = {};
  loadingInspections = false;
  resumeInfo = '';

  constructor(
    private svc: ReworkOrderService,
    private productionOrderSvc: ProductionOrderService,
    private inspectionSvc: InspectionService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
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
        this.loadReworkEligibility();
        this.cdr.detectChanges();
      },
    });
  }

  private loadReworkEligibility() {
    this.inspectionSvc.getAll().subscribe({
      next: (r) => {
        const inspections = r.data ?? [];
        this.reworkEligibleOrderIds = new Set(
          inspections
            .filter(i => this.getRejectedQty(i) > 0)
            .map(i => i.productionOrderId),
        );
        this.hasLoadedReworkEligibility = true;
        this.rebuildProductionOrderOptions();

        // If selected order is no longer eligible, reset dependent inputs.
        if (this.formProductionOrderId && !this.reworkEligibleOrderIds.has(this.formProductionOrderId)) {
          this.formProductionOrderId = '';
          this.formInspectionId = '';
          this.formQuantity = 0;
          this.inspectionOptions = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep existing fallback behavior when eligibility preload fails.
        this.hasLoadedReworkEligibility = false;
      },
    });
  }

  private rebuildProductionOrderOptions() {
    // Filter: exclude orders that are fully passed/completed with no rejected quantity.
    // Also deduplicate by orderNumber to prevent duplicates in dropdown
    const seen = new Set<string>();
    const eligibleOrders = this.allProductionOrders.filter(o => {
      if (this.hasLoadedReworkEligibility && !this.reworkEligibleOrderIds.has(o.id)) {
        return false;
      }

      const planned = o.quantityPlanned ?? 0;
      const produced = o.quantityProduced ?? 0;
      const rejected = o.quantityRejected ?? 0;
      const status = (o.status ?? '').toLowerCase();

      const isFullyPassed = planned > 0 && produced >= planned && rejected <= 0;
      const isTerminalWithoutRejects = (status === 'completed' || status === 'closed') && rejected <= 0;
      if (isFullyPassed || isTerminalWithoutRejects) return false;

      // Deduplicate
      const key = (o.orderNumber?.trim() || o.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.productionOrderOptions = eligibleOrders.map(o => ({
      id: o.id,
      label: o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }

  getSelectedOrderLabel(): string {
    return this.getOrderLabel(this.formProductionOrderId);
  }

  onProductionOrderChange() {
    const order = this.productionOrdersById[this.formProductionOrderId];
    if (!order) {
      this.formUnitOfMeasure = '';
      this.formInspectionId = '';
      this.formQuantity = 0;
      this.inspectionOptions = [];
      this.loadingInspections = false;
      return;
    }

    // Reset dependent fields whenever production order changes.
    this.formInspectionId = '';
    this.formQuantity = 0;

    if (!this.formUnitOfMeasure.trim() && order.unitOfMeasure?.trim()) {
      this.formUnitOfMeasure = order.unitOfMeasure.trim();
    }

    // Load inspections for selected production order
    if (this.inspectionsByOrderId[this.formProductionOrderId]) {
      this.loadingInspections = false;
      this.rebuildInspectionOptions();
    } else {
      this.loadingInspections = true;
      this.cdr.detectChanges();
      this.inspectionSvc.getByOrder(this.formProductionOrderId).subscribe({
        next: (r) => {
          const inspections = r.data ?? [];
          this.inspectionsByOrderId[this.formProductionOrderId] = inspections;
          inspections.forEach(insp => {
            const dateStr = insp.inspectedAt ? new Date(insp.inspectedAt).toLocaleDateString() : 'N/A';
            const rejectedQty = this.getRejectedQty(insp);
            this.inspectionLabelById[insp.id] = `Inspection ${dateStr} (${rejectedQty} rejected)`;
          });
          this.rebuildInspectionOptions();
          this.loadingInspections = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load inspections for order:', this.formProductionOrderId, err);
          this.inspectionsByOrderId[this.formProductionOrderId] = [];
          this.rebuildInspectionOptions();
          this.loadingInspections = false;
          this.cdr.detectChanges();
        },
      });
    }

    this.cdr.detectChanges();
  }

  private rebuildInspectionOptions() {
    const inspections = this.inspectionsByOrderId[this.formProductionOrderId] ?? [];
    const sortedInspections = inspections
      .filter(i => this.getRejectedQty(i) > 0)
      .sort((a, b) => new Date(b.inspectedAt ?? 0).getTime() - new Date(a.inspectedAt ?? 0).getTime());

    this.inspectionOptions = sortedInspections.map(insp => ({
      id: insp.id,
      label: this.inspectionLabelById[insp.id] || `Inspection (${this.getRejectedQty(insp)} rejected)`,
      rejectedQty: this.getRejectedQty(insp),
    }));

    // Auto-select the most recent rejected inspection if no selection yet.
    if (this.inspectionOptions.length > 0 && !this.formInspectionId) {
      const mostRecent = sortedInspections[0];
      this.formInspectionId = mostRecent.id;
      this.autoPopulateQuantity(mostRecent);
    }
  }

  onInspectionChange(inspectionId: string) {
    const inspection = (this.inspectionsByOrderId[this.formProductionOrderId] ?? []).find(i => i.id === inspectionId);
    if (inspection) {
      this.autoPopulateQuantity(inspection);
    }
  }

  private autoPopulateQuantity(inspection: InspectionDto) {
    // Always sync quantity with rejected quantity for consistent rework defaults.
    this.formQuantity = this.getRejectedQty(inspection);
  }

  private getRejectedQty(inspection: InspectionDto): number {
    if (inspection.rejectedQty !== null && inspection.rejectedQty !== undefined) {
      return Math.max(inspection.rejectedQty, 0);
    }

    // Fallback: some APIs omit rejectedQty but provide inspected/passed.
    const inspected = inspection.inspectedQty ?? 0;
    const passed = inspection.passedQty ?? 0;
    return Math.max(inspected - passed, 0);
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
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
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load rework orders'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.openCount = this.items.filter(i => i.status === 'Open').length;
    this.inProgressCount = this.items.filter(i => i.status === 'InProgress').length;
    this.completedCount = this.items.filter(i => i.status === 'Completed' || i.status === 'Closed').length;
    this.totalReworkQty = this.items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = !this.filterSearch ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.reason?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
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

  getCompletionPct(item: ReworkOrderDto): number {
    if (!item.quantity) return 0;
    return Math.min(Math.round(((item.quantityCompleted ?? 0) / item.quantity) * 100), 100);
  }

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = { Open: 'badge-open', InProgress: 'badge-inprogress', Completed: 'badge-completed', Closed: 'badge-completed' };
    return map[status ?? ''] ?? '';
  }

  getStatusOptionLabel(status: string): string {
    if (status === 'InProgress') return 'In Progress';
    return status;
  }

  quickUpdateStatus(item: ReworkOrderDto, status: string) {
    this.svc.update(item.id, { status }).subscribe({
      next: () => {
        if (status === 'Completed') {
          this.resumeProductionOrderAfterRework(item);
        } else {
          this.load();
        }
      },
      error: () => { this.error = 'Failed to update status'; this.cdr.detectChanges(); },
    });
  }

  // Task 10: Restore parent production order to InProgress (called on rework create AND complete)
  private resumeProductionOrderAfterRework(reworkOrder: { productionOrderId: string }) {
    if (!reworkOrder.productionOrderId) {
      this.load();
      return;
    }
    const orderId = reworkOrder.productionOrderId;
    const orderLabel = this.orderNumberById[orderId] || `PO-${orderId.substring(0, 6)}`;

    this.http.put<any>(
      MANUFACTURING_API.productionOrder.update(orderId),
      { status: 'InProgress' },
      { headers: this.auth.getAuthHeaders() },
    ).subscribe({
      next: () => {
        this.resumeInfo = `Rework complete. Production order ${orderLabel} has been returned to In Progress.`;
        this.cdr.detectChanges();
        this.load();
        setTimeout(() => { this.resumeInfo = ''; this.cdr.detectChanges(); }, 8000);
      },
      error: () => {
        this.resumeInfo = `Rework complete. Could not auto-resume ${orderLabel} — update its status manually in Production Orders.`;
        this.cdr.detectChanges();
        this.load();
        setTimeout(() => { this.resumeInfo = ''; this.cdr.detectChanges(); }, 8000);
      },
    });
  }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }

  openEdit(item: ReworkOrderDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formInspectionId = item.inspectionId ?? '';
    this.formQuantity = item.quantity ?? 0;
    this.formUnitOfMeasure = item.unitOfMeasure ?? '';
    this.formReason = item.reason ?? '';
    this.formStartDate = item.scheduledStartDate ? item.scheduledStartDate.substring(0, 10) : '';
    this.formEndDate = item.scheduledEndDate ? item.scheduledEndDate.substring(0, 10) : '';
    this.formStatus = item.status ?? 'Open';
    
    // Load inspections for the production order if not already loaded
    if (this.inspectionsByOrderId[this.formProductionOrderId]) {
      this.rebuildInspectionOptions();
    } else if (this.formProductionOrderId) {
      this.inspectionSvc.getByOrder(this.formProductionOrderId).subscribe({
        next: (r) => {
          const inspections = r.data ?? [];
          this.inspectionsByOrderId[this.formProductionOrderId] = inspections;
          inspections.forEach(insp => {
            const dateStr = insp.inspectedAt ? new Date(insp.inspectedAt).toLocaleDateString() : 'N/A';
            const rejectedQty = this.getRejectedQty(insp);
            this.inspectionLabelById[insp.id] = `Inspection ${dateStr} (${rejectedQty} rejected)`;
          });
          this.rebuildInspectionOptions();
        },
        error: (err) => {
          console.error('Failed to load inspections:', err);
          this.inspectionsByOrderId[this.formProductionOrderId] = [];
          this.rebuildInspectionOptions();
        },
      });
    }
    
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formInspectionId = ''; this.formQuantity = 0;
    this.formUnitOfMeasure = ''; this.formReason = ''; this.formStartDate = '';
    this.formEndDate = ''; this.formStatus = 'Open';
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  private toIsoDateOrUndefined(dateValue: string): string | undefined {
    const trimmed = dateValue.trim();
    if (!trimmed) return undefined;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }

  private buildCreateDto(): CreateReworkOrderDto {
    const dto: CreateReworkOrderDto = {
      productionOrderId: this.formProductionOrderId,
      inspectionId: this.formInspectionId,
      quantity: this.formQuantity,
      status: 'Open',
    };

    const unit = this.formUnitOfMeasure.trim();
    if (unit) dto.unitOfMeasure = unit;

    const reason = this.formReason.trim();
    dto.reason = reason || 'Quality rejection requires rework.';

    const startDate = this.toIsoDateOrUndefined(this.formStartDate);
    if (startDate) dto.scheduledStartDate = startDate;

    const endDate = this.toIsoDateOrUndefined(this.formEndDate);
    if (endDate) dto.scheduledEndDate = endDate;

    return dto;
  }

  save() {
    if (!this.formProductionOrderId.trim()) { this.error = 'Production Order is required.'; this.cdr.detectChanges(); return; }
    if (!this.formInspectionId.trim()) { this.error = 'Inspection is required.'; this.cdr.detectChanges(); return; }
    if (this.formQuantity <= 0) { this.error = 'Quantity must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (!this.formUnitOfMeasure.trim()) { this.error = 'Unit of Measure is required.'; this.cdr.detectChanges(); return; }
    if (this.formStartDate && this.formEndDate && this.formEndDate < this.formStartDate) {
      this.error = 'End date must be on or after start date.'; this.cdr.detectChanges(); return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateReworkOrderDto = { quantity: this.formQuantity, unitOfMeasure: this.formUnitOfMeasure, reason: this.formReason || undefined, scheduledStartDate: this.formStartDate || undefined, scheduledEndDate: this.formEndDate || undefined, status: this.formStatus };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => {
          console.error('Rework update failed', err);
          this.error = 'Unable to update rework order. Please check required fields and try again.';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto = this.buildCreateDto();
      const poIdForResume = this.formProductionOrderId;
      this.svc.create(dto).subscribe({
        next: (res) => { this.justCreated = res.data ?? null; this.showForm = false; this.resumeProductionOrderAfterRework({ productionOrderId: poIdForResume }); },
        error: (err) => {
          console.error('Rework create failed', err);
          this.error = 'Unable to create rework order. Please check required fields and try again.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: ReworkOrderDto) {
    const orderLabel = item.orderNumber?.trim() || this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete rework order "${orderLabel}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
