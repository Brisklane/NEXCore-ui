import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FacilityService } from '../../services/fitness.services';
import {
  EquipmentAssetDto, FaultReportDto, MaintenanceScheduleDto, WorkOrderDto,
} from '../../models/fitness.models';
import {
  AssetStatus, ASSET_STATUS_LABELS, WorkOrderPriority, WORK_ORDER_PRIORITY_LABELS,
  WorkOrderStatus, WORK_ORDER_STATUS_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Every machine, its condition, and the work outstanding on it.
 *
 * Taking a machine out of service here is not a status change on a list — it propagates. The spot
 * on the rig map goes dark, the resource stops being bookable, and anyone already booked onto it
 * is moved and told. A broken treadmill still showing as bookable is how a member's evening gets
 * wasted, and it is the failure this screen exists to prevent.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-equipment',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './equipment.html',
  styleUrls: ['../fitness-shared.css', './equipment.css'],
})
export class EquipmentComponent {
  private facilities = inject(FacilityService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  assets: EquipmentAssetDto[] = [];
  workOrders: WorkOrderDto[] = [];
  maintenance: MaintenanceScheduleDto[] = [];
  faults: FaultReportDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'assets' | 'work' | 'maintenance' = 'assets';
  status: AssetStatus | null = null;
  search = '';

  /** Changing a machine's status. */
  changing: EquipmentAssetDto | null = null;
  newStatus = AssetStatus.OutOfOrder;
  statusNote = '';
  busy = false;

  readonly statusLabels = ASSET_STATUS_LABELS;
  readonly workStatusLabels = WORK_ORDER_STATUS_LABELS;
  readonly priorityLabels = WORK_ORDER_PRIORITY_LABELS;
  readonly statusOptions = enumOptions(ASSET_STATUS_LABELS);
  readonly AssetStatus = AssetStatus;
  readonly WorkOrderStatus = WorkOrderStatus;
  readonly WorkOrderPriority = WorkOrderPriority;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  onSearchChange(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.load(), 260);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [assets, work, maintenance, faults] = await Promise.all([
      firstValueFrom(this.facilities.getEquipment({
        clubId: this.clubId ?? undefined,
        status: this.status ?? undefined,
        search: this.search.trim() || undefined,
        size: 100,
      })).catch(() => null),
      firstValueFrom(this.facilities.getWorkOrders({ clubId: this.clubId ?? undefined, size: 50 }))
        .catch(() => null),
      firstValueFrom(this.facilities.getMaintenance(this.clubId ?? undefined, false)).catch(() => null),
      firstValueFrom(this.facilities.getFaults(this.clubId ?? undefined, true)).catch(() => null),
    ]);

    this.assets = assets?.data ?? [];
    this.workOrders = work?.data ?? [];
    this.maintenance = maintenance?.data ?? [];
    this.faults = faults?.data ?? [];

    if (!assets) this.error = 'Could not load the equipment.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Status ─────────────────────────────────────────────────────────────

  startChange(a: EquipmentAssetDto): void {
    this.changing = a;
    this.newStatus = a.status === AssetStatus.OutOfOrder ? AssetStatus.InService : AssetStatus.OutOfOrder;
    this.statusNote = '';
  }

  async confirmChange(): Promise<void> {
    if (!this.changing) return;

    this.busy = true;
    const res = await firstValueFrom(this.facilities.setAssetStatus(
      this.changing.id, this.newStatus, this.statusNote.trim() || undefined,
    )).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = this.newStatus === AssetStatus.OutOfOrder
        ? `${this.changing.name} taken out of service. Bookings on it have been moved and members told.`
        : `${this.changing.name} back in service.`;
      this.changing = null;
      await this.load();
    } else {
      this.error = 'Could not change that status.';
    }

    this.cdr.detectChanges();
  }

  async generateDue(): Promise<void> {
    const res = await firstValueFrom(this.facilities.generateDueWorkOrders()).catch(() => null);

    if (res?.data != null) {
      this.notice = res.data === 0
        ? 'Nothing was due.'
        : `${res.data} work order${res.data === 1 ? '' : 's'} raised for servicing that has fallen due.`;
      await this.load();
    } else {
      this.error = 'Could not raise the work orders.';
    }
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get outOfService(): EquipmentAssetDto[] {
    return this.assets.filter(a => a.status === AssetStatus.OutOfOrder);
  }

  get openWorkOrders(): WorkOrderDto[] {
    return this.workOrders.filter(w => w.status !== WorkOrderStatus.Completed
                                    && w.status !== WorkOrderStatus.Cancelled);
  }

  assetClass(a: EquipmentAssetDto): string {
    switch (a.status) {
      case AssetStatus.OutOfOrder: return 'is-alert';
      case AssetStatus.UnderMaintenance: return 'is-warn';
      case AssetStatus.InService: return 'is-good';
      default: return '';
    }
  }

  workClass(w: WorkOrderDto): string {
    if (w.priority >= WorkOrderPriority.Critical) return 'is-alert';
    if (w.isOverdue) return 'is-warn';
    return '';
  }

  /** Servicing due by date or by hours run, whichever comes first. */
  maintenanceDue(m: MaintenanceScheduleDto): string {
    if (m.isOverdue) return 'Overdue';
    if (m.nextDueOn) return `Due ${new Date(m.nextDueOn).toLocaleDateString()}`;
    if (m.intervalUsageHours > 0) return `Every ${m.intervalUsageHours} hours run`;
    if (m.intervalDays > 0) return `Every ${m.intervalDays} days`;
    return 'Not scheduled';
  }
}
