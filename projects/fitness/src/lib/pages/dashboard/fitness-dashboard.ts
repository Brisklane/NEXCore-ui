import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FitnessReportService } from '../../services/fitness.services';
import { FitnessDashboardDto, TrendPointDto } from '../../models/fitness.models';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The owner's home screen.
 *
 * Split deliberately into "right now" and "this month". The right-now block is for acting in the
 * next five minutes — a door offline, an enquiry going cold, a class about to run empty. The
 * monthly figures are for judging the business, and every one of them is arithmetic over real
 * data rather than a stored counter, so they cannot drift out of agreement with the reports.
 *
 * The "Needs attention" list is ordered by how much damage each item does if ignored, not by how
 * many of them there are. Six doors offline is worse than sixty pounds outstanding, and the list
 * says so.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-dashboard',
  imports: [CommonModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './fitness-dashboard.html',
  styleUrls: ['../fitness-shared.css', './fitness-dashboard.css'],
})
export class FitnessDashboardComponent implements OnInit, OnDestroy {
  private reports = inject(FitnessReportService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: FitnessDashboardDto | null = null;
  loading = true;
  error = '';
  clubId: string | null = null;

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Current enough to leave on a back-office screen all day. The screens where seconds matter
    // — the front desk and the kiosk — get pushed updates over the hub instead.
    this.timer = setInterval(() => this.load(true), 60_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(silent = false): Promise<void> {
    if (!silent) this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.reports.getDashboard(this.clubId ?? undefined)).catch(() => null);

    if (!res?.data) {
      if (!silent) this.error = 'Could not load the dashboard.';
    } else {
      this.data = res.data;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  go(route: string): void {
    void this.router.navigateByUrl(route);
  }

  // ── Presentation helpers ───────────────────────────────────────────────

  /** Bar height as a percentage of the tallest point, for the sparkline columns. */
  barHeight(points: TrendPointDto[], value: number): number {
    const max = Math.max(1, ...points.map(p => p.value));
    return Math.max(2, Math.round((value / max) * 100));
  }

  /** Occupancy fill class. Amber past 75%, red past 90% — and the number is always shown too. */
  occupancyClass(percent: number): string {
    if (percent >= 90) return 'is-full';
    if (percent >= 75) return 'is-busy';
    return '';
  }

  /** A signed percentage, so "down 3%" and "up 3%" are visibly different at a glance. */
  signed(value: number): string {
    if (value > 0) return `+${value.toFixed(1)}%`;
    if (value < 0) return `${value.toFixed(1)}%`;
    return 'no change';
  }

  /** For a metric where up is good. Churn passes `false` and gets the opposite colouring. */
  trendClass(value: number, upIsGood = true): string {
    if (value === 0) return '';
    const good = upIsGood ? value > 0 : value < 0;
    return good ? 'is-up' : 'is-down';
  }

  /** Busiest hour of the day, for the visits strip. */
  peakHour(): number {
    const hours = this.data?.visitsByHour ?? [];
    if (hours.length === 0) return 0;
    return hours.reduce((best, h) => (h.visits > best.visits ? h : best), hours[0]).hour;
  }

  visitBarHeight(visits: number): number {
    const max = Math.max(1, ...(this.data?.visitsByHour ?? []).map(h => h.visits));
    return Math.max(2, Math.round((visits / max) * 100));
  }

  hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }
}
