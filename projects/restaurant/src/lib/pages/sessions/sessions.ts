import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RestaurantSessionService, RestaurantStaffService } from '../../services/restaurant.services';
import {
  ReadReportDto, RestaurantSessionDto, RestaurantStaffDto,
} from '../../models/restaurant.models';
import {
  CASH_MOVEMENT_LABELS, CashMovementType, SESSION_STATUS_LABELS, SessionStatus, TENDER_LABELS,
  enumOptions,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

/**
 * Cash sessions and the X/Z reads that close a trading day.
 *
 * The screen is built around the blind close: while a session is open the expected figures are
 * withheld by the server, so the cashier counts the drawer without being shown the target. That
 * is the whole control — a count taken with the answer on screen is a copy, and a shortage
 * becomes invisible.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-sessions',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './sessions.html',
  styleUrls: ['../restaurant-shared.css', './sessions.css'],
})
export class SessionsComponent {
  private sessions = inject(RestaurantSessionService);
  private staffApi = inject(RestaurantStaffService);
  private cdr = inject(ChangeDetectorRef);

  outletId: string | null = null;
  open: RestaurantSessionDto | null = null;
  history: RestaurantSessionDto[] = [];
  staff: RestaurantStaffDto[] = [];

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  // Open
  opening: { cashierId: string; terminalName: string; openingFloat: number; isBlindClose: boolean } | null = null;

  // Close
  closing: { countedCash: number; countedCard: number; countedOther: number; note: string; pin: string } | null = null;

  // Cash movement
  movement: { type: CashMovementType; amount: number; reason: string } | null = null;

  // Read
  read: ReadReportDto | null = null;

  readonly statusLabels = SESSION_STATUS_LABELS;
  readonly movementLabels = CASH_MOVEMENT_LABELS;
  readonly tenderLabels = TENDER_LABELS;
  readonly movementOptions = enumOptions(CASH_MOVEMENT_LABELS)
    .filter(o => o.value !== CashMovementType.OpeningFloat && o.value !== CashMovementType.ClosingCount);

  readonly SessionStatus = SessionStatus;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const [open, list, staff] = await Promise.all([
      firstValueFrom(this.sessions.getOpen(this.outletId)).catch(() => null),
      firstValueFrom(this.sessions.list({ outletId: this.outletId, size: 30 })).catch(() => null),
      firstValueFrom(this.staffApi.getStaff(this.outletId, undefined, true)).catch(() => null),
    ]);

    this.open = open?.data ?? null;
    this.history = (list?.data ?? []).filter(s => s.status !== SessionStatus.Open);
    this.staff = (staff?.data ?? []).filter(s => s.canCloseSession || s.canOpenCashDrawer);

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Open ───────────────────────────────────────────────────────────

  startOpen(): void {
    this.fieldErrors = {};
    this.opening = { cashierId: '', terminalName: 'Till 1', openingFloat: 0, isBlindClose: true };
    this.error = '';
  }

  async confirmOpen(): Promise<void> {
    const o = this.opening;
    if (!o || !this.outletId) return;

    this.fieldErrors = validate(o as unknown as Record<string, unknown>, {
      cashierId: [required('Who is on this till')],
      openingFloat: [required('An opening float'), notNegative('The opening float')],
      terminalName: [maxLength(80, 'The terminal name')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.sessions.openSession({
      outletId: this.outletId,
      cashierId: o.cashierId || null,
      terminalName: o.terminalName || null,
      openingFloat: o.openingFloat,
      isBlindClose: o.isBlindClose,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not open the session.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = `Session ${res.data.sessionNumber} open.`; this.opening = null; await this.load(); }
    this.cdr.detectChanges();
  }

  // ── Close ──────────────────────────────────────────────────────────

  startClose(): void {
    this.fieldErrors = {};
    this.closing = { countedCash: 0, countedCard: 0, countedOther: 0, note: '', pin: '' };
    this.error = '';
  }

  async confirmClose(): Promise<void> {
    const c = this.closing;
    if (!c || !this.open) return;

    this.fieldErrors = validate(c as unknown as Record<string, unknown>, {
      countedCash: [required('The cash you counted'), notNegative('The counted cash')],
      countedCard: [notNegative('The card total')],
      countedOther: [notNegative('The other total')],
      note: [maxLength(500, 'The note')],
      pin: [digits(4, 6, 'The PIN')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.sessions.closeSession({
      sessionId: this.open.id,
      countedCash: c.countedCash,
      countedCard: c.countedCard,
      countedOther: c.countedOther,
      closingNote: c.note || null,
      approvalPin: c.pin || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not close the session.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      const variance = res.data.cashVariance;
      this.notice = variance === 0
        ? 'Session closed — the drawer balanced exactly.'
        : `Session closed — ${variance > 0 ? 'over' : 'short'} by ${Math.abs(variance).toFixed(2)}.`;

      this.closing = null;
      await this.load();
      await this.showRead(res.data, 'z');
    }

    this.cdr.detectChanges();
  }

  // ── Cash movements ─────────────────────────────────────────────────

  startMovement(): void {
    this.fieldErrors = {};
    this.movement = { type: CashMovementType.CashIn, amount: 0, reason: '' };
    this.error = '';
  }

  async saveMovement(): Promise<void> {
    const m = this.movement;
    if (!m || !this.open) return;
    this.fieldErrors = validate(m as unknown as Record<string, unknown>, {
      amount: [required('An amount'), positive('The amount')],
      reason: [required('A reason'), maxLength(200, 'The reason')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.sessions.addCashMovement({
      sessionId: this.open.id,
      movementType: m.type,
      amount: m.amount,
      reason: m.reason || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not record that.';
      return null;
    });

    this.busy = false;
    if (res?.data) { this.notice = 'Recorded.'; this.movement = null; await this.load(); }
    this.cdr.detectChanges();
  }

  // ── Reads ──────────────────────────────────────────────────────────

  async showRead(session: RestaurantSessionDto, kind: 'x' | 'z'): Promise<void> {
    this.busy = true;

    const res = await firstValueFrom(
      kind === 'x' ? this.sessions.xRead(session.id) : this.sessions.zRead(session.id),
    ).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not produce the read.';
      return null;
    });

    this.busy = false;
    this.read = res?.data ?? null;
    this.cdr.detectChanges();
  }

  printRead(): void {
    window.print();
  }

  varianceTone(v: number): string {
    if (v === 0) return 'tone-success';
    return Math.abs(v) < 1 ? 'tone-warning' : 'tone-danger';
  }

  trackSession = (_: number, s: RestaurantSessionDto) => s.id;
}
