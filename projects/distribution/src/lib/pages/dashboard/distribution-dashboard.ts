import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DistributionReportService } from '../../services/distribution.services';
import { DistributionDashboardDto, ExceptionRowDto, RankedRowDto, TrendPointDto } from '../../models/distribution.models';
import { AlertSeverity, EXCEPTION_ICONS } from '../../models/distribution.enums';
import { ScopeBarComponent } from '../shared/scope-bar';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The distribution manager's home screen.
 *
 * Split deliberately into three bands. The top is today — what the field has done since the sun
 * came up, judged against the same weekday last week rather than yesterday, because Tuesday and
 * Saturday are different businesses. The middle is the month, where targets live. The bottom is
 * the exception queue, ranked by money at risk rather than by age, because an unsettled route
 * carrying a large cash float matters more than an old one carrying nothing.
 *
 * Everything on the exception list is a link to the screen that clears it. A dashboard that only
 * tells you something is wrong makes you hunt for the fix, which is how items sit for a week.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-dashboard',
  imports: [CommonModule, ScopeBarComponent, PageHelpComponent],
  templateUrl: './distribution-dashboard.html',
  styleUrls: ['../distribution-shared.css', './distribution-dashboard.css'],
})
export class DistributionDashboardComponent implements OnInit, OnDestroy {
  private reports = inject(DistributionReportService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: DistributionDashboardDto | null = null;
  loading = true;
  error = '';
  territoryId: string | null = null;

  private timer?: ReturnType<typeof setInterval>;

  readonly exceptionIcons = EXCEPTION_ICONS;

  ngOnInit(): void {
    // Two minutes is right for a wall screen: fast enough that a supervisor trusts it, slow
    // enough that it is not re-running an expensive aggregate every few seconds all day.
    this.timer = setInterval(() => this.load(true), 120_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    await this.load();
  }

  async load(silent = false): Promise<void> {
    if (!silent) this.loading = true;
    this.error = '';

    const res = await firstValueFrom(
      this.reports.dashboard({ territoryId: this.territoryId ?? undefined }),
    ).catch(() => null);

    if (!res?.data) {
      if (!silent) this.error = 'Could not load the dashboard. Try again in a moment.';
    } else {
      this.data = res.data;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  go(path: string): void {
    this.router.navigateByUrl(path);
  }

  openException(row: ExceptionRowDto): void {
    // The server hands back the route that fixes each exception; falling back to the queue is
    // better than a dead click when a new exception kind ships before its screen does.
    this.go(row.actionRoute || '/distribution/reports');
  }

  // ── Chart helpers ──────────────────────────────────────────────────────────

  get trendPeak(): number {
    return Math.max(1, ...(this.data?.salesTrend ?? []).map(p => Math.max(p.value, p.comparison)));
  }

  barHeight(point: TrendPointDto): number {
    return Math.max(2, Math.round((point.value / this.trendPeak) * 100));
  }

  comparisonHeight(point: TrendPointDto): number {
    return Math.max(1, Math.round((point.comparison / this.trendPeak) * 100));
  }

  /** How far through the month we are, so the target bar can show pace, not just achievement. */
  get monthElapsedPercent(): number {
    const now = this.data?.asOf ? new Date(this.data.asOf) : new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.round((now.getDate() / days) * 100);
  }

  get paceTone(): string {
    const achieved = this.data?.monthAchievementPercent ?? 0;
    const elapsed = this.monthElapsedPercent;
    if (achieved >= elapsed) return 'tone-success';
    return achieved >= elapsed - 10 ? 'tone-warning' : 'tone-danger';
  }

  get paceLabel(): string {
    const achieved = this.data?.monthAchievementPercent ?? 0;
    const elapsed = this.monthElapsedPercent;
    const gap = Math.round(achieved - elapsed);
    if (gap >= 0) return `${gap} points ahead of pace`;
    return `${Math.abs(gap)} points behind pace`;
  }

  severityClass(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.Critical: return 'sev-critical';
      case AlertSeverity.Warning: return 'sev-high';
      default: return 'sev-medium';
    }
  }

  shareWidth(row: RankedRowDto, rows: RankedRowDto[]): number {
    const peak = Math.max(1, ...rows.map(r => r.value));
    return Math.max(2, Math.round((row.value / peak) * 100));
  }

  trackBucket = (_: number, p: TrendPointDto) => p.bucket;
  trackRank = (_: number, r: RankedRowDto) => r.id ?? r.name;
  trackException = (_: number, r: ExceptionRowDto) => `${r.kind}:${r.referenceId ?? r.title}`;
}
