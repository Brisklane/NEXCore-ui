import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  CERTIFICATE_STATUS_LABELS, PROGRESS_METHOD_LABELS, PROJECT_STATUS_LABELS,
  SUBCONTRACT_STATUS_LABELS, VARIATION_STATUS_LABELS, WBS_KIND_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import { ProgressComponent, ToastComponent } from '../shared/ui';

/* =====================================================================================
 * A construction project.
 *
 * The build side: what was contracted, what has been done, what it has cost and what it will
 * finally cost.
 *
 * The number that decides whether this project makes money is forecast final cost against revised
 * contract value, and it is on the header. Everything else on the screen exists to explain it —
 * committed cost that has not yet been invoiced, variations agreed but not yet priced, and the
 * gap between physical and financial progress, which is where margin quietly disappears.
 *
 * Physical against financial progress is the cheapest early warning in construction. Building
 * faster than you are certifying means unbilled work; certifying faster than you are building
 * means over-certification, which is far worse and much harder to unwind.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-construction-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, ToastComponent,
  ],
  templateUrl: './construction-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './construction-detail.css',
  ],
})
export class ConstructionDetailComponent implements OnInit {
  private construction = inject(ConstructionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ConstructionProjectDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  /** Physical ahead of financial means work done but not yet certified — unbilled revenue. */
  readonly progressGap = computed(() => {
    const d = this.data();
    if (!d) return 0;
    return d.physicalProgressPercent - d.financialProgressPercent;
  });

  readonly overCertified = computed(() => this.progressGap() < -5);
  readonly underBilled = computed(() => this.progressGap() > 5);

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'insights' },
      { key: 'wbs', label: 'Work breakdown', icon: 'account_tree', count: d.wbs.length },
      { key: 'programme', label: 'Programme', icon: 'timeline', count: d.programme.length },
      { key: 'money', label: 'Cost and margin', icon: 'payments' },
      { key: 'certificates', label: 'Certificates', icon: 'task_alt',
        count: d.certificates.length },
      { key: 'variations', label: 'Variations', icon: 'edit_note',
        count: d.openVariations,
        tone: d.openVariations ? 'warning' : 'neutral' },
      { key: 'subcontracts', label: 'Subcontracts', icon: 'engineering',
        count: d.subcontracts.length },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PROJECT_STATUS_LABELS[d.status] },
      { label: PROGRESS_METHOD_LABELS[d.progressMethod] },
    ];

    if (d.isAtRisk) pills.push({ label: 'At risk', tone: 'danger', icon: 'warning' });
    if ((d.slipDays ?? 0) > 0) {
      pills.push({ label: d.slipDays + ' days behind', tone: 'danger', icon: 'schedule' });
    }
    if (d.extensionDaysGranted > 0) {
      pills.push({ label: d.extensionDaysGranted + ' days extension granted', tone: 'muted' });
    }
    if (d.marginPercent < 0) {
      pills.push({ label: 'Forecast loss', tone: 'danger', icon: 'trending_down' });
    }
    if (this.overCertified()) {
      pills.push({ label: 'Over-certified', tone: 'danger', icon: 'gpp_maybe' });
    }
    if (d.openDelays > 0) {
      pills.push({ label: d.openDelays + ' open delay claims', tone: 'warning' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Contract value', value: this.money(d.revisedContractValue),
        hint: d.approvedVariations
          ? this.money(d.contractValue) + ' plus variations' : 'as awarded',
      },
      {
        label: 'Forecast final cost', value: this.money(d.forecastFinalCost),
        hint: this.money(d.actualCost) + ' spent so far',
      },
      {
        label: 'Forecast margin', value: this.money(d.forecastMargin),
        hint: d.marginPercent.toFixed(1) + '% of revised value',
      },
      {
        label: 'Built', value: d.physicalProgressPercent.toFixed(0) + '%',
        hint: d.financialProgressPercent.toFixed(0) + '% certified',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => [
    { key: 'boq', label: 'Bill of quantities', icon: 'list_alt', tone: 'primary' },
    { key: 'programme', label: 'Programme', icon: 'timeline' },
    { key: 'progress', label: 'Record progress', icon: 'straighten' },
  ]);

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Name', value: d.name },
      { label: 'Code', value: d.code },
      { label: 'Development', value: d.projectName },
      { label: 'Status', value: PROJECT_STATUS_LABELS[d.status] },
      { label: 'Started', value: on(d.startDate) },
      { label: 'Planned completion', value: on(d.plannedCompletionDate) },
      {
        label: 'Forecast completion', value: on(d.forecastCompletionDate),
        tone: (d.slipDays ?? 0) > 0 ? 'danger' : 'positive',
        hint: (d.slipDays ?? 0) > 0 ? d.slipDays + ' days late' : 'on programme',
      },
      { label: 'Actual completion', value: on(d.actualCompletionDate) },
      { label: 'Extension granted', value: d.extensionDaysGranted + ' days' },
      { label: 'Project manager', value: d.projectManagerName },
      { label: 'Quantity surveyor', value: d.quantitySurveyorName },
      { label: 'Site engineer', value: d.siteEngineerName },
      { label: 'Progress measured by', value: PROGRESS_METHOD_LABELS[d.progressMethod] },
      {
        label: 'Retention', value: d.defaultRetentionPercent.toFixed(1) + '%',
        hint: 'capped at ' + d.retentionCapPercent.toFixed(1) + '% of the contract',
      },
      { label: 'Defects period', value: d.defectsPeriodMonths + ' months' },
    ];
  });

  readonly moneyFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Original contract', value: this.money(d.contractValue) },
      {
        label: 'Approved variations', value: this.money(d.approvedVariations),
        tone: d.approvedVariations > 0 ? 'positive' : 'muted',
      },
      { label: 'Revised contract value', value: this.money(d.revisedContractValue) },
      { label: 'Budget cost', value: this.money(d.budgetCost) },
      {
        label: 'Committed', value: this.money(d.committedCost),
        hint: 'ordered or subcontracted, not all invoiced yet',
      },
      { label: 'Actual cost', value: this.money(d.actualCost) },
      {
        label: 'Forecast final cost', value: this.money(d.forecastFinalCost),
        tone: d.forecastFinalCost > d.budgetCost ? 'danger' : 'positive',
        hint: d.forecastFinalCost > d.budgetCost
          ? this.money(d.forecastFinalCost - d.budgetCost) + ' over budget'
          : this.money(d.budgetCost - d.forecastFinalCost) + ' under budget',
      },
      {
        label: 'Forecast margin', value: this.money(d.forecastMargin),
        tone: d.forecastMargin < 0 ? 'danger' : 'positive',
        hint: d.marginPercent.toFixed(2) + '%',
      },
      { label: 'Certified to date', value: this.money(d.certifiedValue) },
      { label: 'Received', value: this.money(d.receivedValue), tone: 'positive' },
      { label: 'Invoiced', value: this.money(d.invoicedValue) },
      {
        label: 'Retention held', value: this.money(d.retentionHeld),
        hint: 'released after the defects period',
      },
    ];
  });

  /** Flattened for display, keeping depth so the hierarchy reads as indentation. */
  readonly flatWbs = computed(() => {
    const out: M.WbsNodeDto[] = [];

    const walk = (nodes: M.WbsNodeDto[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) walk(n.children);
      }
    };

    walk(this.data()?.wbs ?? []);
    return out;
  });

  readonly criticalActivities = computed(() =>
    (this.data()?.programme ?? []).filter(a => a.isCritical));

  readonly lateActivities = computed(() =>
    (this.data()?.programme ?? []).filter(a => a.isBehindSchedule));

  readonly activities = computed<MiniRow[]>(() =>
    [...(this.data()?.programme ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(a => ({
        id: a.id,
        title: a.code + ' · ' + a.name,
        sub: [
          a.responsibleName,
          a.subcontractorName,
          a.isMilestone ? 'milestone' : a.durationDays + ' days',
        ].filter(Boolean).join(' · '),
        meta: new Date(a.plannedStart).toLocaleDateString()
          + ' to ' + new Date(a.plannedFinish).toLocaleDateString()
          + (a.totalFloatDays !== undefined
            ? ' · ' + a.totalFloatDays + ' days float' : '')
          + (a.varianceDays ? ' · ' + a.varianceDays + ' days against baseline' : ''),
        value: a.progressPercent.toFixed(0) + '%',
        valueSub: a.isCritical ? 'critical path' : null,
        tone: a.isBehindSchedule ? 'alert' : a.isCritical ? 'warn' : 'neutral',
        icon: a.isMilestone ? 'flag' : 'timeline',
      })));

  readonly certificates = computed<MiniRow[]>(() =>
    (this.data()?.certificates ?? []).map(c => ({
      id: c.id,
      title: c.certificateNumber,
      sub: [c.direction, c.subcontractorName ?? c.clientName].filter(Boolean).join(' · ') || null,
      meta: CERTIFICATE_STATUS_LABELS[c.status]
        + ' · to ' + new Date(c.periodTo).toLocaleDateString()
        + (c.isOverdue ? ' · payment overdue' : ''),
      value: this.money(c.netPayable),
      valueSub: c.retentionThisCertificate
        ? this.money(c.retentionThisCertificate) + ' retention held' : null,
      tone: c.isOverdue ? 'alert' : 'neutral',
      icon: 'task_alt',
    })));

  readonly variations = computed<MiniRow[]>(() =>
    (this.data()?.variations ?? []).map(v => ({
      id: v.id,
      title: v.variationNumber + ' · ' + v.title,
      sub: [v.subcontractorName ?? v.clientName, v.raisedByName].filter(Boolean).join(' · ')
        || null,
      meta: VARIATION_STATUS_LABELS[v.status]
        + ' · raised ' + new Date(v.raisedOn).toLocaleDateString()
        + (v.timeImpactDays ? ' · ' + v.timeImpactDays + ' days impact' : '')
        + (v.isMeasured ? ' · measured' : ' · not yet measured')
        + (v.daysOpen ? ' · open ' + v.daysOpen + ' days' : ''),
      value: this.money(v.netAmount),
      valueSub: v.omissionAmount
        ? this.money(v.additionAmount) + ' added, ' + this.money(v.omissionAmount) + ' omitted'
        : (v.approvedOn ? 'approved' : 'not yet approved'),
      tone: v.isAwaitingApproval ? 'warn' : v.approvedOn ? 'good' : 'neutral',
      icon: 'edit_note',
    })));

  readonly subcontracts = computed<MiniRow[]>(() =>
    (this.data()?.subcontracts ?? []).map(s => ({
      id: s.id,
      title: s.reference + ' · ' + s.contractorName,
      sub: s.name,
      meta: SUBCONTRACT_STATUS_LABELS[s.status]
        + ' · certified ' + this.money(s.certifiedToDate)
        + ' of ' + this.money(s.revisedValue)
        + ' · ' + s.progressPercent.toFixed(0) + '% done'
        + (s.insuranceVerified ? '' : ' · insurance unverified')
        + (s.openClaimCount ? ' · ' + s.openClaimCount + ' open claims' : ''),
      value: this.money(s.revisedValue),
      valueSub: s.retentionHeld
        ? this.money(s.retentionHeld) + ' retention held' : null,
      tone: (s.delayDays ?? 0) > 0 ? 'alert' : !s.insuranceVerified ? 'warn' : 'neutral',
      icon: 'engineering',
    })));

  readonly costToComplete = computed(() => this.data()?.costToComplete ?? null);

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.construction.getProject(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    void this.router.navigate(['/realestate/construction', d.id, key]);
  }

  wbsKind(n: M.WbsNodeDto): string {
    return WBS_KIND_LABELS[n.kind] ?? '';
  }

  /**
   * Cost performance: earned value over actual cost. Below 1 means the work done so far has
   * cost more than it was budgeted to, and that gap almost never closes on its own.
   */
  cpi(n: M.WbsNodeDto): number | null {
    return n.actualAmount > 0 ? n.earnedValue / n.actualAmount : null;
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 10_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
