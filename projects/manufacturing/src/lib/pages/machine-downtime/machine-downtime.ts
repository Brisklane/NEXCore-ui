import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MachineDowntimeService } from '../../services/machine-downtime.service';
import { ProductionOrderService } from '../../services/production-order.service';
import { WorkCenterService } from '../../services/work-center.service';
import { ManufacturingAuthHelper } from '../../services/manufacturing-auth-helper';
import { MANUFACTURING_API } from '../../services/manufacturing-api-config';
import { ProductionOrderDto } from '../../models/production-order.model';
import { MachineDowntimeDto, CreateMachineDowntimeDto, UpdateMachineDowntimeDto } from '../../models/machine-downtime.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-machine-downtime',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './machine-downtime.html',
  styleUrl: './machine-downtime.css',
})
export class MachineDowntime implements OnInit {
  items: MachineDowntimeDto[] = [];
  loading = false; error = ''; showForm = false; editing: MachineDowntimeDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];
  formWorkCenterId = ''; formProductionOrderId = ''; formStartTime = '';
  formEndTime = ''; formDowntimeHours = 0; formReason = ''; formCategory = 'Breakdown';
  formNotes = '';
  categories = ['Breakdown', 'Maintenance', 'Setup', 'Quality', 'Power', 'Other'];
  productionOrderOptions: Array<{ id: string; label: string }> = [];
  productionOrdersById: Record<string, ProductionOrderDto> = {};
  allProductionOrders: ProductionOrderDto[] = [];
  workCenterOptions: Array<{ id: string; label: string }> = [];
  orderNumberById: Record<string, string> = {};
  workCenterNameById: Record<string, string> = {};
  scheduleExtendInfo = '';
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  constructor(
    private svc: MachineDowntimeService,
    private productionOrderSvc: ProductionOrderService,
    private workCenterSvc: WorkCenterService,
    private http: HttpClient,
    private auth: ManufacturingAuthHelper,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit() { this.loadProductionOrders(); this.loadWorkCenters(); this.load(); }

  loadProductionOrders() {
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

  private isEligibleDowntimeOrder(status: string | null | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'released' || normalized === 'inprogress';
  }

  private rebuildProductionOrderOptions() {
    const optionsSource = this.editing
      ? this.allProductionOrders
      : this.allProductionOrders.filter((o) => this.isEligibleDowntimeOrder(o.status));

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

  loadWorkCenters() {
    this.workCenterSvc.getAll().subscribe({
      next: (r) => {
        const activeCenters = (r.data ?? []).filter(w => w.isActive);
        activeCenters.forEach(w => {
          this.workCenterNameById[w.id] = w.name?.trim() || `WC-${w.id.substring(0, 6)}`;
        });
        this.workCenterOptions = activeCenters.map(w => ({
          id: w.id,
          label: w.name?.trim() || `WC-${w.id.substring(0, 6)}`,
        })).sort((a, b) => a.label.localeCompare(b.label));
        this.cdr.detectChanges();
      },
      error: () => {
        this.workCenterOptions = [];
        this.cdr.detectChanges();
      },
    });
  }

  getWorkCenterLabel(workCenterId: string | null | undefined, workCenterName: string | null | undefined): string {
    if (workCenterName?.trim()) return workCenterName;
    if (workCenterId && this.workCenterNameById[workCenterId]) return this.workCenterNameById[workCenterId];
    if (workCenterId) return `WC-${workCenterId.substring(0, 6)}`;
    return 'Unmapped Work Center';
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

  onTimeChange() {
    if (!this.formStartTime || !this.formEndTime) return;
    const start = new Date(this.formStartTime).getTime();
    const end = new Date(this.formEndTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
    const hours = (end - start) / (1000 * 60 * 60);
    this.formDowntimeHours = Number(hours.toFixed(2));
  }

  load() {
    this.loading = true; this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false; this.applyJustCreated(); this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load downtime records'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() { this.editing = null; this.reset(); this.rebuildProductionOrderOptions(); this.showForm = true; }
  openEdit(item: MachineDowntimeDto) { this.editing = item; this.formWorkCenterId = item.workCenterId ?? ''; this.formProductionOrderId = item.productionOrderId ?? ''; this.formStartTime = item.startTime ? item.startTime.substring(0, 16) : ''; this.formEndTime = item.endTime ? item.endTime.substring(0, 16) : ''; this.formDowntimeHours = item.durationHours ?? 0; this.formReason = item.reason ?? ''; this.formCategory = item.category ?? 'Breakdown'; this.formNotes = item.notes ?? ''; this.rebuildProductionOrderOptions(); this.showForm = true; }
  reset() { this.formWorkCenterId = ''; this.formProductionOrderId = ''; this.formStartTime = ''; this.formEndTime = ''; this.formDowntimeHours = 0; this.formReason = ''; this.formCategory = 'Breakdown'; this.formNotes = ''; }
  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (!this.formWorkCenterId.trim()) { this.error = 'Work Center ID is required.'; this.cdr.detectChanges(); return; }
    if (this.formReason.trim().length === 0) { this.error = 'Reason is required.'; this.cdr.detectChanges(); return; }
    if (this.formDowntimeHours < 0) { this.error = 'Downtime hours cannot be negative.'; this.cdr.detectChanges(); return; }
    if (this.formStartTime && this.formEndTime) {
      const start = new Date(this.formStartTime).getTime();
      const end = new Date(this.formEndTime).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        this.error = 'End time must be after start time.';
        this.cdr.detectChanges();
        return;
      }
      if (this.formDowntimeHours === 0) {
        const calculatedHours = (end - start) / (1000 * 60 * 60);
        this.formDowntimeHours = Number(calculatedHours.toFixed(2));
      }
    }
    // Only enforce > 0 hours when a closed end time is present; open downtimes may have 0 hours
    if (this.formEndTime && this.formDowntimeHours <= 0) {
      this.error = 'Downtime hours must be greater than 0 when an end time is set.';
      this.cdr.detectChanges();
      return;
    }
    if (this.formProductionOrderId && !this.editing && !this.isEligibleDowntimeOrder(this.productionOrdersById[this.formProductionOrderId]?.status)) {
      this.error = 'Downtime can be linked only to Released or InProgress production orders.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editing) {
      const wasOpen = !this.editing.endTime;
      const closingNow = !!this.formEndTime;
      const linkedOrderId = this.formProductionOrderId;
      const durationHours = this.formDowntimeHours;

      const dto: UpdateMachineDowntimeDto = { reason: this.formReason || null, category: this.formCategory || null, startTime: this.formStartTime || null, endTime: this.formEndTime || null, durationHours: this.formDowntimeHours, notes: this.formNotes || null };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
          // Task 9: if downtime was just closed and linked to an order, extend schedule end dates
          if (wasOpen && closingNow && linkedOrderId && durationHours > 0) {
            this.extendSchedulesAfterDowntime(linkedOrderId, durationHours);
          }
        },
        error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); }
      });
    } else {
      const dto: CreateMachineDowntimeDto = { workCenterId: this.formWorkCenterId, productionOrderId: this.formProductionOrderId || null, startTime: this.formStartTime || null, endTime: this.formEndTime || null, durationHours: this.formDowntimeHours, reason: this.formReason || null, category: this.formCategory || null, notes: this.formNotes || null };
      this.svc.create(dto).subscribe({ next: (res: any) => { this.justCreated = res?.data ?? null; this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); } });
    }
  }

  // Task 9: Extend schedule end dates to account for downtime delay
  private extendSchedulesAfterDowntime(productionOrderId: string, durationHours: number) {
    this.http.get<any>(MANUFACTURING_API.productionSchedule.getByOrder(productionOrderId), {
      headers: this.auth.getAuthHeaders(),
    }).subscribe({
      next: (r) => {
        const raw: any[] = Array.isArray(r.data) ? r.data : (Array.isArray((r as any).items) ? (r as any).items : []);
        const active = raw.filter(s => s.scheduleType === 'Scheduled' || s.scheduleType === 'InProgress');
        if (active.length === 0) {
          this.scheduleExtendInfo = `Downtime closed. No active schedules found for this order to extend.`;
          this.cdr.detectChanges();
          setTimeout(() => { this.scheduleExtendInfo = ''; this.cdr.detectChanges(); }, 5000);
          return;
        }

        let done = 0;
        let extended = 0;
        const finish = () => {
          done++;
          if (done === active.length) {
            this.scheduleExtendInfo = extended > 0
              ? `${extended} schedule${extended === 1 ? '' : 's'} extended by ${durationHours}h to reflect the downtime delay.`
              : `Downtime closed but schedule end dates could not be updated — update them manually in Production Schedules.`;
            this.cdr.detectChanges();
            setTimeout(() => { this.scheduleExtendInfo = ''; this.cdr.detectChanges(); }, 6000);
          }
        };

        active.forEach(s => {
          const currentEnd = s.scheduledEndDate ? new Date(s.scheduledEndDate) : null;
          if (!currentEnd) { finish(); return; }
          const newEnd = new Date(currentEnd.getTime() + durationHours * 3600 * 1000);
          this.http.put<any>(MANUFACTURING_API.productionSchedule.update(s.id), {
            scheduledEndDate: newEnd.toISOString(),
            notes: `${s.notes ? s.notes + ' | ' : ''}Extended by ${durationHours}h due to machine downtime.`,
          }, { headers: this.auth.getAuthHeaders() }).subscribe({
            next: () => { extended++; finish(); },
            error: () => finish(),
          });
        });
      },
      error: () => {
        this.scheduleExtendInfo = 'Downtime closed. Could not fetch schedules to extend — update manually in Production Schedules.';
        this.cdr.detectChanges();
        setTimeout(() => { this.scheduleExtendInfo = ''; this.cdr.detectChanges(); }, 5000);
      },
    });
  }

  delete(item: MachineDowntimeDto) {
    const workCenterLabel = this.getWorkCenterLabel(item.workCenterId, item.workCenterName);
    const orderLabel = this.getOrderLabel(item.productionOrderId);
    if (confirm(`Delete downtime record for ${workCenterLabel} (${orderLabel})?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}
