import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;
import { ApiResponse } from '../../models/api-response.model';
import { ProductionScheduleService } from '../../services/production-schedule.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { WorkCenterService } from '../../services/work-center.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { MANUFACTURING_API } from '../../services/manufacturing-api-config';
import { ProductionScheduleDto, CreateProductionScheduleDto, UpdateProductionScheduleDto } from '../../models/production-schedule.model';
import { OptionPickerInputComponent, OptionPickerItem, OptionPickerColumn } from '../../components/option-picker-input/option-picker-input';
import { RowHighlighter } from '@nexcore/shared';

interface OperationOption {
  id: string;
  label: string;
  productionOrderId: string;
}

interface WorkCenterOption {
  id: string;
  name: string;
}

@Component({
  selector: 'lib-production-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, OptionPickerInputComponent],
  templateUrl: './production-schedule.html',
  styleUrl: './production-schedule.css',
})
export class ProductionSchedule implements OnInit {
  items: ProductionScheduleDto[] = [];
  filteredItems: ProductionScheduleDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: ProductionScheduleDto | null = null;

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  formProductionOrderId = '';
  formProductionOrderOperationId = '';
  formWorkCenterId = '';
  formScheduledStart = '';
  formScheduledEnd = '';
  formCapacityHours = 0;
  formScheduleType = 'Scheduled';
  formNotes = '';
  statusOptions = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];

  filterSearch = '';
  filterStatus = 'all';

  totalCount = 0;
  scheduledCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  conflictCount = 0;

  // Capacity conflict detection (Task 7)
  workCenterAvailableHours: Record<string, number> = {};
  capacityUsageByKey: Record<string, number> = {};
  computedConflictByScheduleId: Record<string, { overloadPct: number; totalHours: number; available: number }> = {};
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  orderNumberById: Record<string, string> = {};
  operationLabelById: Record<string, string> = {};
  workCenterLabelById: Record<string, string> = {};
  operationOptions: OperationOption[] = [];
  workCenterOptions: WorkCenterOption[] = [];
  productionOrderOptionsList: Array<{ id: string; label: string }> = [];
  poPickerOptions: OptionPickerItem[] = [];
  formPoPickerText = '';
  private productDisplayById: Record<string, string> = {};
  private storedOrders: any[] = [];
  readonly poColumns: OptionPickerColumn[] = [
    { key: 'order', header: 'Order #' },
    { key: 'product', header: 'Product' },
    { key: 'poStatus', header: 'Status' },
    { key: 'start', header: 'Start' },
    { key: 'end', header: 'End' },
  ];
  operationSearchText = '';
  showOperationDropdown = false;
  showOperationPicker = false;
  operationPickerSearch = '';
  operationPickerPage = 1;
  readonly operationPickerPageSize = 15;

  get filteredOperationSuggestions(): OperationOption[] {
    const q = this.operationSearchText.trim().toLowerCase();
    const list = q
      ? this.operationOptions.filter(op => op.label.toLowerCase().includes(q))
      : this.operationOptions;
    return list.slice(0, 5);
  }

  get pickerFilteredOperations(): OperationOption[] {
    const q = this.operationPickerSearch.trim().toLowerCase();
    return q
      ? this.operationOptions.filter(op => op.label.toLowerCase().includes(q))
      : this.operationOptions;
  }

  get operationPickerTotal(): number { return this.pickerFilteredOperations.length; }
  get operationPickerTotalPages(): number { return Math.max(1, Math.ceil(this.operationPickerTotal / this.operationPickerPageSize)); }
  get operationPickerHasPrev(): boolean { return this.operationPickerPage > 1; }
  get operationPickerHasNext(): boolean { return this.operationPickerPage < this.operationPickerTotalPages; }
  get operationPickerPageStart(): number { return this.operationPickerTotal === 0 ? 0 : (this.operationPickerPage - 1) * this.operationPickerPageSize + 1; }
  get operationPickerPageEnd(): number { return Math.min(this.operationPickerPage * this.operationPickerPageSize, this.operationPickerTotal); }

  get operationPickerPageItems(): OperationOption[] {
    const start = (this.operationPickerPage - 1) * this.operationPickerPageSize;
    return this.pickerFilteredOperations.slice(start, start + this.operationPickerPageSize);
  }

  constructor(
    private svc: ProductionScheduleService,
    private productionOrderSvc: ProductionOrderService,
    private workCenterSvc: WorkCenterService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadWorkCenters(() => {
      this.loadOrderLabels();
    });
    this.loadProductLabels();
    this.load();
  }

  loadProductLabels() {
    this.http.get<ApiResponse<any[]>>(`${BASE_URL}/api/Item/basic`, {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        (r.data ?? []).forEach((item: any) => {
          const code = item.code?.trim() ?? '';
          const name = item.name?.trim() ?? '';
          if (code && name) this.productDisplayById[item.id] = `${code} - ${name}`;
          else if (name) this.productDisplayById[item.id] = name;
          else if (code) this.productDisplayById[item.id] = code;
        });
        this.buildPoPickerOptions();
        this.cdr.detectChanges();
      },
    });
  }

  private buildPoPickerOptions() {
    this.poPickerOptions = this.storedOrders.map((o: any) => {
      const orderNum = this.orderNumberById[o.id] || o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
      const productName = this.productDisplayById[o.productId] || o.productName?.trim() || '';
      const label = productName ? `${orderNum} · ${productName}` : orderNum;
      return {
        id: o.id,
        label,
        meta: {
          order: orderNum,
          product: productName || '—',
          poStatus: o.status || '—',
          start: o.startDate ? new Date(o.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          end: o.endDate ? new Date(o.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        },
      };
    }).sort((a: OptionPickerItem, b: OptionPickerItem) => a.label.localeCompare(b.label));
  }

  loadWorkCenters(onComplete?: () => void) {
    this.workCenterSvc.getAll().subscribe({
      next: (r) => {
        const centers = r.data ?? [];
        centers.forEach(wc => {
          this.workCenterLabelById[wc.id] = wc.name || `WC-${wc.id.substring(0, 6)}`;
          this.workCenterOptions.push({ id: wc.id, name: wc.name || `WC-${wc.id.substring(0, 6)}` });
        });
        this.cdr.detectChanges();
        // Load shifts for each work center to get daily available hours
        centers.forEach(wc => {
          this.http.get<any>(MANUFACTURING_API.workCenter.getShifts(wc.id), {
            headers: this.auth.getAuthHeaders(),
          }).subscribe({
            next: (sr) => {
              const shifts: any[] = Array.isArray(sr.data) ? sr.data : [];
              const totalAvailable = shifts.reduce((s: number, sh: any) => s + (sh.availableHours ?? 0), 0);
              this.workCenterAvailableHours[wc.id] = totalAvailable > 0 ? totalAvailable : 8;
              this.cdr.detectChanges();
            },
            error: () => { this.workCenterAvailableHours[wc.id] = 8; },
          });
        });
        if (onComplete) onComplete();
      },
    });
  }

  private operationsLoaded = false;

  loadOrderLabels() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        const orders = r.data ?? [];
        this.storedOrders = orders;
        orders.forEach(o => {
          this.orderNumberById[o.id] = o.orderNumber?.trim() || `PO-${o.id.substring(0, 6)}`;
        });
        this.productionOrderOptionsList = orders
          .map(o => ({ id: o.id, label: this.orderNumberById[o.id] }))
          .sort((a, b) => a.label.localeCompare(b.label));
        this.buildPoPickerOptions();
        this.cdr.detectChanges();
        // Operations are loaded lazily on first focus of the operation search field
      },
    });
  }

  private loadOperationsIfNeeded() {
    if (this.operationsLoaded || this.storedOrders.length === 0) return;
    this.operationsLoaded = true;
    this.storedOrders.forEach((po: any) => {
      this.productionOrderSvc.getOperations(po.id).subscribe({
        next: (opRes) => {
          (opRes.data ?? []).forEach((op: any) => {
            const poLabel = this.orderNumberById[po.id];
            let wcLabel = this.workCenterLabelById[op.workCenterId];
            if (!wcLabel) {
              wcLabel = op.workCenterName || `WC-${op.workCenterId?.substring(0, 6) || 'unknown'}`;
            }
            const label = `${poLabel} / OP-${op.sequenceNo?.toString().padStart(3, '0') || '000'} / ${wcLabel}`;
            this.operationLabelById[op.id] = label;
            this.operationOptions.push({ id: op.id, label, productionOrderId: op.productionOrderId });
          });
          this.cdr.detectChanges();
        },
      });
    });
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  onPoSelected(item: OptionPickerItem) {
    this.formProductionOrderId = item.id;
    this.formPoPickerText = item.label;
    this.cdr.detectChanges();
  }

  getOperationLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.operationLabelById[id] || id.substring(0, 8);
  }

  getWorkCenterLabel(id: string | null | undefined): string {
    if (!id) return '—';
    return this.workCenterLabelById[id] || id.substring(0, 8);
  }

  onOperationFocus() {
    if (!this.editing) {
      this.loadOperationsIfNeeded();
      this.showOperationDropdown = true;
    }
  }

  onOperationInput() {
    this.formProductionOrderOperationId = '';
    this.formProductionOrderId = '';
    this.showOperationDropdown = true;
  }

  onOperationBlur() {
    setTimeout(() => { this.showOperationDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  selectOperationOption(op: OperationOption) {
    this.formProductionOrderOperationId = op.id;
    this.formProductionOrderId = op.productionOrderId;
    this.operationSearchText = op.label;
    this.showOperationDropdown = false;
    this.showOperationPicker = false;
    this.cdr.detectChanges();
  }

  openOperationPicker() {
    this.showOperationDropdown = false;
    this.operationPickerSearch = this.operationSearchText.trim();
    this.operationPickerPage = 1;
    this.showOperationPicker = true;
    this.cdr.detectChanges();
  }

  closeOperationPicker() {
    this.showOperationPicker = false;
    this.cdr.detectChanges();
  }

  onOperationPickerSearch() {
    this.operationPickerPage = 1;
    this.cdr.detectChanges();
  }

  goToOperationPickerPage(page: number) {
    if (page < 1 || page > this.operationPickerTotalPages) return;
    this.operationPickerPage = page;
    this.cdr.detectChanges();
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
      error: () => { this.error = 'Failed to load schedules'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.scheduledCount = this.items.filter(i => i.scheduleType === 'Scheduled').length;
    this.inProgressCount = this.items.filter(i => i.scheduleType === 'InProgress').length;
    this.completedCount = this.items.filter(i => i.scheduleType === 'Completed').length;
    this.computeCapacityConflicts();
    this.conflictCount = this.items.filter(i => i.hasCapacityConflict || this.hasComputedConflict(i)).length;
  }

  // Task 7: Compute capacity conflicts from schedule data
  private computeCapacityConflicts() {
    const usage: Record<string, number> = {};
    this.items
      .filter(i => i.scheduleType !== 'Cancelled' && i.scheduleType !== 'Completed')
      .forEach(i => {
        const dateKey = i.scheduledStartDate ? i.scheduledStartDate.substring(0, 10) : 'unknown';
        const key = `${i.workCenterId}|${dateKey}`;
        usage[key] = (usage[key] ?? 0) + (i.capacityRequiredHours ?? 0);
      });
    this.capacityUsageByKey = usage;

    this.computedConflictByScheduleId = {};
    this.items.forEach(i => {
      const dateKey = i.scheduledStartDate ? i.scheduledStartDate.substring(0, 10) : 'unknown';
      const key = `${i.workCenterId}|${dateKey}`;
      const totalHours = usage[key] ?? 0;
      const available = this.workCenterAvailableHours[i.workCenterId] ?? 8;
      if (totalHours > available) {
        this.computedConflictByScheduleId[i.id] = {
          overloadPct: Math.round(((totalHours - available) / available) * 100),
          totalHours,
          available,
        };
      }
    });
  }

  hasComputedConflict(item: ProductionScheduleDto): boolean {
    return !!this.computedConflictByScheduleId[item.id];
  }

  getConflictLabel(item: ProductionScheduleDto): string {
    const computed = this.computedConflictByScheduleId[item.id];
    if (computed) {
      return `+${computed.overloadPct}% overload (${computed.totalHours.toFixed(1)}h scheduled / ${computed.available}h available)`;
    }
    return item.conflictDescription || 'Capacity conflict';
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = !this.filterSearch ||
        item.orderNumber?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.workCenterName?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.productionOrderId?.toLowerCase().includes(this.filterSearch.toLowerCase());
      const matchStatus = this.filterStatus === 'all' || item.scheduleType === this.filterStatus;
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

  getStatusClass(status: string | null): string {
    const map: Record<string, string> = { Scheduled: 'badge-planned', InProgress: 'badge-inprogress', Completed: 'badge-completed', Cancelled: 'badge-cancelled' };
    return map[status ?? ''] ?? '';
  }

  quickUpdateStatus(item: ProductionScheduleDto, type: string) {
    this.svc.update(item.id, { scheduleType: type }).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to update status'; this.cdr.detectChanges(); },
    });
  }

  openCreate() { this.editing = null; this.reset(); this.showForm = true; }

  openEdit(item: ProductionScheduleDto) {
    this.editing = item;
    this.formProductionOrderId = item.productionOrderId ?? '';
    this.formPoPickerText = item.productionOrderId
      ? (this.poPickerOptions.find(o => o.id === item.productionOrderId)?.label ?? this.orderNumberById[item.productionOrderId] ?? '')
      : '';
    this.formProductionOrderOperationId = item.productionOrderOperationId ?? '';
    this.operationSearchText = this.operationLabelById[item.productionOrderOperationId ?? ''] || item.productionOrderOperationId || '';
    this.formWorkCenterId = item.workCenterId ?? '';
    this.formScheduledStart = item.scheduledStartDate ? item.scheduledStartDate.substring(0, 10) : '';
    this.formScheduledEnd = item.scheduledEndDate ? item.scheduledEndDate.substring(0, 10) : '';
    this.formCapacityHours = item.capacityRequiredHours ?? 0;
    this.formScheduleType = item.scheduleType ?? 'Scheduled';
    this.formNotes = item.notes ?? '';
    this.showForm = true;
  }

  reset() {
    this.formProductionOrderId = ''; this.formProductionOrderOperationId = '';
    this.formPoPickerText = '';
    this.formWorkCenterId = ''; this.formScheduledStart = ''; this.formScheduledEnd = '';
    this.formCapacityHours = 0; this.formScheduleType = 'Scheduled'; this.formNotes = '';
    this.operationSearchText = ''; this.showOperationDropdown = false; this.showOperationPicker = false;
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.editing && !this.formProductionOrderId.trim()) {
      this.error = 'Production Order is required.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.formWorkCenterId.trim()) {
      this.error = 'Work Center is required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formScheduledStart && this.formScheduledEnd && this.formScheduledEnd < this.formScheduledStart) {
      this.error = 'Scheduled end cannot be before start date.'; 
      this.cdr.detectChanges(); 
      return;
    }
    this.error = '';

    if (this.editing) {
      const dto: UpdateProductionScheduleDto = { 
        workCenterId: this.formWorkCenterId, 
        scheduledStartDate: this.formScheduledStart || null, 
        scheduledEndDate: this.formScheduledEnd || null, 
        scheduleType: this.formScheduleType, 
        capacityRequiredHours: this.formCapacityHours, 
        notes: this.formNotes || null 
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateProductionScheduleDto = {
        productionOrderId: this.formProductionOrderId || null,
        productionOrderOperationId: this.formProductionOrderOperationId || null,
        workCenterId: this.formWorkCenterId,
        scheduledStartDate: this.formScheduledStart || null,
        scheduledEndDate: this.formScheduledEnd || null,
        scheduleType: this.formScheduleType,
        capacityRequiredHours: this.formCapacityHours,
        notes: this.formNotes || null,
      };
      this.svc.create(dto).subscribe({
        next: (res: any) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); },
        error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  delete(item: ProductionScheduleDto) {
    if (confirm(`Delete schedule for order "${item.orderNumber ?? item.productionOrderId}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}
