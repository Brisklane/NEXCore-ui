import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  DistributionAdminService, FieldService, OutletService, RouteService, VanService,
} from '../../services/distribution.services';
import {
  CollectionDto, DistributionOrderDto, FieldDayBoardDto, FieldDayDto, FieldRepDto,
  ReasonCodeDto, RouteDto, VanUnitDto, VisitCardDto, VisitDto, VisitTaskDto,
} from '../../models/distribution.models';
import {
  DAY_STATUS_LABELS, DAY_STATUS_TONE, FieldDayStatus, OUTLET_CHANNEL_ICONS,
  OUTLET_GRADE_LABELS, ReasonSurface, VISIT_STATUS_LABELS, VISIT_STATUS_TONE, VisitStatus,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { StatusPillComponent } from '../shared/ui-bits';
import { OrderSheetComponent } from '../shared/order-sheet';
import { CollectionSheetComponent } from '../shared/collection-sheet';

/**
 * The field rep's whole working day on one screen.
 *
 * Built for a phone held in one hand in a shop doorway, so it is one column, 48px targets, and
 * the next thing to do is always the largest thing on the screen. Everything else — the rest of
 * the beat, the day's numbers — is below the fold on purpose.
 *
 * Geofencing records rather than blocks. A rep standing behind a shop with bad GPS is a normal
 * event; refusing the check-in would teach them to stop using the app. An out-of-fence check-in
 * is allowed, stamped with the distance, and requires a reason that a supervisor reads later.
 */
@Component({
  standalone: true,
  selector: 'lib-field-terminal',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, StatusPillComponent,
    OrderSheetComponent, CollectionSheetComponent,
  ],
  templateUrl: './field-terminal.html',
  styleUrls: ['../distribution-shared.css', './field-terminal.css'],
})
export class FieldTerminalComponent implements OnInit, OnDestroy {
  private field = inject(FieldService);
  private routes = inject(RouteService);
  private vans = inject(VanService);
  private outlets = inject(OutletService);
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  reps: FieldRepDto[] = [];
  repId: string | null = null;

  board: FieldDayBoardDto | null = null;
  day: FieldDayDto | null = null;
  activeVisit: VisitDto | null = null;
  activeCard: VisitCardDto | null = null;

  availableRoutes: RouteDto[] = [];
  availableVans: VanUnitDto[] = [];
  noOrderReasons: ReasonCodeDto[] = [];
  geoReasons: ReasonCodeDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  /** Start-of-day form. */
  start = { routeId: '', vanUnitId: '' };

  /** Close-of-day form. */
  close = { cashDeclared: null as number | null, distanceCoveredKm: null as number | null, note: '' };

  /** Check-out form for the visit that is open. */
  checkout = { noOrderReasonId: '', noOrderNote: '', assetsVerified: false, note: '' };

  showStartDay = false;
  showCloseDay = false;
  showOrderSheet = false;
  showCollection = false;
  showUnplanned = false;
  showGeoReason = false;
  pendingCard: VisitCardDto | null = null;
  geoReason = '';
  geoDistance = 0;

  unplannedSearch = '';
  unplannedResults: { id: string; name: string; code?: string; addressLine?: string }[] = [];

  position: GeolocationPosition | null = null;
  positionError = '';

  readonly dayStatusLabels = DAY_STATUS_LABELS;
  readonly dayStatusTone = DAY_STATUS_TONE;
  readonly visitStatusLabels = VISIT_STATUS_LABELS;
  readonly visitStatusTone = VISIT_STATUS_TONE;
  readonly gradeLabels = OUTLET_GRADE_LABELS;
  readonly channelIcons = OUTLET_CHANNEL_ICONS;
  readonly FieldDayStatus = FieldDayStatus;
  readonly VisitStatus = VisitStatus;

  private timer?: ReturnType<typeof setInterval>;
  private watchId?: number;

  async ngOnInit(): Promise<void> {
    this.watchPosition();

    const [repsRes, reasonsRes] = await Promise.all([
      firstValueFrom(this.field.reps({ pageSize: 200, isActive: true })).catch(() => null),
      firstValueFrom(this.admin.reasons({})).catch(() => null),
    ]);

    this.reps = repsRes?.data ?? [];
    const reasons = reasonsRes?.data ?? [];
    this.noOrderReasons = reasons.filter(r => r.surface === ReasonSurface.NoOrder && r.isActive);
    this.geoReasons = reasons.filter(r => r.surface === ReasonSurface.OutOfFenceCheckIn && r.isActive);

    // A rep on their own device sees their own day immediately; a supervisor picks from the list.
    let remembered: string | null = null;
    try { remembered = localStorage.getItem('nexcore.distribution.repId'); } catch { /* ignore */ }

    this.repId = (remembered && this.reps.some(r => r.id === remembered))
      ? remembered
      : this.reps[0]?.id ?? null;

    await this.loadDay();

    // The board is shared with a supervisor watching from the office, so it refreshes itself.
    this.timer = setInterval(() => void this.loadDay(true), 90_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.watchId !== undefined) navigator.geolocation?.clearWatch(this.watchId);
  }

  // ── Location ───────────────────────────────────────────────────────────────

  private watchPosition(): void {
    if (!navigator.geolocation) {
      this.positionError = 'This device cannot report its location. Check-ins will be recorded without one.';
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      pos => { this.position = pos; this.positionError = ''; this.cdr.detectChanges(); },
      () => {
        this.positionError = 'Location is unavailable. Check-ins will still work but cannot be verified against the shop.';
        this.cdr.detectChanges();
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
    );
  }

  private get coords(): { latitude?: number; longitude?: number } {
    return this.position
      ? { latitude: this.position.coords.latitude, longitude: this.position.coords.longitude }
      : {};
  }

  /** Straight-line metres between the device and the outlet, for the geofence prompt. */
  private distanceTo(card: VisitCardDto): number | null {
    if (!this.position || card.latitude == null || card.longitude == null) return null;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6_371_000;
    const dLat = toRad(card.latitude - this.position.coords.latitude);
    const dLon = toRad(card.longitude - this.position.coords.longitude);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(this.position.coords.latitude)) * Math.cos(toRad(card.latitude)) * Math.sin(dLon / 2) ** 2;

    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  async onRep(id: string): Promise<void> {
    this.repId = id;
    try { localStorage.setItem('nexcore.distribution.repId', id); } catch { /* ignore */ }
    await this.loadDay();
  }

  async loadDay(silent = false): Promise<void> {
    if (!this.repId) { this.loading = false; return; }
    if (!silent) this.loading = true;

    const dayRes = await firstValueFrom(this.field.today(this.repId)).catch(() => null);
    this.day = dayRes?.data ?? null;

    if (this.day?.id) {
      const boardRes = await firstValueFrom(this.field.board(this.day.id)).catch(() => null);
      this.board = boardRes?.data ?? null;
      this.day = this.board?.day ?? this.day;
    } else {
      this.board = null;
      await this.loadStartOptions();
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async loadStartOptions(): Promise<void> {
    const rep = this.reps.find(r => r.id === this.repId);

    const [routesRes, vansRes] = await Promise.all([
      firstValueFrom(this.routes.list({ pageSize: 100, fieldRepId: this.repId })).catch(() => null),
      firstValueFrom(this.vans.list({ pageSize: 100 })).catch(() => null),
    ]);

    this.availableRoutes = routesRes?.data ?? [];
    this.availableVans = vansRes?.data ?? [];
    this.start.vanUnitId = rep?.defaultVanUnitId ?? '';
    this.start.routeId = this.availableRoutes[0]?.id ?? '';
  }

  // ── Day lifecycle ──────────────────────────────────────────────────────────

  async startDay(): Promise<void> {
    if (!this.repId || this.busy) return;

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.field.startDay({
      fieldRepId: this.repId,
      workDate: new Date().toISOString().slice(0, 10),
      routeId: this.start.routeId || undefined,
      vanUnitId: this.start.vanUnitId || undefined,
      ...this.coords,
      idempotencyKey: crypto.randomUUID(),
    })).catch(() => null);

    if (res?.data) {
      this.showStartDay = false;
      this.notice = 'Day started. Work the beat top to bottom.';
      await this.loadDay();
    } else {
      this.error = 'Could not start the day. Check the connection and try again.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async closeDay(force = false): Promise<void> {
    if (!this.day || this.busy) return;

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.field.closeDay({
      fieldDayId: this.day.id,
      cashDeclared: Number(this.close.cashDeclared ?? 0),
      distanceCoveredKm: Number(this.close.distanceCoveredKm ?? 0),
      note: this.close.note || undefined,
      forceClose: force,
      forceCloseReason: force ? (this.close.note || 'Closed with calls outstanding') : undefined,
      ...this.coords,
    })).catch(() => null);

    if (res?.data) {
      this.showCloseDay = false;
      this.notice = 'Day closed. It now goes to route settlement.';
      await this.loadDay();
    } else {
      this.error = 'Could not close the day. Anything unfinished needs a reason first.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Visits ─────────────────────────────────────────────────────────────────

  get nextStop(): VisitCardDto | null {
    return this.board?.stops.find(s => s.status === VisitStatus.Pending || s.status === VisitStatus.CheckedIn || s.status === VisitStatus.InProgress) ?? null;
  }

  get remainingStops(): VisitCardDto[] {
    const next = this.nextStop;
    return (this.board?.stops ?? []).filter(s => s !== next);
  }

  /** Tries the check-in; a stop outside its geofence asks for a reason before going through. */
  async checkIn(card: VisitCardDto, reason?: string): Promise<void> {
    if (!this.day || this.busy) return;

    const distance = this.distanceTo(card);
    if (!reason && distance !== null && distance > (card.geofenceRadiusMetres || 150)) {
      this.pendingCard = card;
      this.geoDistance = distance;
      this.geoReason = '';
      this.showGeoReason = true;
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.field.checkIn({
      fieldDayId: this.day.id,
      outletId: card.outletId,
      ...this.coords,
      geoExceptionReason: reason,
      isUnplanned: !card.isPlanned,
      idempotencyKey: crypto.randomUUID(),
    })).catch(() => null);

    if (res?.data) {
      this.activeVisit = res.data;
      this.activeCard = card;
      this.checkout = { noOrderReasonId: '', noOrderNote: '', assetsVerified: false, note: '' };
      this.showGeoReason = false;
      this.pendingCard = null;
    } else {
      this.error = 'Could not check in. If you are offline the check-in will be sent when the signal returns.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  confirmGeoReason(): void {
    if (!this.pendingCard || !this.geoReason.trim()) return;
    void this.checkIn(this.pendingCard, this.geoReason.trim());
  }

  get needsNoOrderReason(): boolean {
    return !!this.activeVisit && this.activeVisit.orderValue <= 0;
  }

  async checkOut(): Promise<void> {
    if (!this.activeVisit || this.busy) return;

    if (this.needsNoOrderReason && !this.checkout.noOrderReasonId) {
      this.error = 'A call that produced no order needs a reason. That is the number the whole business improves on.';
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.field.checkOut({
      visitId: this.activeVisit.id,
      ...this.coords,
      noOrderReasonId: this.checkout.noOrderReasonId || undefined,
      noOrderNote: this.checkout.noOrderNote || undefined,
      assetsVerified: this.checkout.assetsVerified,
      note: this.checkout.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.activeVisit = null;
      this.activeCard = null;
      this.notice = 'Call closed. Next stop is at the top.';
      await this.loadDay(true);
    } else {
      this.error = 'Could not check out. Try again.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Actions inside a visit ─────────────────────────────────────────────────

  onOrderPlaced(order: DistributionOrderDto): void {
    this.showOrderSheet = false;
    this.notice = `Order ${order.orderNumber} placed for ${order.totalAmount.toFixed(2)}.`;
    if (this.activeVisit) {
      this.activeVisit = { ...this.activeVisit, orderId: order.id, orderNumber: order.orderNumber, orderValue: order.totalAmount };
    }
    void this.loadDay(true);
  }

  onCollectionRecorded(receipt: CollectionDto): void {
    this.showCollection = false;
    this.notice = `Receipt ${receipt.receiptNumber} recorded for ${receipt.amount.toFixed(2)}.`;
    if (this.activeVisit) {
      this.activeVisit = { ...this.activeVisit, collectedAmount: this.activeVisit.collectedAmount + receipt.amount };
    }
    void this.loadDay(true);
  }

  async completeTask(task: VisitTaskDto): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    await firstValueFrom(this.field.completeTask({
      taskId: task.id,
      visitId: this.activeVisit?.id,
    })).catch(() => null);

    this.busy = false;
    await this.loadDay(true);
  }

  tasksFor(outletId: string): VisitTaskDto[] {
    return (this.board?.tasks ?? []).filter(t => !t.completedAt && (!t.outletId || t.outletId === outletId));
  }

  // ── Unplanned calls ────────────────────────────────────────────────────────

  async searchUnplanned(): Promise<void> {
    const term = this.unplannedSearch.trim();
    if (term.length < 2) { this.unplannedResults = []; return; }

    const res = await firstValueFrom(this.outlets.list({ search: term, pageSize: 15 })).catch(() => null);
    this.unplannedResults = (res?.data ?? []).map(o => ({
      id: o.id, name: o.name, code: o.code, addressLine: o.addressLine,
    }));
    this.cdr.detectChanges();
  }

  async startUnplanned(outletId: string, name: string): Promise<void> {
    this.showUnplanned = false;
    // A synthetic card: an unplanned call has no stop in the beat, but the rest of the visit
    // flow is identical, so it gets the same shape rather than a second code path.
    await this.checkIn({
      outletId, outletName: name, stopSequence: 0, isPlanned: false, isMustVisit: false,
      status: VisitStatus.Pending, geofenceRadiusMetres: 0, isProductive: false,
      orderValue: 0, collectedAmount: 0, outstandingAmount: 0, overdueAmount: 0,
      isCreditBlocked: false, averageMonthlyOfftake: 0, openTaskCount: 0, assetCount: 0,
      hasPinnedNote: false, channel: 1, grade: 3, outletStatus: 2,
    } as VisitCardDto);
  }

  // ── Presentation helpers ───────────────────────────────────────────────────

  get achievedPercent(): number {
    const target = this.board?.targetValue ?? 0;
    if (target <= 0) return 0;
    return Math.min(100, Math.round(((this.board?.achievedValue ?? 0) / target) * 100));
  }

  get collectedPercent(): number {
    const target = this.board?.collectionTarget ?? 0;
    if (target <= 0) return 0;
    return Math.min(100, Math.round(((this.board?.collectedAmount ?? 0) / target) * 100));
  }

  get progressPercent(): number {
    const total = (this.board?.pendingStops ?? 0) + (this.board?.completedStops ?? 0);
    if (total <= 0) return 0;
    return Math.round(((this.board?.completedStops ?? 0) / total) * 100);
  }

  distanceLabel(card: VisitCardDto): string {
    const metres = this.distanceTo(card);
    if (metres === null) return '';
    return metres < 1000 ? `${metres} m away` : `${(metres / 1000).toFixed(1)} km away`;
  }

  dismissNotice(): void { this.notice = ''; }

  trackStop = (_: number, s: VisitCardDto) => s.outletId;
  trackTask = (_: number, t: VisitTaskDto) => t.id;
}
