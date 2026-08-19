import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FieldService, RouteService } from '../../services/distribution.services';
import {
  FieldRepDto, JourneyPlanDayDto, JourneyPlanDto, RouteDto,
} from '../../models/distribution.models';
import {
  JourneyPlanDayStatus, PLAN_DAY_LABELS, ROUTE_KIND_ICONS, WEEKDAYS,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent } from '../shared/ui-bits';

/** A calendar cell — either a real plan day, or a blank to line the month up with its weekdays. */
interface Cell { day?: JourneyPlanDayDto; date?: Date; isPad: boolean }

/**
 * The permanent journey plan: which rep is on which route on which day, for a whole cycle.
 *
 * Shown as a calendar rather than a table because that is the shape of the question. "Is anybody
 * covering the north beat next Thursday" is instant on a grid and requires arithmetic on a list.
 *
 * A published plan is what reps see. Editing after publication is allowed — leave and illness are
 * real — but each change stays visible as an amendment rather than quietly rewriting history.
 */
@Component({
  standalone: true,
  selector: 'lib-journey-plan',
  imports: [CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent, EmptyStateComponent],
  templateUrl: './journey-plan.html',
  styleUrls: ['../distribution-shared.css', './journey-plan.css'],
})
export class JourneyPlanComponent implements OnInit {
  private routeSvc = inject(RouteService);
  private field = inject(FieldService);
  private cdr = inject(ChangeDetectorRef);

  reps: FieldRepDto[] = [];
  routes: RouteDto[] = [];
  plan: JourneyPlanDto | null = null;
  cells: Cell[] = [];

  repId = '';
  periodStart = '';
  territoryId: string | null = null;

  loading = false;
  busy = false;
  error = '';
  notice = '';

  showGenerate = false;
  generate = {
    routeIds: [] as string[],
    nonWorkingDays: [0] as number[],
    overwrite: false,
  };

  editingDay: JourneyPlanDayDto | null = null;
  editRouteId = '';
  editStatus: JourneyPlanDayStatus = JourneyPlanDayStatus.Planned;
  editReassignTo = '';
  editSkipReason = '';

  readonly dayLabels = PLAN_DAY_LABELS;
  readonly kindIcons = ROUTE_KIND_ICONS;
  readonly weekdays = WEEKDAYS;
  readonly JourneyPlanDayStatus = JourneyPlanDayStatus;

  async ngOnInit(): Promise<void> {
    this.periodStart = this.monthStart(new Date());

    const [repsRes, routesRes] = await Promise.all([
      firstValueFrom(this.field.reps({ pageSize: 200, isActive: true })).catch(() => null),
      firstValueFrom(this.routeSvc.list({ pageSize: 300 })).catch(() => null),
    ]);

    this.reps = repsRes?.data ?? [];
    this.routes = routesRes?.data ?? [];
    this.repId = this.reps[0]?.id ?? '';

    if (this.repId) await this.load();
    this.cdr.detectChanges();
  }

  private monthStart(d: Date): string {
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    // Narrowing the territory narrows the rep list the planner is likely to want.
    const filtered = this.reps.filter(r => !this.territoryId || r.territoryId === this.territoryId);
    if (filtered.length && !filtered.some(r => r.id === this.repId)) {
      this.repId = filtered[0].id;
      await this.load();
    }
  }

  get visibleReps(): FieldRepDto[] {
    return this.reps.filter(r => !this.territoryId || r.territoryId === this.territoryId);
  }

  get territoryRoutes(): RouteDto[] {
    return this.routes.filter(r => !this.territoryId || r.territoryId === this.territoryId);
  }

  shiftMonth(by: number): void {
    const d = new Date(this.periodStart);
    d.setMonth(d.getMonth() + by);
    this.periodStart = this.monthStart(d);
    void this.load();
  }

  async load(): Promise<void> {
    if (!this.repId) return;

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.journeyPlan(this.repId, this.periodStart)).catch(() => null);
    this.plan = res?.data ?? null;
    this.buildCells();

    this.loading = false;
    this.cdr.detectChanges();
  }

  /** Lays the plan days onto a Monday-first grid, padding the first week so columns line up. */
  private buildCells(): void {
    if (!this.plan) { this.cells = []; return; }

    const days = [...this.plan.days].sort(
      (a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime(),
    );

    if (days.length === 0) { this.cells = []; return; }

    const first = new Date(days[0].planDate);
    // getDay() is Sunday-first; the grid is Monday-first because a working week is.
    const pad = (first.getDay() + 6) % 7;

    this.cells = [
      ...Array.from({ length: pad }, () => ({ isPad: true } as Cell)),
      ...days.map(day => ({ day, date: new Date(day.planDate), isPad: false })),
    ];
  }

  // ── Generating ─────────────────────────────────────────────────────────────

  openGenerate(): void {
    this.generate = {
      routeIds: this.territoryRoutes.filter(r => r.fieldRepId === this.repId).map(r => r.id),
      nonWorkingDays: [0],
      overwrite: !!this.plan,
    };
    this.showGenerate = true;
  }

  toggleRoute(id: string): void {
    this.generate.routeIds = this.generate.routeIds.includes(id)
      ? this.generate.routeIds.filter(r => r !== id)
      : [...this.generate.routeIds, id];
  }

  toggleNonWorking(day: number): void {
    this.generate.nonWorkingDays = this.generate.nonWorkingDays.includes(day)
      ? this.generate.nonWorkingDays.filter(d => d !== day)
      : [...this.generate.nonWorkingDays, day];
  }

  async runGenerate(): Promise<void> {
    if (!this.repId || this.busy) return;

    this.busy = true;
    this.cdr.detectChanges();

    const start = new Date(this.periodStart);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const res = await firstValueFrom(this.routeSvc.generateJourney({
      fieldRepId: this.repId,
      periodStart: this.periodStart,
      periodEnd: end.toISOString().slice(0, 10),
      routeIds: this.generate.routeIds.length ? this.generate.routeIds : undefined,
      nonWorkingDays: this.generate.nonWorkingDays,
      overwrite: this.generate.overwrite,
    })).catch(() => null);

    if (res?.data) {
      this.plan = res.data;
      this.buildCells();
      this.showGenerate = false;
      this.notice = 'Cycle generated. Check the exceptions, then publish.';
    } else {
      this.error = 'The cycle could not be generated.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async publish(): Promise<void> {
    if (!this.plan || this.busy) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.publishJourney(this.plan.id)).catch(() => null);

    if (res?.data) {
      this.plan = res.data;
      this.buildCells();
      this.notice = 'Published. The rep sees this plan on their terminal now.';
    } else {
      this.error = 'The plan could not be published.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Editing a day ──────────────────────────────────────────────────────────

  openDay(day: JourneyPlanDayDto): void {
    if (day.status === JourneyPlanDayStatus.Completed) return;

    this.editingDay = day;
    this.editRouteId = day.routeId ?? '';
    this.editStatus = day.status;
    this.editReassignTo = day.reassignedToFieldRepId ?? '';
    this.editSkipReason = day.skipReason ?? '';
  }

  get editNeedsReason(): boolean {
    return this.editStatus === JourneyPlanDayStatus.Skipped;
  }

  async saveDay(): Promise<void> {
    if (!this.editingDay || this.busy) return;
    if (this.editNeedsReason && !this.editSkipReason.trim()) return;

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.routeSvc.updateJourneyDay(this.editingDay.id, {
      routeId: this.editRouteId || undefined,
      status: this.editStatus,
      reassignedToFieldRepId: this.editReassignTo || undefined,
      skipReason: this.editSkipReason || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.editingDay = null;
      await this.load();
    } else {
      this.error = 'That change could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Coverage ───────────────────────────────────────────────────────────────

  /**
   * How many days each route gets in the cycle. A route that appears zero times is the failure
   * this screen is meant to catch before anyone works from the plan.
   */
  get routeCoverage(): { route: RouteDto; days: number }[] {
    const counts = new Map<string, number>();
    for (const day of this.plan?.days ?? []) {
      if (day.routeId && day.status !== JourneyPlanDayStatus.Skipped) {
        counts.set(day.routeId, (counts.get(day.routeId) ?? 0) + 1);
      }
    }

    return this.territoryRoutes
      .filter(r => r.fieldRepId === this.repId || counts.has(r.id))
      .map(route => ({ route, days: counts.get(route.id) ?? 0 }))
      .sort((a, b) => a.days - b.days);
  }

  get uncoveredRoutes(): number {
    return this.routeCoverage.filter(r => r.days === 0).length;
  }

  statusClass(day: JourneyPlanDayDto): string {
    switch (day.status) {
      case JourneyPlanDayStatus.Completed: return 'is-done';
      case JourneyPlanDayStatus.InProgress: return 'is-live';
      case JourneyPlanDayStatus.Skipped: return 'is-skipped';
      case JourneyPlanDayStatus.Reassigned: return 'is-reassigned';
      default: return 'is-planned';
    }
  }

  trackCell = (i: number, c: Cell) => c.day?.id ?? `pad-${i}`;
}
