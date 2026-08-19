import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FulfilmentService, OrderService } from '../../services/distribution.services';
import {
  DispatchBoardDto, OrderSummaryDto, PickWaveDto, TripSummaryDto,
} from '../../models/distribution.models';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PICK_STRATEGY_LABELS, PickStrategy,
  TRIP_STATUS_LABELS, TRIP_STATUS_TONE, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { EmptyStateComponent, StatusPillComponent } from '../shared/ui-bits';

/**
 * The load and dispatch desk.
 *
 * A warehouse supervisor stands here with a radio and needs two things: what has to leave today,
 * and what is going to stop it. So the pipeline runs across the top as a set of counts you can
 * click, the late and urgent orders sit where they cannot be scrolled past, and building a wave
 * from a selection is one button rather than a wizard.
 *
 * Refreshes on a short timer because carton scans are happening while somebody is looking at it,
 * and a supervisor acting on a two-minute-old picture sends a van away half loaded.
 */
@Component({
  standalone: true,
  selector: 'lib-dispatch-desk',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent,
    EmptyStateComponent, StatusPillComponent,
  ],
  templateUrl: './dispatch.html',
  styleUrls: ['../distribution-shared.css', './dispatch.css'],
})
export class DispatchDeskComponent implements OnInit, OnDestroy {
  private fulfilment = inject(FulfilmentService);
  private orders = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  board: DispatchBoardDto | null = null;
  readyOrders: OrderSummaryDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  selection = new Set<string>();
  groupBy: 'route' | 'date' = 'route';

  showWave = false;
  wave = {
    strategy: PickStrategy.Batch,
    deliveryDate: '',
    priority: 100,
    note: '',
  };

  readonly strategyOptions = enumOptions(PICK_STRATEGY_LABELS);
  readonly strategyLabels = PICK_STRATEGY_LABELS;
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly statusTone = ORDER_STATUS_TONE;
  readonly tripStatusLabels = TRIP_STATUS_LABELS;
  readonly tripStatusTone = TRIP_STATUS_TONE;

  private timer?: ReturnType<typeof setInterval>;

  async ngOnInit(): Promise<void> {
    await this.load();
    this.timer = setInterval(() => void this.load(true), 45_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async load(silent = false): Promise<void> {
    if (!silent) this.loading = true;
    this.cdr.detectChanges();

    const [boardRes, readyRes] = await Promise.all([
      firstValueFrom(this.fulfilment.board({})).catch(() => null),
      firstValueFrom(this.orders.list({ pageSize: 200, readyToPick: true })).catch(() => null),
    ]);

    if (boardRes?.data) this.board = boardRes.data;
    else if (!silent) this.error = 'Could not load the dispatch board.';

    this.readyOrders = readyRes?.data ?? [];

    // Drop anything that has moved on since the last refresh, so a wave is never built from
    // an order somebody else already picked.
    const live = new Set(this.readyOrders.map(o => o.id));
    for (const id of [...this.selection]) if (!live.has(id)) this.selection.delete(id);

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Grouping ───────────────────────────────────────────────────────────────

  get groups(): { key: string; label: string; orders: OrderSummaryDto[]; value: number }[] {
    const map = new Map<string, OrderSummaryDto[]>();

    for (const order of this.readyOrders) {
      const key = this.groupBy === 'route'
        ? order.routeName || 'No route'
        : (order.promisedDeliveryDate ?? '').slice(0, 10) || 'Not promised';

      map.set(key, [...(map.get(key) ?? []), order]);
    }

    return [...map.entries()]
      .map(([key, orders]) => ({
        key,
        label: this.groupBy === 'date' && key !== 'Not promised'
          ? new Date(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
          : key,
        orders,
        value: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  toggle(id: string): void {
    if (this.selection.has(id)) this.selection.delete(id);
    else this.selection.add(id);
  }

  toggleGroup(group: { orders: OrderSummaryDto[] }): void {
    const allIn = group.orders.every(o => this.selection.has(o.id));
    for (const o of group.orders) {
      if (allIn) this.selection.delete(o.id);
      else this.selection.add(o.id);
    }
  }

  groupSelected(group: { orders: OrderSummaryDto[] }): boolean {
    return group.orders.length > 0 && group.orders.every(o => this.selection.has(o.id));
  }

  get selectedValue(): number {
    return this.readyOrders
      .filter(o => this.selection.has(o.id))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  // ── Waves ──────────────────────────────────────────────────────────────────

  openWave(): void {
    if (this.selection.size === 0) return;

    // Default the wave's delivery date to the earliest promise in the selection — the one that
    // actually constrains when it has to leave.
    const dates = this.readyOrders
      .filter(o => this.selection.has(o.id) && o.promisedDeliveryDate)
      .map(o => o.promisedDeliveryDate!)
      .sort();

    this.wave = {
      strategy: PickStrategy.Batch,
      deliveryDate: dates[0]?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      priority: 100,
      note: '',
    };

    this.showWave = true;
  }

  async createWave(): Promise<void> {
    if (this.selection.size === 0 || this.busy) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.fulfilment.createWave({
      strategy: Number(this.wave.strategy),
      orderIds: [...this.selection],
      deliveryDate: this.wave.deliveryDate || undefined,
      priority: this.wave.priority,
      note: this.wave.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.showWave = false;
      this.selection.clear();
      this.notice = `Wave ${res.data.waveNumber} released — ${res.data.taskCount} tasks on the handhelds.`;
      await this.load();
    } else {
      this.error = 'The wave could not be created.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async closeWave(w: PickWaveDto): Promise<void> {
    const res = await firstValueFrom(this.fulfilment.closeWave(w.id)).catch(() => null);
    if (res?.data) { this.notice = `Wave ${w.waveNumber} closed.`; await this.load(); }
    else this.error = 'The wave could not be closed. Tasks may still be open.';
    this.cdr.detectChanges();
  }

  waveTone(w: PickWaveDto): string {
    if (w.shortLines > 0) return 'tone-warning';
    return w.progressPercent >= 100 ? 'tone-success' : 'tone-brand';
  }

  trackOrder = (_: number, o: OrderSummaryDto) => o.id;
  trackWave = (_: number, w: PickWaveDto) => w.id;
  trackTrip = (_: number, t: TripSummaryDto) => t.id;
  trackGroup = (_: number, g: { key: string }) => g.key;
}
