import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KitchenService } from '../../services/restaurant.services';
import {
  AllDayCountDto, KitchenDisplayDto, KitchenStationDto, KitchenTicketDto, KitchenTicketLineDto,
} from '../../models/restaurant.models';
import {
  COURSE_LABELS, KitchenTicketStatus, ORDER_TYPE_LABELS, OrderLineStatus,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The kitchen display.
 *
 * This is the only screen in the product designed to be read from two metres away by someone
 * holding a pan, so it breaks the usual density rules on purpose: larger type, fewer words, and
 * a card that can be actioned with one tap of a wet thumb.
 *
 * Age is shown as a number **and** a colour band **and** a border weight. A kitchen is exactly
 * the environment where colour alone fails — steam on the screen, a cheap panel, and a line cook
 * who may be colour-blind — so the ticket never relies on red meaning late.
 *
 * The clock ticks locally between polls. Server time is the truth, but a card whose age freezes
 * for eight seconds at a time reads as a frozen screen, and a cook will stop trusting it.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-kitchen-display',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent],
  templateUrl: './kitchen-display.html',
  styleUrls: ['../restaurant-shared.css', './kitchen-display.css'],
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  private kitchen = inject(KitchenService);
  private cdr = inject(ChangeDetectorRef);

  outletId: string | null = null;
  stations: KitchenStationDto[] = [];
  activeStationId: string | null = null;

  display: KitchenDisplayDto | null = null;
  loading = true;
  busy = false;
  error = '';

  /** Show recently bumped tickets so a mis-bump can be recalled. */
  showBumped = false;

  /** Seconds added to each ticket's server age, so the timers move between polls. */
  private drift = 0;

  private pollTimer?: ReturnType<typeof setInterval>;
  private tickTimer?: ReturnType<typeof setInterval>;

  readonly courseLabels = COURSE_LABELS;
  readonly orderTypeLabels = ORDER_TYPE_LABELS;
  readonly TicketStatus = KitchenTicketStatus;
  readonly LineStatus = OrderLineStatus;

  ngOnInit(): void {
    this.pollTimer = setInterval(() => this.load(true), 8_000);
    this.tickTimer = setInterval(() => { this.drift++; this.cdr.detectChanges(); }, 1_000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);
  }

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    if (!id) { this.loading = false; return; }

    const res = await firstValueFrom(this.kitchen.getStations(id)).catch(() => null);
    this.stations = (res?.data ?? []).filter(s => s.isActive);

    // Default to the pass, which is the screen a single-screen kitchen wants.
    if (!this.activeStationId) {
      this.activeStationId = this.stations.find(s => s.isExpo)?.id ?? null;
    }

    await this.load();
  }

  async load(silent = false): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    if (!silent) this.loading = true;

    const res = await firstValueFrom(
      this.kitchen.getDisplay(this.outletId, this.activeStationId ?? undefined, this.showBumped),
    ).catch(() => null);

    if (res?.data) {
      this.display = res.data;
      this.drift = 0;
    } else if (!silent) {
      this.error = 'Could not load the kitchen screen.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async selectStation(id: string | null): Promise<void> {
    this.activeStationId = id;
    await this.load();
  }

  async toggleBumped(): Promise<void> {
    this.showBumped = !this.showBumped;
    await this.load();
  }

  // ── Ticket layout ──────────────────────────────────────────────────

  /** Live tickets, priority first, then oldest — the order a kitchen should work in. */
  get tickets(): KitchenTicketDto[] {
    return this.display?.tickets ?? [];
  }

  get liveTickets(): KitchenTicketDto[] {
    return this.tickets.filter(t =>
      t.status !== KitchenTicketStatus.Bumped && t.status !== KitchenTicketStatus.Cancelled);
  }

  get bumpedTickets(): KitchenTicketDto[] {
    return this.tickets.filter(t => t.status === KitchenTicketStatus.Bumped);
  }

  get allDay(): AllDayCountDto[] {
    return this.display?.allDayCounts ?? [];
  }

  /** Age including local drift, so the number moves every second. */
  age(ticket: KitchenTicketDto): number {
    return ticket.ageSeconds + this.drift;
  }

  ageLabel(ticket: KitchenTicketDto): string {
    const seconds = this.age(ticket);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Urgency recomputed locally so a ticket turns amber the moment it crosses, rather than at the
   * next poll. The server's own value seeds it and remains the authority for reporting.
   */
  urgency(ticket: KitchenTicketDto): 'ok' | 'warning' | 'overdue' {
    const station = this.stations.find(s => s.id === ticket.stationId);
    const slaSeconds = (station?.slaMinutes ?? 15) * 60;
    const warnSeconds = Math.max(60, slaSeconds * 0.6);
    const seconds = this.age(ticket);

    if (seconds >= slaSeconds) return 'overdue';
    if (seconds >= warnSeconds) return 'warning';
    return 'ok';
  }

  isDone(line: KitchenTicketLineDto): boolean {
    return line.status === OrderLineStatus.Ready || line.status === OrderLineStatus.Served;
  }

  stationName(id: string | null): string {
    if (!id) return 'All stations';
    return this.stations.find(s => s.id === id)?.name ?? 'Station';
  }

  get isExpoView(): boolean {
    if (!this.activeStationId) return true;
    return this.stations.find(s => s.id === this.activeStationId)?.isExpo ?? false;
  }

  // ── Actions ────────────────────────────────────────────────────────

  private async act<T>(work: Promise<T>): Promise<void> {
    this.busy = true;
    this.error = '';

    const result = await work.catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'That did not work.';
      return null;
    });

    this.busy = false;
    if (result !== null) await this.load(true);
    this.cdr.detectChanges();
  }

  start(ticket: KitchenTicketDto): void {
    void this.act(firstValueFrom(this.kitchen.start(ticket.id)));
  }

  markLineReady(ticket: KitchenTicketDto, line: KitchenTicketLineDto): void {
    if (this.isDone(line)) return;
    void this.act(firstValueFrom(this.kitchen.markReady(ticket.id, line.id)));
  }

  markReady(ticket: KitchenTicketDto): void {
    void this.act(firstValueFrom(this.kitchen.markReady(ticket.id)));
  }

  bump(ticket: KitchenTicketDto): void {
    void this.act(firstValueFrom(this.kitchen.bump(ticket.id)));
  }

  recall(ticket: KitchenTicketDto): void {
    void this.act(firstValueFrom(this.kitchen.recall(ticket.id, 'Recalled from the pass')));
  }

  togglePriority(ticket: KitchenTicketDto): void {
    void this.act(firstValueFrom(this.kitchen.setPriority(ticket.id, !ticket.isPriority)));
  }

  trackTicket = (_: number, t: KitchenTicketDto) => t.id;
  trackLine = (_: number, l: KitchenTicketLineDto) => l.id;
  trackAllDay = (_: number, a: AllDayCountDto) => a.menuItemId + (a.variantName ?? '');
}
