import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { FloorService, FrontOfHouseService } from '../../services/restaurant.services';
import {
  AvailableTableDto, GuestProfileDto, ReservationAvailabilityDto, ReservationDto, SaveReservationDto,
  TableDto, WaitlistEntryDto,
} from '../../models/restaurant.models';
import {
  OrderChannel, RESERVATION_STATUS_LABELS, ReservationStatus, WAITLIST_STATUS_LABELS, WaitlistStatus,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type Tab = 'bookings' | 'waitlist' | 'guests';

/**
 * Bookings, the walk-in queue and the guest book.
 *
 * The three belong on one screen because a host uses them in one motion: a party arrives, you
 * check whether they booked, and if they did not, you either seat them or add them to the queue.
 * Splitting that across three pages is how a queue gets forgotten on a Friday night.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-reservations',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './reservations.html',
  styleUrls: ['../restaurant-shared.css', './reservations.css'],
})
export class ReservationsComponent {
  private foh = inject(FrontOfHouseService);
  private floors = inject(FloorService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'bookings';
  outletId: string | null = null;

  bookings: ReservationDto[] = [];
  waitlist: WaitlistEntryDto[] = [];
  guests: GuestProfileDto[] = [];
  tables: TableDto[] = [];

  day = new Date().toISOString().slice(0, 10);
  guestSearch = '';

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  // Booking editor
  editing: SaveReservationDto | null = null;
  editingId: string | null = null;
  availability: ReservationAvailabilityDto | null = null;

  // Waitlist editor
  waitingGuest: { guestName: string; phone: string; partySize: number; quotedWaitMinutes: number; note: string } | null = null;

  // Seat picker
  seating: ReservationDto | WaitlistEntryDto | null = null;
  seatingIsWaitlist = false;
  seatTableId = '';

  readonly statusLabels = RESERVATION_STATUS_LABELS;
  readonly waitStatusLabels = WAITLIST_STATUS_LABELS;
  readonly ReservationStatus = ReservationStatus;
  readonly WaitlistStatus = WaitlistStatus;

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    this.loading = true;

    const from = new Date(this.day + 'T00:00:00').toISOString();
    const to = new Date(this.day + 'T23:59:59').toISOString();

    const [bookings, waitlist, tables] = await Promise.all([
      firstValueFrom(this.foh.getReservations(this.outletId, from, to)).catch(() => null),
      firstValueFrom(this.foh.getWaitlist(this.outletId, true)).catch(() => null),
      firstValueFrom(this.floors.getTables(this.outletId)).catch(() => null),
    ]);

    this.bookings = bookings?.data ?? [];
    this.waitlist = waitlist?.data ?? [];
    this.tables = tables?.data ?? [];

    if (this.tab === 'guests') await this.loadGuests();

    this.loading = false;
    this.cdr.detectChanges();
  }

  async loadGuests(): Promise<void> {
    const res = await firstValueFrom(this.foh.getGuests(this.guestSearch || undefined)).catch(() => null);
    this.guests = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async switchTab(tab: Tab): Promise<void> {
    this.tab = tab;
    if (tab === 'guests' && !this.guests.length) await this.loadGuests();
  }

  // ── Bookings ───────────────────────────────────────────────────────

  newBooking(): void {
    this.fieldErrors = {};
    if (!this.outletId) return;

    const at = new Date();
    at.setMinutes(0, 0, 0);
    at.setHours(at.getHours() + 1);

    this.editingId = null;
    this.availability = null;
    this.editing = {
      outletId: this.outletId,
      guestName: '',
      phone: null,
      email: null,
      partySize: 2,
      reservedFor: at.toISOString().slice(0, 16),
      durationMinutes: 90,
      tableId: null,
      sectionId: null,
      floorId: null,
      occasion: null,
      specialRequests: null,
      allergyNotes: null,
      isHighChairNeeded: false,
      isWheelchairAccess: false,
      depositAmount: 0,
      isDepositPaid: false,
      source: OrderChannel.Phone,
      note: null,
    };
    this.error = '';
  }

  editBooking(r: ReservationDto): void {
    this.fieldErrors = {};
    this.editingId = r.id;
    this.availability = null;
    this.editing = {
      outletId: r.outletId,
      guestProfileId: r.guestProfileId,
      guestName: r.guestName,
      phone: r.phone ?? null,
      email: r.email ?? null,
      partySize: r.partySize,
      reservedFor: r.reservedFor.slice(0, 16),
      durationMinutes: r.durationMinutes,
      tableId: r.tableId ?? null,
      sectionId: r.sectionId ?? null,
      floorId: r.floorId ?? null,
      occasion: r.occasion ?? null,
      specialRequests: r.specialRequests ?? null,
      allergyNotes: r.allergyNotes ?? null,
      isHighChairNeeded: r.isHighChairNeeded,
      isWheelchairAccess: r.isWheelchairAccess,
      depositAmount: r.depositAmount,
      isDepositPaid: r.isDepositPaid,
      source: r.source,
      note: r.note ?? null,
    };
    this.error = '';
  }

  /**
   * Asks the server which tables can actually take this party at this time. Run before saving so
   * a host is offered the fit rather than discovering the clash on save.
   */
  async checkAvailability(): Promise<void> {
    if (!this.editing || !this.outletId) return;

    this.busy = true;
    const res = await firstValueFrom(this.foh.checkAvailability(
      this.outletId,
      new Date(this.editing.reservedFor).toISOString(),
      this.editing.partySize,
      this.editing.durationMinutes,
    )).catch(() => null);

    this.availability = res?.data ?? null;
    this.busy = false;
    this.cdr.detectChanges();
  }

  chooseTable(t: AvailableTableDto): void {
    if (this.editing) this.editing.tableId = t.tableId;
  }

  async saveBooking(): Promise<void> {
    const e = this.editing;
    if (!e) return;

    this.fieldErrors = validate(e as unknown as Record<string, unknown>, {
      guestName: [required("The guest's name"), maxLength(160, 'The name')],
      phone: [maxLength(40, 'The phone number')],
      email: [email('The email')],
      partySize: [required('A party size'), between(1, 200, 'The party size')],
      reservedFor: [required('A date and time'), inFuture('The booking time')],
      durationMinutes: [positive('The sitting length')],
      depositAmount: [notNegative('The deposit')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const payload: SaveReservationDto = { ...e, reservedFor: new Date(e.reservedFor).toISOString() };

    const call = this.editingId
      ? this.foh.updateReservation(this.editingId, payload)
      : this.foh.createReservation(payload);

    const res = await firstValueFrom(call).catch((err: { error?: { message?: string } }) => {
      this.error = err?.error?.message ?? 'Could not save the booking.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = this.editingId ? 'Booking saved.' : 'Booking created.';
      this.editing = null;
      await this.loadAll();
    }

    this.cdr.detectChanges();
  }

  async setStatus(r: ReservationDto, status: ReservationStatus): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.foh.changeReservationStatus(r.id, { status }))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not update the booking.';
        return null;
      });

    this.busy = false;
    if (res?.data) { this.notice = 'Booking updated.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── Seating ────────────────────────────────────────────────────────

  startSeat(entry: ReservationDto | WaitlistEntryDto, isWaitlist: boolean): void {
    this.fieldErrors = {};
    this.seating = entry;
    this.seatingIsWaitlist = isWaitlist;
    this.seatTableId = ('tableId' in entry && entry.tableId) ? entry.tableId : '';
    this.error = '';
  }

  get seatCandidates(): TableDto[] {
    const size = this.seating?.partySize ?? 2;
    return this.tables
      .filter(t => t.isActive && (t.state === 1 || t.state === 2))
      .filter(t => t.seats >= size)
      .sort((a, b) => (a.seats - size) - (b.seats - size));
  }

  async confirmSeat(): Promise<void> {
    if (!this.seating || !this.seatTableId) return;

    this.busy = true;
    this.error = '';

    // The two endpoints return different shapes, so the result is narrowed to what this method
    // actually cares about — that something came back — rather than fighting the union.
    const call: Observable<{ data?: unknown }> = this.seatingIsWaitlist
      ? this.foh.changeWaitlistStatus(this.seating.id, { status: WaitlistStatus.Seated, tableId: this.seatTableId })
      : this.foh.changeReservationStatus(this.seating.id, { status: ReservationStatus.Seated, tableId: this.seatTableId });

    const res = await firstValueFrom(call).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not seat that party.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Party seated.';
      this.seating = null;
      await this.loadAll();
    }

    this.cdr.detectChanges();
  }

  // ── Waitlist ───────────────────────────────────────────────────────

  newWaiting(): void {
    this.fieldErrors = {};
    this.waitingGuest = { guestName: '', phone: '', partySize: 2, quotedWaitMinutes: 0, note: '' };
    this.error = '';
  }

  async saveWaiting(): Promise<void> {
    const w = this.waitingGuest;
    if (!w || !this.outletId) return;
    this.fieldErrors = validate(w as unknown as Record<string, unknown>, {
      guestName: [required("The guest's name"), maxLength(160, 'The name')],
      phone: [maxLength(40, 'The phone number')],
      partySize: [required('A party size'), between(1, 200, 'The party size')],
      quotedWaitMinutes: [notNegative('The quoted wait')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.foh.addToWaitlist({
      outletId: this.outletId,
      guestName: w.guestName,
      phone: w.phone || null,
      partySize: w.partySize,
      quotedWaitMinutes: w.quotedWaitMinutes,
      note: w.note || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not add to the waitlist.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = `${w.guestName} added — quoted ${res.data.quotedWaitMinutes} min.`;
      this.waitingGuest = null;
      await this.loadAll();
    }

    this.cdr.detectChanges();
  }

  async setWaitStatus(w: WaitlistEntryDto, status: WaitlistStatus): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.foh.changeWaitlistStatus(w.id, { status })).catch(() => null);
    this.busy = false;
    if (res?.data) { this.notice = 'Waitlist updated.'; await this.loadAll(); }
    this.cdr.detectChanges();
  }

  // ── Helpers ────────────────────────────────────────────────────────

  statusTone(s: ReservationStatus): string {
    switch (s) {
      case ReservationStatus.Confirmed: return 'tone-info';
      case ReservationStatus.Seated: return 'tone-success';
      case ReservationStatus.Completed: return 'tone-neutral';
      case ReservationStatus.NoShow:
      case ReservationStatus.Cancelled: return 'tone-danger';
      default: return 'tone-warning';
    }
  }

  get upcomingCount(): number {
    return this.bookings.filter(b =>
      b.status === ReservationStatus.Confirmed || b.status === ReservationStatus.Requested).length;
  }

  get coversBooked(): number {
    return this.bookings
      .filter(b => b.status !== ReservationStatus.Cancelled && b.status !== ReservationStatus.NoShow)
      .reduce((sum, b) => sum + b.partySize, 0);
  }

  trackBooking = (_: number, b: ReservationDto) => b.id;
  trackWaiting = (_: number, w: WaitlistEntryDto) => w.id;
  trackGuest = (_: number, g: GuestProfileDto) => g.id;
}
