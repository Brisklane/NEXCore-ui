import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FloorService, RestaurantStaffService } from '../../services/restaurant.services';
import {
  RestaurantStaffDto, SaveRestaurantStaffDto, SectionDto, StaffShiftDto, TipPoolDto,
} from '../../models/restaurant.models';
import {
  SHIFT_STATUS_LABELS, STAFF_ROLE_LABELS, StaffRole, TIP_BASIS_LABELS, TipDistributionBasis,
  enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'people' | 'roster' | 'tips';

/**
 * Staff, the roster and tip pooling.
 *
 * PINs are set here but never shown — the API returns only whether one exists. A restaurant till
 * is a shared device in a public room, and a PIN that can be read off a settings screen is not a
 * control at all.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-staff',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './staff.html',
  styleUrls: ['../restaurant-shared.css', './staff.css'],
})
export class StaffComponent {
  private api = inject(RestaurantStaffService);
  private floors = inject(FloorService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'people';
  outletId: string | null = null;

  people: RestaurantStaffDto[] = [];
  shifts: StaffShiftDto[] = [];
  sections: SectionDto[] = [];
  pools: TipPoolDto[] = [];

  weekStart = this.mondayOf(new Date());

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  editing: SaveRestaurantStaffDto | null = null;
  editingId: string | null = null;

  pinFor: RestaurantStaffDto | null = null;
  pin = '';
  pinConfirm = '';

  shiftEditor: { staffId: string; date: string; start: string; end: string; sectionId: string; role: StaffRole } | null = null;

  poolEditor: { name: string; start: string; end: string; basis: TipDistributionBasis; kitchenShare: number } | null = null;

  readonly roleOptions = enumOptions(STAFF_ROLE_LABELS);
  readonly roleLabels = STAFF_ROLE_LABELS;
  readonly shiftLabels = SHIFT_STATUS_LABELS;
  readonly basisOptions = enumOptions(TIP_BASIS_LABELS);
  readonly basisLabels = TIP_BASIS_LABELS;

  private mondayOf(d: Date): string {
    const copy = new Date(d);
    const day = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - day);
    return copy.toISOString().slice(0, 10);
  }

  get weekDays(): string[] {
    const start = new Date(this.weekStart);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const [people, sections] = await Promise.all([
      firstValueFrom(this.api.getStaff(this.outletId, undefined, false)).catch(() => null),
      firstValueFrom(this.floors.getSections(this.outletId)).catch(() => null),
    ]);

    this.people = people?.data ?? [];
    this.sections = sections?.data ?? [];

    if (this.tab === 'roster') await this.loadShifts();
    if (this.tab === 'tips') await this.loadPools();

    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadShifts(): Promise<void> {
    if (!this.outletId) return;
    const days = this.weekDays;

    const res = await firstValueFrom(this.api.getShifts(
      this.outletId,
      new Date(days[0]).toISOString(),
      new Date(days[6] + 'T23:59:59').toISOString(),
    )).catch(() => null);

    this.shifts = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async loadPools(): Promise<void> {
    if (!this.outletId) return;
    const res = await firstValueFrom(this.api.getTipPools(this.outletId)).catch(() => null);
    this.pools = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async switchTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (tab === 'roster') await this.loadShifts();
    if (tab === 'tips') await this.loadPools();
  }

  shiftFor(staffId: string, day: string): StaffShiftDto | undefined {
    return this.shifts.find(s => s.staffId === staffId && s.shiftDate.slice(0, 10) === day);
  }

  async shiftWeek(delta: number): Promise<void> {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + delta * 7);
    this.weekStart = d.toISOString().slice(0, 10);
    await this.loadShifts();
  }

  // ── People ─────────────────────────────────────────────────────────

  newPerson(): void {
    this.fieldErrors = {};
    if (!this.outletId) return;
    this.editingId = null;
    this.editing = {
      code: null,
      outletId: this.outletId,
      fullName: '',
      displayName: null,
      role: StaffRole.Waiter,
      userId: null,
      employeeId: null,
      phone: null,
      email: null,
      photoUrl: null,
      canTakeOrders: true,
      canVoidLines: false,
      canApplyDiscounts: false,
      canApproveDiscounts: false,
      canOpenCashDrawer: false,
      canCloseSession: false,
      canRunReports: false,
      canEditMenu: false,
      canManageTables: true,
      canServeAlcohol: true,
      defaultSectionId: null,
      hourlyRate: null,
      tipSharePercent: null,
      hiredOn: null,
      isActive: true,
      note: null,
    };
    this.error = '';
  }

  edit(p: RestaurantStaffDto): void {
    this.fieldErrors = {};
    this.editingId = p.id;
    this.editing = {
      code: p.code ?? null,
      outletId: p.outletId,
      fullName: p.fullName,
      displayName: p.displayName ?? null,
      role: p.role,
      userId: p.userId ?? null,
      employeeId: p.employeeId ?? null,
      phone: p.phone ?? null,
      email: p.email ?? null,
      photoUrl: p.photoUrl ?? null,
      canTakeOrders: p.canTakeOrders,
      canVoidLines: p.canVoidLines,
      canApplyDiscounts: p.canApplyDiscounts,
      canApproveDiscounts: p.canApproveDiscounts,
      canOpenCashDrawer: p.canOpenCashDrawer,
      canCloseSession: p.canCloseSession,
      canRunReports: p.canRunReports,
      canEditMenu: p.canEditMenu,
      canManageTables: p.canManageTables,
      canServeAlcohol: p.canServeAlcohol,
      defaultSectionId: p.defaultSectionId ?? null,
      hourlyRate: p.hourlyRate ?? null,
      tipSharePercent: p.tipSharePercent ?? null,
      hiredOn: p.hiredOn ?? null,
      isActive: p.isActive,
      note: p.note ?? null,
    };
    this.error = '';
  }

  async save(): Promise<void> {
    if (!this.editing) return;
    this.fieldErrors = validate(this.editing as unknown as Record<string, unknown>, {
      fullName: [required('A full name'), maxLength(160, 'The name')],
      displayName: [maxLength(60, 'The display name')],
      phone: [maxLength(40, 'The phone number')],
      hourlyRate: [notNegative('The hourly rate')],
      tipSharePercent: [between(0, 100, 'The tip share')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const call = this.editingId
      ? this.api.update(this.editingId, this.editing)
      : this.api.create(this.editing);

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not save.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Saved.'; this.editing = null; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  async remove(p: RestaurantStaffDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.api.delete(p.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not remove.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'Removed.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  startPin(p: RestaurantStaffDto): void {
    this.fieldErrors = {};
    this.pinFor = p;
    this.pin = '';
    this.pinConfirm = '';
    this.error = '';
  }

  async savePin(): Promise<void> {
    if (!this.pinFor) return;
    this.fieldErrors = validate({ pin: this.pin, pinConfirm: this.pinConfirm }, {
      pin: [required('A PIN'), digits(4, 6, 'The PIN')],
      pinConfirm: [(v, all) => v !== all['pin'] ? 'The two PINs do not match.' : null],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.api.setPin({ staffId: this.pinFor.id, pin: this.pin }))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not set the PIN.';
        return null;
      });

    this.busy = false;
    if (res) { this.notice = 'PIN set.'; this.pinFor = null; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── Roster ─────────────────────────────────────────────────────────

  startShift(staffId: string, date: string): void {
    this.fieldErrors = {};
    const person = this.people.find(p => p.id === staffId);
    this.shiftEditor = {
      staffId,
      date,
      start: '11:00',
      end: '23:00',
      sectionId: person?.defaultSectionId ?? '',
      role: person?.role ?? StaffRole.Waiter,
    };
    this.error = '';
  }

  async saveShift(): Promise<void> {
    const s = this.shiftEditor;
    if (!s || !this.outletId) return;

    this.fieldErrors = validate(s as unknown as Record<string, unknown>, {
      staffId: [required('Someone to put on the shift')],
      start: [required('A start time')],
      end: [
        required('An end time'),
        (v, all) => v && all['start'] && new Date(String(v)) <= new Date(String(all['start']))
          ? 'The shift must end after it starts.' : null,
      ],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.api.createShift({
      outletId: this.outletId,
      staffId: s.staffId,
      shiftDate: new Date(s.date).toISOString(),
      scheduledStart: s.start + ':00',
      scheduledEnd: s.end + ':00',
      sectionId: s.sectionId || null,
      role: s.role,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not add the shift.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Shift added.'; this.shiftEditor = null; await this.loadShifts(); }
    this.cdr.detectChanges();
  }

  async deleteShift(s: StaffShiftDto): Promise<void> {
    this.busy = true;
    await firstValueFrom(this.api.deleteShift(s.id)).catch(() => null);
    this.busy = false;
    await this.loadShifts();
  }

  // ── Tips ───────────────────────────────────────────────────────────

  newPool(): void {
    this.fieldErrors = {};
    const end = new Date();
    const start = new Date(Date.now() - 6 * 864e5);

    this.poolEditor = {
      name: `Week to ${end.toLocaleDateString()}`,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      basis: TipDistributionBasis.ByHoursWorked,
      kitchenShare: 0,
    };
    this.error = '';
  }

  async savePool(): Promise<void> {
    const p = this.poolEditor;
    if (!p || !this.outletId) return;

    this.fieldErrors = validate(p as unknown as Record<string, unknown>, {
      name: [required('A name for the pool'), maxLength(120, 'The pool name')],
      kitchenShare: [between(0, 100, "The kitchen's share")],
      start: [required('A start of the period')],
      end: [
        required('An end of the period'),
        (v, all) => v && all['start'] && new Date(String(v)) < new Date(String(all['start']))
          ? 'The period must end after it starts.' : null,
      ],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.api.createTipPool({
      outletId: this.outletId,
      name: p.name,
      periodStart: new Date(p.start).toISOString(),
      periodEnd: new Date(p.end + 'T23:59:59').toISOString(),
      basis: p.basis,
      kitchenSharePercent: p.kitchenShare,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not create the pool.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Pool created and calculated.'; this.poolEditor = null; await this.loadPools(); }
    this.cdr.detectChanges();
  }

  async recalc(p: TipPoolDto): Promise<void> {
    this.busy = true;
    await firstValueFrom(this.api.calculateTipPool(p.id)).catch(() => null);
    this.busy = false;
    this.notice = 'Recalculated.';
    await this.loadPools();
  }

  async finalise(p: TipPoolDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.api.finaliseTipPool(p.id))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not finalise.';
        return null;
      });

    this.busy = false;
    if (res?.data) { this.notice = 'Pool finalised.'; await this.loadPools(); }
    this.cdr.detectChanges();
  }

  trackPerson = (_: number, p: RestaurantStaffDto) => p.id;
  trackPool = (_: number, p: TipPoolDto) => p.id;
}
