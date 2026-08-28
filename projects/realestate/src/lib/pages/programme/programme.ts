import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ConfirmComponent, EmptyStateComponent, SkeletonComponent, StatsComponent, ToastComponent,
  type StatCard,
} from '../shared/ui';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';

/** One activity with the geometry needed to draw its bar. */
interface Bar {
  activity: M.ProgrammeActivityDto;
  leftPercent: number;
  widthPercent: number;
  baselineLeftPercent: number | null;
  baselineWidthPercent: number | null;
}

/* =====================================================================================
 * The programme.
 *
 * A Gantt chart, drawn as plain positioned divs rather than a charting library — this is bars on
 * a timeline, and pulling in three hundred kilobytes of chart engine to draw rectangles would be
 * absurd.
 *
 * Two things it does that a generic Gantt does not:
 *
 *   - It draws the baseline underneath the current plan. A programme that has been quietly
 *     re-planned three times looks perfectly healthy until you can see where it started, and the
 *     baseline is the only honest measure of slip.
 *   - It marks the critical path. A day lost on a critical activity is a day lost on the whole
 *     project; a day lost on one with float costs nothing. Treating the two the same is how
 *     effort gets spent in the wrong place.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-programme',
  imports: [
    CommonModule, FormsModule, StatsComponent, SkeletonComponent, EmptyStateComponent,
    ConfirmComponent, ToastComponent, SectionComponent, FactsComponent,
  ],
  templateUrl: './programme.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './programme.css',
  ],
})
export class ProgrammeComponent implements OnInit {
  private construction = inject(ConstructionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly activities = signal<M.ProgrammeActivityDto[]>([]);
  readonly loading = signal(true);
  readonly working = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly criticalOnly = signal(false);
  readonly lateOnly = signal(false);
  readonly selected = signal<M.ProgrammeActivityDto | null>(null);
  readonly baselining = signal(false);

  private projectId = '';

  readonly visible = computed(() => {
    const all = [...this.activities()].sort((a, b) => a.sortOrder - b.sortOrder);

    return all.filter(a => {
      if (this.criticalOnly() && !a.isCritical) return false;
      if (this.lateOnly() && !a.isBehindSchedule) return false;
      return true;
    });
  });

  /** The window the chart spans: earliest start to latest finish across everything shown. */
  readonly window = computed(() => {
    const rows = this.activities();
    if (!rows.length) return null;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const a of rows) {
      const starts = [a.plannedStart, a.baselineStart, a.actualStart].filter(Boolean) as string[];
      const finishes = [a.plannedFinish, a.baselineFinish, a.actualFinish]
        .filter(Boolean) as string[];

      for (const s of starts) min = Math.min(min, new Date(s).getTime());
      for (const f of finishes) max = Math.max(max, new Date(f).getTime());
    }

    if (!isFinite(min) || !isFinite(max) || max <= min) return null;
    return { from: min, to: max, span: max - min };
  });

  readonly bars = computed<Bar[]>(() => {
    const w = this.window();
    if (!w) return [];

    const pct = (t: number) => ((t - w.from) / w.span) * 100;

    return this.visible().map(a => {
      const start = new Date(a.actualStart ?? a.plannedStart).getTime();
      const finish = new Date(a.actualFinish ?? a.plannedFinish).getTime();

      const hasBaseline = !!a.baselineStart && !!a.baselineFinish;
      const bStart = hasBaseline ? new Date(a.baselineStart!).getTime() : 0;
      const bFinish = hasBaseline ? new Date(a.baselineFinish!).getTime() : 0;

      return {
        activity: a,
        leftPercent: pct(start),
        widthPercent: Math.max(0.6, pct(finish) - pct(start)),
        baselineLeftPercent: hasBaseline ? pct(bStart) : null,
        baselineWidthPercent: hasBaseline ? Math.max(0.6, pct(bFinish) - pct(bStart)) : null,
      };
    });
  });

  /** Where today falls on the chart, as a percentage. Null when today is outside the window. */
  readonly todayPercent = computed(() => {
    const w = this.window();
    if (!w) return null;

    const now = Date.now();
    if (now < w.from || now > w.to) return null;
    return ((now - w.from) / w.span) * 100;
  });

  /** Month ticks across the top, so a bar can be read against a date without hovering. */
  readonly ticks = computed(() => {
    const w = this.window();
    if (!w) return [];

    const out: { label: string; percent: number }[] = [];
    const cursor = new Date(w.from);
    cursor.setDate(1);

    while (cursor.getTime() <= w.to) {
      const t = cursor.getTime();
      if (t >= w.from) {
        out.push({
          label: cursor.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
          percent: ((t - w.from) / w.span) * 100,
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return out;
  });

  readonly stats = computed<StatCard[]>(() => {
    const rows = this.activities();
    if (!rows.length) return [];

    const critical = rows.filter(a => a.isCritical);
    const late = rows.filter(a => a.isBehindSchedule);
    const done = rows.filter(a => a.actualFinish);
    const worstSlip = rows.reduce((m, a) => Math.max(m, a.varianceDays ?? 0), 0);

    return [
      { label: 'Activities', value: rows.length, icon: 'timeline' },
      {
        label: 'On the critical path', value: critical.length, icon: 'priority_high',
        tone: 'accent', hint: 'no float — a day lost here is a day lost overall',
      },
      {
        label: 'Behind', value: late.length, icon: 'schedule',
        tone: late.length ? 'danger' : 'positive',
        hint: worstSlip ? 'worst is ' + worstSlip + ' days' : 'nothing slipping',
      },
      {
        label: 'Finished', value: done.length, icon: 'check_circle', tone: 'positive',
        hint: Math.round((done.length / rows.length) * 100) + '% of activities',
      },
    ];
  });

  readonly selectedFacts = computed<Fact[]>(() => {
    const a = this.selected();
    if (!a) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Code', value: a.code },
      { label: 'Duration', value: a.durationDays + ' days' },
      { label: 'Planned start', value: on(a.plannedStart) },
      { label: 'Planned finish', value: on(a.plannedFinish) },
      { label: 'Baseline start', value: on(a.baselineStart) },
      { label: 'Baseline finish', value: on(a.baselineFinish) },
      { label: 'Actual start', value: on(a.actualStart) },
      { label: 'Actual finish', value: on(a.actualFinish) },
      {
        label: 'Against baseline',
        value: a.varianceDays !== undefined
          ? (a.varianceDays > 0 ? a.varianceDays + ' days late'
            : a.varianceDays < 0 ? -a.varianceDays + ' days early' : 'on baseline')
          : null,
        tone: (a.varianceDays ?? 0) > 0 ? 'danger' : 'positive',
      },
      {
        label: 'Float', value: a.totalFloatDays !== undefined ? a.totalFloatDays + ' days' : null,
        hint: a.isCritical ? 'on the critical path — no float at all' : 'slack before it bites',
        tone: a.isCritical ? 'danger' : 'neutral',
      },
      { label: 'Progress', value: a.progressPercent.toFixed(0) + '%' },
      { label: 'Responsible', value: a.responsibleName },
      { label: 'Subcontractor', value: a.subcontractorName },
      { label: 'Predecessors', value: a.predecessorIds.length || 'None' },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.projectId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.construction.getProgramme(this.projectId))
      .catch(() => null);

    if (res?.data) this.activities.set(res.data);
    else this.error.set('We could not load the programme for this project.');

    this.loading.set(false);
  }

  async recalculate(): Promise<void> {
    this.working.set(true);

    const res = await firstValueFrom(this.construction.recalculateCriticalPath(this.projectId))
      .catch(() => null);

    this.working.set(false);

    if (res?.data) {
      this.activities.set(res.data);
      const critical = res.data.filter(a => a.isCritical).length;
      this.toast.set('Recalculated. ' + critical + ' activities are on the critical path.');
    } else {
      this.toast.set('The critical path could not be recalculated.');
    }
  }

  async setBaseline(): Promise<void> {
    this.working.set(true);

    const res = await firstValueFrom(this.construction.baseline(this.projectId))
      .catch(() => null);

    this.working.set(false);
    this.baselining.set(false);

    if (res?.data) {
      this.activities.set(res.data);
      this.toast.set('Baseline set. Every future slip is now measured against today’s plan.');
    } else {
      this.toast.set('The baseline was not set.');
    }
  }

  back(): void {
    void this.router.navigate(['/realestate/construction', this.projectId]);
  }

  select(a: M.ProgrammeActivityDto): void {
    this.selected.set(this.selected()?.id === a.id ? null : a);
  }

  barClass(b: Bar): string {
    const a = b.activity;
    if (a.actualFinish) return 'is-complete';
    if (a.isBehindSchedule) return 'is-late';
    return a.isCritical ? 'is-critical' : '';
  }
}
