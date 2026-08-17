import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RestaurantReportService } from '../../services/restaurant.services';
import { RestaurantDashboardDto, HourlySalesDto } from '../../models/restaurant.models';
import { ORDER_STATUS_LABELS, ORDER_TYPE_ICONS, ORDER_TYPE_LABELS } from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The manager's home screen.
 *
 * Split deliberately into "today" and "right now". Today's numbers are for judging the business;
 * the right-now block is for acting in the next five minutes — an overdue kitchen ticket or a
 * table nobody has been to is something you fix during service, not something you review at
 * month end. The attention tiles link straight to the screen that fixes them.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-dashboard',
  imports: [CommonModule, OutletPickerComponent, PageHelpComponent],
  templateUrl: './restaurant-dashboard.html',
  styleUrls: ['../restaurant-shared.css', './restaurant-dashboard.css'],
})
export class RestaurantDashboardComponent implements OnInit, OnDestroy {
  private reports = inject(RestaurantReportService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: RestaurantDashboardDto | null = null;
  loading = true;
  error = '';
  outletId: string | null = null;

  private timer?: ReturnType<typeof setInterval>;

  readonly orderTypeLabels = ORDER_TYPE_LABELS;
  readonly orderTypeIcons = ORDER_TYPE_ICONS;
  readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    // A dashboard on a wall screen has to stay current without anybody touching it, but a minute
    // is fast enough — the live screens (floor, kitchen) are where seconds matter.
    this.timer = setInterval(() => this.load(true), 60_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.load();
  }

  async load(silent = false): Promise<void> {
    if (!silent) this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.reports.dashboard(this.outletId ?? undefined)).catch(() => null);

    if (!res?.data) {
      if (!silent) this.error = 'Could not load the dashboard.';
    } else {
      this.data = res.data;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  go(path: string): void {
    this.router.navigateByUrl(path);
  }

  /** Tallest bar in the hourly chart, so the bars scale to the busiest hour of the day. */
  get peakHourAmount(): number {
    return Math.max(1, ...(this.data?.salesByHour ?? []).map(h => h.amount));
  }

  barHeight(hour: HourlySalesDto): number {
    return Math.max(2, Math.round((hour.amount / this.peakHourAmount) * 100));
  }

  /** Only the trading part of the day — a 24-bar chart of a venue that opens at 11 is mostly empty. */
  get tradingHours(): HourlySalesDto[] {
    const hours = this.data?.salesByHour ?? [];
    const active = hours.filter(h => h.amount > 0);
    if (active.length === 0) return hours.slice(8, 24);

    const first = Math.max(0, Math.min(...active.map(h => h.hour)) - 1);
    const last = Math.min(23, Math.max(...active.map(h => h.hour)) + 1);
    return hours.slice(first, last + 1);
  }

  get changeTone(): string {
    const change = this.data?.salesChangePercent ?? 0;
    return change > 0 ? 'is-up' : change < 0 ? 'is-down' : '';
  }

  trackHour = (_: number, h: HourlySalesDto) => h.hour;
  trackId = (_: number, row: { id?: string; menuItemId?: string; categoryId?: string; staffId?: string }) =>
    row.id ?? row.menuItemId ?? row.categoryId ?? row.staffId ?? _;
}
