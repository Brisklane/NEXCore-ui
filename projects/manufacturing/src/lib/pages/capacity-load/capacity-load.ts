import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CapacityLoadService } from '../../services/capacity-load.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { WorkCenterService } from '../../services/work-center.service';
import { CapacityLoadDto, CreateCapacityLoadDto, UpdateCapacityLoadDto } from '../../models/capacity-load.model';
import { RowHighlighter } from '@nexcore/shared';

interface ShiftOption {
  id: string;
  workCenterId: string;
  label: string;
  availableHours: number;
}

interface ProductionOrderOption {
  id: string;
  label: string;
}

@Component({
  selector: 'lib-capacity-load',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './capacity-load.html',
  styleUrl: './capacity-load.css',
})
export class CapacityLoad implements OnInit {
  items: CapacityLoadDto[] = [];
  filteredItems: CapacityLoadDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: CapacityLoadDto | null = null;

  formWorkCenterShiftId = '';
  formProductionOrderId = '';
  formLoadDate = '';
  formRequiredHours = 0;
  formAvailableHours = 0;

  filterSearch = '';

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  highlighter = new RowHighlighter();
  private justCreated: any = null;

  totalCount = 0;
  overloadedCount = 0;
  avgLoadPct = 0;
  totalRequiredHours = 0;
  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  shiftOptions: ShiftOption[] = [];
  productionOrderOptions: ProductionOrderOption[] = [];
  shiftLabelById: Record<string, string> = {};
  workCenterNameById: Record<string, string> = {};
  orderNumberById: Record<string, string> = {};
  // Client-side override: maps capacityLoad.id → productionOrderId when the backend doesn't echo it back
  private productionOrderOverrides: Record<string, string> = {};

  shiftSearchText = '';
  showShiftDropdown = false;
  showShiftPicker = false;
  shiftPickerSearch = '';
  shiftPickerPage = 1;
  readonly shiftPickerPageSize = 15;

  get filteredShiftSuggestions(): ShiftOption[] {
    const q = this.shiftSearchText.trim().toLowerCase();
    const list = q ? this.shiftOptions.filter(s => s.label.toLowerCase().includes(q)) : this.shiftOptions;
    return list.slice(0, 5);
  }

  get pickerFilteredShifts(): ShiftOption[] {
    const q = this.shiftPickerSearch.trim().toLowerCase();
    return q ? this.shiftOptions.filter(s => s.label.toLowerCase().includes(q)) : this.shiftOptions;
  }

  get shiftPickerTotal(): number { return this.pickerFilteredShifts.length; }
  get shiftPickerTotalPages(): number { return Math.max(1, Math.ceil(this.shiftPickerTotal / this.shiftPickerPageSize)); }
  get shiftPickerHasPrev(): boolean { return this.shiftPickerPage > 1; }
  get shiftPickerHasNext(): boolean { return this.shiftPickerPage < this.shiftPickerTotalPages; }
  get shiftPickerPageStart(): number { return this.shiftPickerTotal === 0 ? 0 : (this.shiftPickerPage - 1) * this.shiftPickerPageSize + 1; }
  get shiftPickerPageEnd(): number { return Math.min(this.shiftPickerPage * this.shiftPickerPageSize, this.shiftPickerTotal); }
  get shiftPickerPageItems(): ShiftOption[] {
    const start = (this.shiftPickerPage - 1) * this.shiftPickerPageSize;
    return this.pickerFilteredShifts.slice(start, start + this.shiftPickerPageSize);
  }

  constructor(
    private svc: CapacityLoadService,
    private productionOrderSvc: ProductionOrderService,
    private workCenterSvc: WorkCenterService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.load();
  }

  loadLookups() {
    this.loadProductionOrders();
    this.loadWorkCenterShifts();
  }

  loadProductionOrders() {
    this.productionOrderSvc.getAll().subscribe({
      next: (r) => {
        const orders = r.data ?? [];
        this.productionOrderOptions = orders.map(order => {
          const label = order.orderNumber?.trim() || `PO-${order.id.substring(0, 6)}`;
          this.orderNumberById[order.id] = label;
          return { id: order.id, label };
        });
        this.cdr.detectChanges();
      },
    });
  }

  loadWorkCenterShifts() {
    this.workCenterSvc.getAll().subscribe({
      next: (r) => {
        const workCenters = r.data ?? [];
        this.shiftOptions = [];
        this.shiftLabelById = {};
        this.workCenterNameById = {};

        workCenters.forEach(workCenter => {
          const workCenterLabel = workCenter.name?.trim() || workCenter.code?.trim() || `WC-${workCenter.id.substring(0, 6)}`;
          this.workCenterNameById[workCenter.id] = workCenterLabel;

          this.workCenterSvc.getShifts(workCenter.id).subscribe({
            next: (shiftRes) => {
              (shiftRes.data ?? []).forEach(shift => {
                const timeRange = [shift.startTime?.substring(0, 5), shift.endTime?.substring(0, 5)]
                  .filter((value): value is string => !!value)
                  .join(' - ');
                const shiftName = shift.shiftName?.trim() || 'Unnamed Shift';
                const label = timeRange
                  ? `${workCenterLabel} / ${shiftName} / ${timeRange}`
                  : `${workCenterLabel} / ${shiftName}`;

                this.shiftLabelById[shift.id] = label;
                this.shiftOptions.push({
                  id: shift.id,
                  workCenterId: workCenter.id,
                  label,
                  availableHours: shift.availableHours ?? 0,
                });
              });
              this.shiftOptions = [...this.shiftOptions].sort((left, right) => left.label.localeCompare(right.label));
              this.cdr.detectChanges();
            },
          });
        });

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
        this.calcMetrics();
        this.applyFilters();
        this.loading = false;
        this.applyJustCreated();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load capacity loads'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  calcMetrics() {
    this.totalCount = this.totalCount || this.items.length;
    this.overloadedCount = this.items.filter(i => i.isOverloaded).length;
    this.totalRequiredHours = this.items.reduce((s, i) => s + (i.requiredHours ?? 0), 0);
    this.avgLoadPct = this.totalCount > 0
      ? this.items.reduce((s, i) => s + (i.loadPercentage ?? 0), 0) / this.totalCount
      : 0;
  }

  applyFilters() {
    const search = this.filterSearch.toLowerCase();
    this.filteredItems = this.items.filter(item => {
      return !this.filterSearch ||
        this.getWorkCenterLabel(item.workCenterId, item.workCenterName).toLowerCase().includes(search) ||
        this.getShiftLabel(item.workCenterShiftId).toLowerCase().includes(search) ||
        this.getOrderLabel(item.productionOrderId).toLowerCase().includes(search);
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
    if (this.justCreated?.id != null) {
      this.highlighter.flash(this.justCreated.id, this.cdr);
      this.justCreated = null;
    }
  }

  getLoadClass(item: CapacityLoadDto): string {
    if (item.isOverloaded) return 'overload-danger';
    if ((item.loadPercentage ?? 0) >= 80) return 'overload-warning';
    return '';
  }

  getOrderLabel(id: string | null | undefined): string {
    if (!id) return 'No linked order';
    return this.orderNumberById[id] || `PO-${id.substring(0, 6)}`;
  }

  getEffectiveProductionOrderId(item: CapacityLoadDto): string | null {
    return item.productionOrderId || this.productionOrderOverrides[item.id] || null;
  }

  getShiftLabel(id: string | null | undefined): string {
    if (!id) return 'No shift selected';
    return this.shiftLabelById[id] || `Shift-${id.substring(0, 6)}`;
  }

  getWorkCenterLabel(workCenterId: string | null | undefined, workCenterName?: string | null): string {
    if (workCenterId && this.workCenterNameById[workCenterId]) {
      return this.workCenterNameById[workCenterId];
    }
    if (workCenterName?.trim()) {
      return workCenterName.trim();
    }
    if (workCenterId) {
      return `WC-${workCenterId.substring(0, 6)}`;
    }
    return 'Unmapped Work Center';
  }

  onShiftFocus() {
    if (!this.editing) this.showShiftDropdown = true;
  }

  onShiftInput() {
    this.formWorkCenterShiftId = '';
    this.formAvailableHours = 0;
    this.showShiftDropdown = true;
  }

  onShiftBlur() {
    setTimeout(() => { this.showShiftDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  selectShiftOption(shift: ShiftOption) {
    this.formWorkCenterShiftId = shift.id;
    this.shiftSearchText = shift.label;
    this.formAvailableHours = shift.availableHours;
    this.showShiftDropdown = false;
    this.showShiftPicker = false;
    this.cdr.detectChanges();
  }

  openShiftPicker() {
    this.showShiftDropdown = false;
    this.shiftPickerSearch = this.shiftSearchText.trim();
    this.shiftPickerPage = 1;
    this.showShiftPicker = true;
    this.cdr.detectChanges();
  }

  closeShiftPicker() {
    this.showShiftPicker = false;
    this.cdr.detectChanges();
  }

  onShiftPickerSearch() {
    this.shiftPickerPage = 1;
    this.cdr.detectChanges();
  }

  goToShiftPickerPage(page: number) {
    if (page < 1 || page > this.shiftPickerTotalPages) return;
    this.shiftPickerPage = page;
    this.cdr.detectChanges();
  }

  onShiftSelected() {
    const selectedShift = this.shiftOptions.find(option => option.id === this.formWorkCenterShiftId);
    if (selectedShift) {
      this.formAvailableHours = selectedShift.availableHours;
      this.cdr.detectChanges();
    }
  }

  openCreate() { this.editing = null; this.reset(); this.showForm = true; }

  openEdit(item: CapacityLoadDto) {
    this.editing = item;
    this.formWorkCenterShiftId = item.workCenterShiftId ?? '';
    this.shiftSearchText = this.shiftLabelById[item.workCenterShiftId ?? ''] || item.workCenterShiftId || '';
    // Use override if backend didn't echo the productionOrderId back
    this.formProductionOrderId = item.productionOrderId || this.productionOrderOverrides[item.id] || '';
    this.formLoadDate = item.date ? item.date.substring(0, 10) : '';
    this.formRequiredHours = item.requiredHours ?? 0;
    this.formAvailableHours = item.availableHours ?? 0;
    this.showForm = true;
  }

  reset() {
    this.formWorkCenterShiftId = ''; this.formProductionOrderId = '';
    this.formLoadDate = this.getTodayDateValue(); this.formRequiredHours = 0; this.formAvailableHours = 0;
    this.shiftSearchText = ''; this.showShiftDropdown = false; this.showShiftPicker = false;
  }

  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formWorkCenterShiftId.trim()) { this.error = 'Work center shift is required.'; this.cdr.detectChanges(); return; }
    if (!this.formLoadDate.trim()) { this.error = 'Date is required.'; this.cdr.detectChanges(); return; }
    if (this.formRequiredHours <= 0) { this.error = 'Required hours must be greater than 0.'; this.cdr.detectChanges(); return; }
    if (this.formAvailableHours <= 0) { this.error = 'Available hours must be greater than 0.'; this.cdr.detectChanges(); return; }
    this.error = '';

    const selectedShift = this.shiftOptions.find(option => option.id === this.formWorkCenterShiftId);
    if (!selectedShift) {
      this.error = 'Selected shift is no longer available. Please choose another shift.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editing) {
      const editingId = this.editing.id;
      const dto: UpdateCapacityLoadDto = { productionOrderId: this.formProductionOrderId || null, date: this.formLoadDate || null, requiredHours: this.formRequiredHours, availableHours: this.formAvailableHours };
      this.svc.update(editingId, dto).subscribe({
        next: () => {
          // Cache the selection locally — backend may not echo productionOrderId back in GET
          if (this.formProductionOrderId) {
            this.productionOrderOverrides[editingId] = this.formProductionOrderId;
          } else {
            delete this.productionOrderOverrides[editingId];
          }
          this.showForm = false;
          this.load();
        },
        error: (err: unknown) => { this.error = this.getApiErrorMessage(err, 'Failed to update capacity load'); this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateCapacityLoadDto = {
        workCenterShiftId: this.formWorkCenterShiftId,
        workCenterId: selectedShift.workCenterId,
        productionOrderId: this.formProductionOrderId || null,
        date: this.formLoadDate || null,
        requiredHours: this.formRequiredHours,
        availableHours: selectedShift.availableHours,
      };
      this.svc.create(dto).subscribe({
        next: (res: any) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); },
        error: (err: unknown) => { this.error = this.getApiErrorMessage(err, 'Failed to create capacity load'); this.cdr.detectChanges(); },
      });
    }
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const responseError = error.error;
      if (typeof responseError === 'string' && responseError.trim()) {
        return responseError.trim();
      }
      if (responseError && typeof responseError === 'object') {
        const validationErrors = (responseError as { errors?: Record<string, string[] | undefined> }).errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const firstKey = Object.keys(validationErrors)[0];
          const firstMessage = firstKey ? validationErrors[firstKey]?.[0] : null;
          if (firstMessage?.trim()) {
            return firstMessage.trim();
          }
        }

        const message = (responseError as { message?: string; title?: string; detail?: string }).message
          ?? (responseError as { title?: string }).title
          ?? (responseError as { detail?: string }).detail;
        if (message?.trim()) {
          return message.trim();
        }
      }
      if (error.status) {
        return `${fallback} (${error.status})`;
      }
    }
    return fallback;
  }

  private getTodayDateValue(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  delete(item: CapacityLoadDto) {
    if (confirm(`Delete capacity load for "${item.workCenterName ?? item.workCenterId}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); },
      });
    }
  }
}