import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FieldService, PerformanceService, RouteService } from '../../services/distribution.services';
import {
  FieldRepDto, IncentivePayoutDto, IncentiveSchemeDto, PaginationMetadata, RankedRowDto,
  RouteDto, SaveTargetDto, TargetDto, TerritoryDto,
} from '../../models/distribution.models';
import {
  INCENTIVE_BASIS_LABELS, METRIC_LABELS, PERIOD_LABELS, SCOPE_LABELS,
  TargetMetric, TargetPeriod, TargetScope, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, afterDateField, positive, required, validate } from '../shared/validation';

type Tab = 'targets' | 'incentives' | 'payouts' | 'leaderboard';

/**
 * Targets and incentives.
 *
 * Pace is the number that matters, not achievement. Being at 60% on the 20th of the month is
 * comfortable; being at 60% on the 28th is a crisis, and a bare percentage cannot tell you which.
 * Every target row therefore carries its pro-rata expectation alongside the raw figure.
 *
 * A published target is frozen. Editing it after the period opens creates a revision rather than
 * quietly moving the goalposts, because the original commitment is the thing anybody arguing
 * about a payout will want to see.
 */
@Component({
  standalone: true,
  selector: 'lib-targets-incentives',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './targets.html',
  styleUrls: ['../distribution-shared.css', './targets.css'],
})
export class TargetsIncentivesComponent implements OnInit {
  private performance = inject(PerformanceService);
  private routeSvc = inject(RouteService);
  private field = inject(FieldService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'targets';

  targets: TargetDto[] = [];
  incentives: IncentiveSchemeDto[] = [];
  payouts: IncentivePayoutDto[] = [];
  leaderboard: RankedRowDto[] = [];
  meta: PaginationMetadata | null = null;

  territories: TerritoryDto[] = [];
  routes: RouteDto[] = [];
  reps: FieldRepDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  page = 1;
  pageSize = 25;
  territoryId: string | null = null;
  fromDate = '';
  toDate = '';
  metricFilter = '' as '' | number;
  leaderboardMetric: TargetMetric = TargetMetric.SalesValue;

  showEditor = false;
  editing: SaveTargetDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};

  computingFor: IncentiveSchemeDto | null = null;

  readonly metricOptions = enumOptions(METRIC_LABELS);
  readonly periodOptions = enumOptions(PERIOD_LABELS);
  readonly scopeOptions = enumOptions(SCOPE_LABELS);
  readonly metricLabels = METRIC_LABELS;
  readonly periodLabels = PERIOD_LABELS;
  readonly scopeLabels = SCOPE_LABELS;
  readonly basisLabels = INCENTIVE_BASIS_LABELS;
  readonly TargetScope = TargetScope;

  async ngOnInit(): Promise<void> {
    const [terrRes, routesRes, repsRes] = await Promise.all([
      firstValueFrom(this.routeSvc.territories({ pageSize: 200 })).catch(() => null),
      firstValueFrom(this.routeSvc.list({ pageSize: 300 })).catch(() => null),
      firstValueFrom(this.field.reps({ pageSize: 200, isActive: true })).catch(() => null),
    ]);

    this.territories = terrRes?.data ?? [];
    this.routes = routesRes?.data ?? [];
    this.reps = repsRes?.data ?? [];
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.fromDate = scope.from;
    this.toDate = scope.to;
    this.page = 1;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    if (this.tab === 'targets') {
      const res = await firstValueFrom(this.performance.targets({
        page: this.page,
        pageSize: this.pageSize,
        territoryId: this.territoryId || undefined,
        metric: this.metricFilter || undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
      })).catch(() => null);
      this.targets = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the targets.';
    } else if (this.tab === 'incentives') {
      const res = await firstValueFrom(this.performance.incentives()).catch(() => null);
      this.incentives = res?.data ?? [];
      this.meta = null;
    } else if (this.tab === 'payouts') {
      const res = await firstValueFrom(this.performance.payouts({
        page: this.page, pageSize: this.pageSize,
        from: this.fromDate || undefined, to: this.toDate || undefined,
      })).catch(() => null);
      this.payouts = res?.data ?? [];
      this.meta = res?.pagination ?? null;
    } else {
      const res = await firstValueFrom(this.performance.leaderboard({
        metric: this.leaderboardMetric,
        scope: TargetScope.FieldRep,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
        territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.leaderboard = res?.data ?? [];
      this.meta = null;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Targets ────────────────────────────────────────────────────────────────

  private blank(): SaveTargetDto {
    const now = new Date();
    return {
      name: '',
      metric: TargetMetric.SalesValue,
      period: TargetPeriod.Monthly,
      scope: TargetScope.FieldRep,
      periodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
      targetValue: 0,
      isPublished: false,
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.showEditor = true;
  }

  edit(t: TargetDto): void {
    this.editing = { ...t };
    this.editorErrors = {};
    this.showEditor = true;
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A target name')],
      periodStart: [required('A start date')],
      periodEnd: [required('An end date'), afterDateField('periodStart', 'The end date', 'the start date')],
      targetValue: [required('A target'), positive('The target')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    const res = await firstValueFrom(
      this.performance.saveTarget(this.editing.id ?? null, this.editing),
    ).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      this.notice = 'Saved as a draft. Publishing freezes it.';
      await this.load();
    } else {
      this.error = 'The target could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async publish(t: TargetDto): Promise<void> {
    const res = await firstValueFrom(this.performance.publishTarget(t.id)).catch(() => null);
    if (res?.data) { this.notice = `${t.name} published — the rep sees it now.`; await this.load(); }
    else this.error = 'The target could not be published.';
    this.cdr.detectChanges();
  }

  async recompute(): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(
      this.performance.recomputeTargets(this.fromDate, this.toDate),
    ).catch(() => null);

    if (res?.data) { this.notice = `${res.data.length} targets recomputed.`; await this.load(); }
    else this.error = 'The recompute failed.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  scopeNameFor(t: TargetDto): string {
    return t.fieldRepName || t.routeName || t.partnerName || t.territoryName || 'Company-wide';
  }

  /**
   * Pace: achievement against how much of the period has actually elapsed. The server supplies
   * a pro-rata target, so this compares like with like rather than against a flat month.
   */
  paceGap(t: TargetDto): number {
    if (t.proRataTarget <= 0) return 0;
    return Math.round(((t.achievedValue - t.proRataTarget) / t.proRataTarget) * 100);
  }

  paceTone(t: TargetDto): string {
    const gap = this.paceGap(t);
    if (gap >= 0) return 'good';
    return gap > -10 ? 'warn' : 'bad';
  }

  paceLabel(t: TargetDto): string {
    const gap = this.paceGap(t);
    if (gap >= 0) return `${gap}% ahead of pace`;
    return `${Math.abs(gap)}% behind pace`;
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  async computePayouts(scheme: IncentiveSchemeDto): Promise<void> {
    if (this.busy) return;

    this.busy = true;
    this.computingFor = scheme;
    this.cdr.detectChanges();

    const res = await firstValueFrom(
      this.performance.computePayouts(scheme.id, this.fromDate, this.toDate),
    ).catch(() => null);

    if (res?.data) {
      this.notice = `${res.data.length} payouts computed. They need approving before payroll sees them.`;
      this.tab = 'payouts';
      await this.load();
    } else {
      this.error = 'The payouts could not be computed.';
    }

    this.busy = false;
    this.computingFor = null;
    this.cdr.detectChanges();
  }

  async approvePayout(p: IncentivePayoutDto, isApproved: boolean): Promise<void> {
    const res = await firstValueFrom(
      this.performance.approvePayout(p.id, isApproved),
    ).catch(() => null);

    if (res?.data) await this.load();
    else this.error = 'That decision could not be saved.';

    this.cdr.detectChanges();
  }

  get payoutTotal(): number {
    return this.payouts.reduce((sum, p) => sum + p.netPayout, 0);
  }

  barWidth(row: RankedRowDto): number {
    const peak = Math.max(1, ...this.leaderboard.map(r => r.value));
    return Math.max(2, Math.round((row.value / peak) * 100));
  }

  trackTarget = (_: number, t: TargetDto) => t.id;
  trackIncentive = (_: number, i: IncentiveSchemeDto) => i.id;
  trackPayout = (_: number, p: IncentivePayoutDto) => p.id;
  trackRank = (_: number, r: RankedRowDto) => r.id ?? r.name;
}
