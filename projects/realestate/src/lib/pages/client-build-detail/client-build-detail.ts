import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  CERTIFICATE_STATUS_LABELS, CONTRACT_KIND_LABELS, INSTALMENT_STATUS_LABELS,
  MILESTONE_STATUS_LABELS, SPECIFICATION_GRADE_LABELS, VARIATION_STATUS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  BreakdownComponent, ProgressComponent, ToastComponent, type BreakdownSlice,
} from '../shared/ui';

/* =====================================================================================
 * A client build contract.
 *
 * The third shape of this business: the customer owns the land, hands over money, and asks for a
 * house to be built on it. Nothing is being sold — a service is being performed — and almost
 * every commercial risk sits somewhere different from a normal development.
 *
 * The screen is built around the three things that actually decide whether one of these contracts
 * makes money:
 *
 *   - Margin erosion, attributed. A contract does not lose its margin all at once; it loses it in
 *     pieces — variations absorbed rather than charged, wastage, rework, delay, rate increases.
 *     Attributing the loss is the only way to stop it happening again on the next one.
 *   - Client-supplied materials. The client agrees to provide the marble. The marble does not
 *     arrive. Work stops, and the delay is the client's, not ours — but only if it was recorded
 *     at the time.
 *   - Specification freeze. Until the specification is frozen every conversation is a variation
 *     waiting to happen. After it is frozen, every change is priced.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-client-build-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, BreakdownComponent, ToastComponent,
  ],
  templateUrl: './client-build-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './client-build-detail.css',
  ],
})
export class ClientBuildDetailComponent implements OnInit {
  private construction = inject(ConstructionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ClientBuildContractDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly lateMaterials = computed(() =>
    (this.data()?.clientSuppliedMaterials ?? []).filter(m => m.isOverdue || m.isDelayingWork));

  readonly expiredQuotes = computed(() =>
    (this.data()?.variations ?? []).filter(v => v.quoteExpired && !v.clientApproved));

  readonly specFrozen = computed(() => this.data()?.specification?.isFrozen ?? false);

  readonly pendingSelections = computed(() =>
    this.data()?.specification?.pendingSelectionCount ?? 0);

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'home_work' },
      { key: 'scope', label: 'Scope', icon: 'checklist', count: d.scopeItems.length },
      { key: 'money', label: 'Cost and margin', icon: 'payments',
        count: d.isMarginAtRisk ? 1 : 0,
        tone: d.isMarginAtRisk ? 'danger' : 'neutral' },
      { key: 'payments', label: 'Payments', icon: 'receipt_long',
        count: d.certificates.length },
      { key: 'variations', label: 'Variations', icon: 'edit_note',
        count: d.openVariationCount,
        tone: this.expiredQuotes().length ? 'danger'
          : d.openVariationCount ? 'warning' : 'neutral' },
      { key: 'materials', label: 'Client materials', icon: 'inventory',
        count: this.lateMaterials().length,
        tone: this.lateMaterials().length ? 'danger' : 'neutral' },
      { key: 'spec', label: 'Specification', icon: 'palette',
        count: this.pendingSelections(),
        tone: this.pendingSelections() ? 'warning' : 'neutral' },
      { key: 'drawings', label: 'Drawings', icon: 'architecture', count: d.drawings.length },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: d.status },
      { label: CONTRACT_KIND_LABELS[d.kind] },
      { label: SPECIFICATION_GRADE_LABELS[d.grade] },
    ];

    if (d.isMarginAtRisk) {
      pills.push({ label: 'Margin at risk', tone: 'danger', icon: 'trending_down' });
    }
    if ((d.slipDays ?? 0) > 0) {
      pills.push({ label: d.slipDays + ' days behind', tone: 'danger', icon: 'schedule' });
    }
    if (!this.specFrozen()) {
      pills.push({ label: 'Specification not frozen', tone: 'warning', icon: 'lock_open' });
    }
    if (d.pendingClientDecisions > 0) {
      pills.push({
        label: d.pendingClientDecisions + ' decisions with the client',
        tone: 'warning', icon: 'pending',
      });
    }
    if (this.lateMaterials().length) {
      pills.push({ label: 'Client materials late', tone: 'danger', icon: 'inventory' });
    }
    if (d.guaranteedMaximumPrice) {
      pills.push({ label: 'Guaranteed maximum price', tone: 'muted' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Contract', value: this.money(d.revisedContractValue),
        hint: d.approvedVariations
          ? this.money(d.contractValue) + ' plus variations' : 'as signed',
      },
      {
        label: 'Received', value: this.money(d.totalReceived),
        hint: d.outstanding > 0 ? this.money(d.outstanding) + ' outstanding' : 'fully paid',
      },
      {
        label: 'Forecast margin', value: this.money(d.forecastMargin),
        hint: d.marginPercent.toFixed(1) + '%',
      },
      {
        label: 'Built', value: d.progressPercent.toFixed(0) + '%',
        hint: d.forecastCompletionDate
          ? 'due ' + new Date(d.forecastCompletionDate).toLocaleDateString() : null,
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (d.constructionProjectId) {
      actions.push({
        key: 'construction', label: 'The build', icon: 'construction', tone: 'primary',
      });
    }
    if (d.snagInspectionId) {
      actions.push({ key: 'snags', label: 'Snagging', icon: 'fact_check' });
    }

    actions.push({ key: 'client', label: 'The client', icon: 'person' });

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Name', value: d.name },
      { label: 'Client', value: d.clientName },
      { label: 'Phone', value: d.clientPhone },
      { label: 'Co-client', value: d.coClientName },
      { label: 'Site', value: d.siteAddress, wide: true },
      { label: 'Kind', value: CONTRACT_KIND_LABELS[d.kind] },
      { label: 'Grade', value: SPECIFICATION_GRADE_LABELS[d.grade] },
      { label: 'Plot area', value: d.plotArea.displayText },
      { label: 'Covered area', value: d.coveredArea.displayText },
      { label: 'Rate', value: this.money(d.ratePerSqFt) + ' per sq ft' },
      { label: 'Signed', value: on(d.signedOn) },
      { label: 'Started', value: on(d.startDate) },
      { label: 'Planned completion', value: on(d.plannedCompletionDate) },
      {
        label: 'Forecast completion', value: on(d.forecastCompletionDate),
        tone: (d.slipDays ?? 0) > 0 ? 'danger' : 'positive',
      },
      { label: 'Actual completion', value: on(d.actualCompletionDate) },
      { label: 'Extension granted', value: d.extensionDaysGranted + ' days' },
      { label: 'Project manager', value: d.projectManagerName },
      { label: 'Architect', value: d.architectName },
      { label: 'Client portal', value: d.clientPortalEnabled ? 'Enabled' : 'Not enabled' },
      { label: 'Notes', value: d.notes, wide: true },
    ];
  });

  readonly commercial = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Contract value', value: this.money(d.contractValue) },
      { label: 'Approved variations', value: this.money(d.approvedVariations) },
      { label: 'Revised value', value: this.money(d.revisedContractValue) },
      {
        label: 'Guaranteed maximum',
        value: d.guaranteedMaximumPrice ? this.money(d.guaranteedMaximumPrice) : 'None',
        hint: d.guaranteedMaximumPrice
          ? 'anything above this is ours to absorb' : null,
        tone: d.guaranteedMaximumPrice
          && d.forecastFinalCost > d.guaranteedMaximumPrice ? 'danger' : 'neutral',
      },
      { label: 'Fee', value: d.feePercent ? d.feePercent.toFixed(2) + '%' : this.money(d.fixedFee) },
      { label: 'Advance received', value: this.money(d.advanceReceived) },
      { label: 'Retention', value: d.retentionPercent.toFixed(1) + '%' },
      { label: 'Retention released', value: this.money(d.retentionReleased) },
      { label: 'Held by the client', value: this.money(d.retentionHeldByClient) },
      {
        label: 'Liquidated damages',
        value: d.liquidatedDamagesPerDay
          ? this.money(d.liquidatedDamagesPerDay) + ' a day' : 'None',
        hint: d.liquidatedDamagesCapPercent
          ? 'capped at ' + d.liquidatedDamagesCapPercent + '% of the contract' : null,
        tone: (d.slipDays ?? 0) > 0 && d.liquidatedDamagesPerDay ? 'danger' : 'neutral',
        wide: true,
      },
      { label: 'Defects period', value: d.defectsPeriodMonths + ' months' },
    ];
  });

  readonly costFacts = computed<Fact[]>(() => {
    const c = this.data()?.costSheet;
    if (!c) return [];

    return [
      { label: 'Budget cost', value: this.money(c.budgetCost) },
      { label: 'Committed', value: this.money(c.committedCost) },
      { label: 'Actual', value: this.money(c.actualCost) },
      { label: 'Cost to complete', value: this.money(c.costToComplete) },
      {
        label: 'Forecast final cost', value: this.money(c.forecastFinalCost),
        tone: c.forecastFinalCost > c.budgetCost ? 'danger' : 'positive',
      },
      { label: 'Budget margin', value: this.money(c.budgetMargin) },
      {
        label: 'Forecast margin', value: this.money(c.forecastMargin),
        tone: c.forecastMargin < 0 ? 'danger' : 'positive',
        hint: c.marginPercent.toFixed(2) + '%',
      },
      {
        label: 'Margin lost', value: this.money(c.marginErosion),
        tone: c.marginErosion > 0 ? 'danger' : 'positive',
        hint: 'against the margin budgeted at signing',
      },
      { label: 'Certified', value: this.money(c.certifiedValue) },
      { label: 'Collected', value: this.money(c.collectedValue) },
      {
        label: 'Cash position', value: this.money(c.cashPosition),
        tone: c.cashPosition < 0 ? 'danger' : 'positive',
        hint: c.cashPosition < 0 ? 'we are funding this contract' : 'the client is ahead of us',
      },
      { label: 'Commentary', value: c.commentary, wide: true },
    ];
  });

  /**
   * Margin erosion, attributed. Each cause is a different management response — absorbed
   * variations mean the commercial process is weak; wastage and rework mean the site is;
   * rate increases mean procurement was slow.
   */
  readonly erosion = computed<BreakdownSlice[]>(() => {
    const c = this.data()?.costSheet;
    if (!c || c.marginErosion <= 0) return [];

    const causes = [
      { label: 'Variations absorbed rather than charged', value: c.erosionFromVariationsAbsorbed },
      { label: 'Wastage', value: c.erosionFromWastage },
      { label: 'Rework', value: c.erosionFromRework },
      { label: 'Delay', value: c.erosionFromDelay },
      { label: 'Rate increases', value: c.erosionFromRateIncrease },
      { label: 'Other', value: c.erosionOther },
    ].filter(x => x.value > 0);

    const total = causes.reduce((s, x) => s + x.value, 0) || 1;

    return causes
      .map(x => ({
        label: x.label,
        value: x.value,
        percent: (x.value / total) * 100,
        count: 0,
        tone: 'danger',
      }))
      .sort((a, b) => b.value - a.value);
  });

  readonly included = computed(() =>
    (this.data()?.scopeItems ?? []).filter(s => s.isIncluded));

  readonly excluded = computed(() =>
    (this.data()?.scopeItems ?? []).filter(s => !s.isIncluded));

  readonly materials = computed<MiniRow[]>(() =>
    (this.data()?.clientSuppliedMaterials ?? []).map(m => ({
      id: m.id ?? m.description,
      title: m.description,
      sub: m.note ?? null,
      meta: 'agreed ' + m.agreedQuantity + ' ' + m.uom
        + ' · received ' + m.receivedQuantity
        + ' · used ' + m.consumedQuantity
        + (m.expectedBy ? ' · expected ' + new Date(m.expectedBy).toLocaleDateString() : '')
        + (m.isDelayingWork ? ' · holding up work' : ''),
      value: m.outstandingQuantity
        ? m.outstandingQuantity + ' ' + m.uom + ' short' : 'complete',
      valueSub: m.rateExclusionAmount
        ? this.money(m.rateExclusionAmount) + ' excluded from our rate' : null,
      tone: m.isDelayingWork ? 'alert' : m.isOverdue ? 'warn' : 'good',
      icon: 'inventory',
    })));

  readonly variations = computed<MiniRow[]>(() =>
    (this.data()?.variations ?? []).map(v => ({
      id: v.id,
      title: v.reference + ' · ' + v.title,
      sub: v.description,
      meta: VARIATION_STATUS_LABELS[v.status]
        + ' · requested ' + new Date(v.requestedOn).toLocaleDateString()
        + (v.raisedViaPortal ? ' via the portal' : '')
        + (v.timeImpactDays ? ' · ' + v.timeImpactDays + ' days impact' : '')
        + (v.quoteExpired ? ' · quote expired' : '')
        + (v.isBilled ? ' · billed' : ''),
      value: this.money(v.netAmount),
      valueSub: v.clientApproved ? 'approved by the client' : 'not yet approved',
      tone: v.quoteExpired && !v.clientApproved ? 'alert'
        : v.clientApproved ? 'good' : 'warn',
      icon: 'edit_note',
    })));

  readonly certificates = computed<MiniRow[]>(() =>
    (this.data()?.certificates ?? []).map(c => ({
      id: c.id,
      title: c.certificateNumber,
      sub: 'period to ' + new Date(c.periodTo).toLocaleDateString(),
      meta: CERTIFICATE_STATUS_LABELS[c.status]
        + (c.isOverdue ? ' · payment overdue' : '')
        + (c.paidAmount ? ' · ' + this.money(c.paidAmount) + ' paid' : ' · unpaid'),
      value: this.money(c.netPayable),
      valueSub: c.retentionThisCertificate
        ? this.money(c.retentionThisCertificate) + ' retention' : null,
      tone: c.isOverdue ? 'alert' : 'neutral',
      icon: 'receipt_long',
    })));

  readonly milestones = computed<MiniRow[]>(() =>
    (this.data()?.milestones ?? []).map(m => ({
      id: m.id,
      title: m.name,
      sub: MILESTONE_STATUS_LABELS[m.status],
      meta: m.reachedOn
        ? 'reached ' + new Date(m.reachedOn).toLocaleDateString()
        : (m.forecastDate ? 'forecast ' + new Date(m.forecastDate).toLocaleDateString() : null),
      value: m.linkedDemandValue ? this.money(m.linkedDemandValue) : null,
      valueSub: m.linkedDemandValue
        ? (m.demandsRaised ? 'already demanded' : 'would be demanded') : null,
      tone: (m.slipDays ?? 0) > 0 ? 'warn' : m.reachedOn ? 'good' : 'neutral',
      icon: 'flag',
    })));

  readonly drawings = computed<MiniRow[]>(() =>
    (this.data()?.drawings ?? []).map(dr => ({
      id: dr.id,
      title: dr.drawingNumber + ' · ' + dr.title,
      sub: [dr.discipline, dr.scale, dr.preparedByName].filter(Boolean).join(' · '),
      meta: 'revision ' + dr.currentRevision
        + (dr.currentRevisionDate
          ? ' of ' + new Date(dr.currentRevisionDate).toLocaleDateString() : '')
        + ' · ' + dr.status
        + (dr.clientApproved ? ' · client approved' : ' · not approved by the client')
        + (dr.isIssuedToSite ? ' · issued to site' : ' · not on site'),
      valueSub: dr.revisionCount > 1 ? dr.revisionCount + ' revisions' : null,
      tone: !dr.clientApproved ? 'warn' : dr.isIssuedToSite ? 'good' : 'neutral',
      icon: 'architecture',
    })));

  readonly planInstalments = computed(() => this.data()?.paymentPlan?.instalments ?? []);

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

    const res = await firstValueFrom(this.construction.getClientBuild(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'construction' && d.constructionProjectId) {
      void this.router.navigate(['/realestate/construction', d.constructionProjectId]);
    } else if (key === 'snags' && d.snagInspectionId) {
      void this.router.navigate(['/realestate/exit/snagging', d.snagInspectionId]);
    } else if (key === 'client') {
      void this.router.navigate(['/realestate/contacts', d.clientPartyId]);
    }
  }

  gradeLabel(g: M.SpecificationScheduleDto['grade']): string {
    return SPECIFICATION_GRADE_LABELS[g] ?? '—';
  }

  instalmentStatus(i: M.InstalmentDto): string {
    if (i.daysOverdue > 0) return i.daysOverdue + ' days overdue';
    return INSTALMENT_STATUS_LABELS[i.status];
  }

  instalmentClass(i: M.InstalmentDto): string {
    if (i.daysOverdue > 0) return 'is-overdue';
    if (i.balance === 0) return 'is-paid';
    return '';
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
