import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  DistributionAdminService, LogisticsService, OrderService,
} from '../../services/distribution.services';
import {
  DriverDto, OrderSummaryDto, PaginationMetadata, ReasonCodeDto, TripDto, TripExpenseDto,
  TripStopDto, TripSummaryDto, VehicleDto,
} from '../../models/distribution.models';
import {
  EXPENSE_LABELS, ReasonSurface, STOP_STATUS_LABELS, STOP_STATUS_TONE, TRIP_STATUS_LABELS,
  TRIP_STATUS_TONE, TripExpenseKind, TripStatus, TripStopStatus, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * Delivery trips.
 *
 * The trip is where the cost of serving a route actually shows up: fuel, tolls, a failed stop that
 * has to be driven again tomorrow. Recording expenses against the trip rather than into a general
 * fuel account is what makes cost-per-drop a real number instead of an allocation.
 *
 * A failed stop needs a reason and, almost always, a reschedule date. A failure with neither is a
 * delivery that quietly never happens.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-trips',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './trips.html',
  styleUrls: ['../distribution-shared.css', './trips.css'],
})
export class TripsComponent implements OnInit, OnDestroy {
  private logistics = inject(LogisticsService);
  private orders = inject(OrderService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  rows: TripSummaryDto[] = [];
  meta: PaginationMetadata | null = null;
  detail: TripDto | null = null;

  vehicles: VehicleDto[] = [];
  drivers: DriverDto[] = [];
  readyOrders: OrderSummaryDto[] = [];
  failureReasons: ReasonCodeDto[] = [];

  loading = true;
  loadingDetail = false;
  busy = false;
  error = '';
  notice = '';

  statusFilter = '' as '' | number;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';

  // Build a trip
  showBuild = false;
  build = {
    tripDate: new Date().toISOString().slice(0, 10),
    vehicleId: '',
    driverId: '',
    helperName: '',
    useRouteSequence: true,
    note: '',
  };
  buildSelection = new Set<string>();

  // Start / end
  showStart = false;
  start = { odometerOutKm: null as number | null, fuelIssued: null as number | null };
  showEnd = false;
  end = { odometerInKm: null as number | null, note: '' };

  // Fail a stop
  failTarget: TripStopDto | null = null;
  fail = { reasonCodeId: '', note: '', rescheduleFor: '' };

  // Expense
  showExpense = false;
  expense = {
    kind: TripExpenseKind.Fuel,
    amount: null as number | null,
    reference: '',
    note: '',
  };

  readonly statusOptions = enumOptions(TRIP_STATUS_LABELS);
  readonly expenseOptions = enumOptions(EXPENSE_LABELS);
  readonly statusLabels = TRIP_STATUS_LABELS;
  readonly statusTone = TRIP_STATUS_TONE;
  readonly stopStatusLabels = STOP_STATUS_LABELS;
  readonly stopStatusTone = STOP_STATUS_TONE;
  readonly expenseLabels = EXPENSE_LABELS;
  readonly TripStatus = TripStatus;
  readonly TripStopStatus = TripStopStatus;

  private timer?: ReturnType<typeof setInterval>;

  async ngOnInit(): Promise<void> {
    const [vehiclesRes, driversRes, reasonsRes] = await Promise.all([
      firstValueFrom(this.logistics.vehicles({ pageSize: 200, isActive: true })).catch(() => null),
      firstValueFrom(this.logistics.drivers({ pageSize: 200, isActive: true })).catch(() => null),
      firstValueFrom(this.admin.reasons({ surface: ReasonSurface.DeliveryFailure })).catch(() => null),
    ]);

    this.vehicles = vehiclesRes?.data ?? [];
    this.drivers = driversRes?.data ?? [];
    this.failureReasons = reasonsRes?.data ?? [];

    await this.load();
    this.timer = setInterval(() => void this.refreshDetail(), 60_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.fromDate = scope.from;
    this.toDate = scope.to;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.logistics.trips({
      page: this.page,
      pageSize: this.pageSize,
      status: this.statusFilter || undefined,
      territoryId: this.territoryId || undefined,
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;
      const keep = this.detail && this.rows.some(t => t.id === this.detail!.id) ? this.detail.id : this.rows[0]?.id;
      if (keep) await this.open(keep);
      else this.detail = null;
    } else {
      this.error = 'Could not load the trips.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  async open(id: string): Promise<void> {
    this.loadingDetail = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.logistics.trip(id)).catch(() => null);
    this.detail = res?.data ?? null;

    this.loadingDetail = false;
    this.cdr.detectChanges();
  }

  /** A trip in progress is being updated by a driver's device; the list is not. */
  private async refreshDetail(): Promise<void> {
    if (!this.detail || this.detail.status !== TripStatus.InProgress) return;

    const res = await firstValueFrom(this.logistics.trip(this.detail.id)).catch(() => null);
    if (res?.data) this.detail = res.data;
    this.cdr.detectChanges();
  }

  // ── Building ───────────────────────────────────────────────────────────────

  async openBuild(): Promise<void> {
    this.buildSelection.clear();
    this.build = {
      tripDate: new Date().toISOString().slice(0, 10),
      vehicleId: '',
      driverId: '',
      helperName: '',
      useRouteSequence: true,
      note: '',
    };

    const res = await firstValueFrom(this.orders.list({ pageSize: 200, readyToDispatch: true })).catch(() => null);
    this.readyOrders = res?.data ?? [];

    this.showBuild = true;
    this.cdr.detectChanges();
  }

  toggleBuild(id: string): void {
    if (this.buildSelection.has(id)) this.buildSelection.delete(id);
    else this.buildSelection.add(id);
  }

  /** Compliance-expired vehicles are hidden rather than shown and refused later. */
  get usableVehicles(): VehicleDto[] {
    return this.vehicles.filter(v => !v.hasExpiredCompliance);
  }

  async createTrip(): Promise<void> {
    if (this.buildSelection.size === 0 || this.busy) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.logistics.createTrip({
      tripDate: this.build.tripDate,
      vehicleId: this.build.vehicleId || undefined,
      driverId: this.build.driverId || undefined,
      helperName: this.build.helperName || undefined,
      useRouteSequence: this.build.useRouteSequence,
      note: this.build.note || undefined,
      orderIds: [...this.buildSelection],
    })).catch(() => null);

    if (res?.data) {
      this.showBuild = false;
      this.detail = res.data;
      this.notice = `Trip ${res.data.tripNumber} built with ${res.data.plannedStops} stops.`;
      await this.load();
    } else {
      this.error = 'The trip could not be built.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async startTrip(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.logistics.startTrip({
      tripId: this.detail.id,
      odometerOutKm: Number(this.start.odometerOutKm ?? 0),
      fuelIssued: Number(this.start.fuelIssued ?? 0),
    })).catch(() => null);

    if (res?.data) { this.detail = res.data; this.showStart = false; await this.load(); }
    else this.error = 'The trip could not be started.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  async endTrip(): Promise<void> {
    if (!this.detail || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.logistics.endTrip({
      tripId: this.detail.id,
      odometerInKm: Number(this.end.odometerInKm ?? 0),
      note: this.end.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.detail = res.data;
      this.showEnd = false;
      this.notice = `Trip closed — ${res.data.distanceKm} km, ${res.data.costPerDrop.toFixed(2)} per drop.`;
      await this.load();
    } else {
      this.error = 'The trip could not be closed.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async arrive(stop: TripStopDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.logistics.arrive({ stopId: stop.id })).catch(() => null);
    if (res?.data) await this.refreshDetail();
    else this.error = 'The arrival could not be recorded.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  startFail(stop: TripStopDto): void {
    this.failTarget = stop;
    this.fail = { reasonCodeId: '', note: '', rescheduleFor: '' };
  }

  async confirmFail(): Promise<void> {
    if (!this.failTarget || !this.fail.reasonCodeId) return;

    this.busy = true;
    const res = await firstValueFrom(this.logistics.failStop({
      stopId: this.failTarget.id,
      reasonCodeId: this.fail.reasonCodeId,
      note: this.fail.note || undefined,
      rescheduleFor: this.fail.rescheduleFor || undefined,
    })).catch(() => null);

    if (res?.data) { this.failTarget = null; await this.open(this.detail!.id); }
    else this.error = 'The failed stop could not be recorded.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Expenses ───────────────────────────────────────────────────────────────

  async addExpense(): Promise<void> {
    if (!this.detail || this.expense.amount == null || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.logistics.addExpense({
      tripId: this.detail.id,
      kind: Number(this.expense.kind),
      amount: Number(this.expense.amount),
      incurredAt: new Date().toISOString(),
      reference: this.expense.reference || undefined,
      note: this.expense.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.showExpense = false;
      this.expense = { kind: TripExpenseKind.Fuel, amount: null, reference: '', note: '' };
      await this.open(this.detail.id);
    } else {
      this.error = 'The expense could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async decideExpense(e: TripExpenseDto, isApproved: boolean): Promise<void> {
    const res = await firstValueFrom(this.logistics.decideExpense(
      e.id, isApproved, isApproved ? undefined : 'Rejected from the trip screen',
    )).catch(() => null);

    if (res?.data && this.detail) await this.open(this.detail.id);
    else this.error = 'That decision could not be saved.';

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get canStart(): boolean { return this.detail?.status === TripStatus.Planned; }
  get canEnd(): boolean { return this.detail?.status === TripStatus.InProgress; }

  get netSettlement(): number {
    const t = this.detail;
    if (!t) return 0;
    return t.collectedAmount - t.totalExpense;
  }

  trackTrip = (_: number, t: TripSummaryDto) => t.id;
  trackStop = (_: number, s: TripStopDto) => s.id;
  trackExpense = (_: number, e: TripExpenseDto) => e.id;
  trackOrder = (_: number, o: OrderSummaryDto) => o.id;
}
