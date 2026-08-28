import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PropertyService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ACQUISITION_STAGE_KIND_LABELS, ENCUMBRANCE_KIND_LABELS, ENCUMBRANCE_STATUS_LABELS,
  EncumbranceStatus, TITLE_INSTRUMENT_LABELS, VERIFICATION_VERDICT_LABELS,
  VerificationVerdict,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import { ProgressComponent, ToastComponent } from '../shared/ui';

/* =====================================================================================
 * A land parcel.
 *
 * The thing a development is built on, before it is a project. What matters here is not the
 * building — it is whether the land can be safely bought and safely sold from.
 *
 * Three failures cost real money and all three are surfaced at the top:
 *
 *   - A break in the chain of title. Every transfer since the first record has to link to the
 *     one before it; a gap is where a claim comes from twenty years later.
 *   - A verification check that has not been done. These are the searches — encumbrance
 *     certificates, mutation entries, land-use confirmations — and skipping one to save a week
 *     is how a scheme ends up in court.
 *   - A variance between the recorded area and the surveyed area. Buying by record and selling by
 *     survey is a straightforward way to sell land you do not own.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-parcel-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, ToastComponent,
  ],
  templateUrl: './parcel-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './parcel-detail.css',
  ],
})
export class ParcelDetailComponent implements OnInit {
  private properties = inject(PropertyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.LandParcelDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly openChecks = computed(() =>
    (this.data()?.verificationItems ?? [])
      .filter(v => v.verdict === VerificationVerdict.Pending && v.isMandatory));

  readonly failedChecks = computed(() =>
    (this.data()?.verificationItems ?? [])
      .filter(v => v.verdict === VerificationVerdict.Failed));

  readonly blockingEncumbrances = computed(() =>
    (this.data()?.encumbrances ?? [])
      .filter(e => e.blocksTransaction && e.status !== EncumbranceStatus.Cleared));

  /** A gap in the chain: an entry whose transferor is not the previous entry's transferee. */
  readonly chainGaps = computed(() => {
    const chain = [...(this.data()?.titleChain ?? [])]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const gaps: string[] = [];
    for (let i = 1; i < chain.length; i++) {
      const previous = chain[i - 1];
      const current = chain[i];
      if (previous.transfereeName && current.transferorName
        && previous.transfereeName.trim().toLowerCase()
          !== current.transferorName.trim().toLowerCase()) {
        gaps.push(previous.transfereeName + ' → ' + current.transferorName);
      }
    }
    return gaps;
  });

  readonly verificationProgress = computed(() => {
    const items = this.data()?.verificationItems ?? [];
    if (!items.length) return 0;
    const done = items.filter(v => v.verdict !== VerificationVerdict.Pending).length;
    return (done / items.length) * 100;
  });

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'title', label: 'Chain of title', icon: 'link',
        count: this.chainGaps().length,
        tone: this.chainGaps().length ? 'danger' : 'neutral' },
      { key: 'checks', label: 'Verification', icon: 'fact_check',
        count: this.openChecks().length + this.failedChecks().length,
        tone: this.failedChecks().length ? 'danger'
          : this.openChecks().length ? 'warning' : 'neutral' },
      { key: 'encumbrances', label: 'Encumbrances', icon: 'lock',
        count: this.blockingEncumbrances().length,
        tone: this.blockingEncumbrances().length ? 'danger' : 'neutral' },
      { key: 'cost', label: 'Cost', icon: 'payments', count: d.costLines.length },
      { key: 'acquisition', label: 'Acquisition', icon: 'handshake' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: ACQUISITION_STAGE_KIND_LABELS[d.stage] },
      {
        label: d.isAcquired ? 'Acquired' : 'Not yet acquired',
        tone: d.isAcquired ? 'positive' : 'warning',
      },
    ];

    if (d.hasLitigation) pills.push({ label: 'Under litigation', tone: 'danger', icon: 'gavel' });
    if (this.blockingEncumbrances().length) {
      pills.push({ label: 'Cannot be transacted', tone: 'danger', icon: 'block' });
    }
    if (this.chainGaps().length) {
      pills.push({ label: 'Break in the title chain', tone: 'danger', icon: 'link_off' });
    }
    if (d.areaVarianceSqFt) {
      pills.push({ label: 'Area does not agree', tone: 'warning', icon: 'straighten' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Recorded area', value: d.recordArea.displayText,
        hint: d.surveyedArea ? 'surveyed ' + d.surveyedArea.displayText : 'not surveyed',
      },
      {
        label: 'Agreed price', value: this.money(d.agreedPrice),
        hint: 'before costs',
      },
      {
        label: 'Total cost', value: this.money(d.totalAcquisitionCost),
        hint: 'including duty, fees and levies',
      },
      {
        label: 'Holding cost', value: this.money(d.monthlyHoldingCost),
        hint: 'a month while it sits',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const blocked = this.blockingEncumbrances().length > 0 || this.failedChecks().length > 0;

    return [
      {
        key: 'project', label: 'Start a project', icon: 'apartment', tone: 'primary',
        disabled: blocked,
        reason: blocked
          ? 'This parcel has an unresolved encumbrance or a failed title check.' : null,
      },
      { key: 'edit', label: 'Edit', icon: 'edit' },
    ];
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly identity = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Name', value: d.name },
      { label: 'Survey number', value: d.surveyNumber },
      { label: 'Khasra', value: d.khasraNumber },
      { label: 'Khewat', value: d.khewatNumber },
      { label: 'Khatuni', value: d.khatuniNumber },
      { label: 'Mouza', value: d.mouza },
      { label: 'Village', value: d.village },
      { label: 'Tehsil', value: d.tehsil },
      { label: 'District', value: d.district },
      { label: 'Registrar', value: d.registrarOffice },
      { label: 'Project', value: d.projectName },
    ];
  });

  readonly measurements = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'On the record', value: d.recordArea.displayText },
      { label: 'On the ground', value: d.surveyedArea?.displayText },
      {
        label: 'Variance',
        value: d.areaVarianceSqFt
          ? d.areaVarianceSqFt.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' sq ft'
          : 'None',
        tone: d.areaVarianceSqFt ? 'danger' : 'positive',
        hint: d.areaVarianceSqFt
          ? 'buy by record, sell by survey and the difference is land you do not own'
          : 'record and survey agree',
        wide: true,
      },
    ];
  });

  readonly planning = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Current use', value: d.currentLandUse },
      { label: 'Intended use', value: d.intendedLandUse },
      {
        label: 'Maximum floor area ratio', value: d.maxFloorAreaRatio,
        hint: 'buildable area over plot area',
      },
      { label: 'Maximum coverage', value: d.maxCoveragePercent ? d.maxCoveragePercent + '%' : null },
      { label: 'Maximum height', value: d.maxHeightFt ? d.maxHeightFt + ' ft' : null },
    ];
  });

  readonly titleChain = computed<MiniRow[]>(() =>
    [...(this.data()?.titleChain ?? [])]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(t => ({
        id: t.id,
        title: (t.transferorName ?? 'Unknown') + ' → ' + (t.transfereeName ?? 'Unknown'),
        sub: TITLE_INSTRUMENT_LABELS[t.instrument]
          + (t.instrumentNumber ? ' ' + t.instrumentNumber : '')
          + (t.registrarOffice ? ' at ' + t.registrarOffice : ''),
        meta: new Date(t.instrumentDate).toLocaleDateString()
          + ' · ' + VERIFICATION_VERDICT_LABELS[t.verdict]
          + (t.verificationNote ? ' — ' + t.verificationNote : ''),
        value: t.consideration ? this.money(t.consideration) : null,
        tone: t.verdict === VerificationVerdict.Failed ? 'alert'
          : t.verdict === VerificationVerdict.Passed ? 'good' : 'warn',
        icon: 'link',
      })));

  readonly checks = computed<MiniRow[]>(() =>
    (this.data()?.verificationItems ?? []).map(v => ({
      id: v.id,
      title: v.label + (v.isMandatory ? '' : ' (optional)'),
      sub: v.findings ?? v.condition ?? null,
      meta: VERIFICATION_VERDICT_LABELS[v.verdict]
        + (v.assignedToName ? ' · ' + v.assignedToName : '')
        + (v.completedOn ? ' · done ' + new Date(v.completedOn).toLocaleDateString()
          : v.dueDate ? ' · due ' + new Date(v.dueDate).toLocaleDateString() : ''),
      tone: v.verdict === VerificationVerdict.Failed ? 'alert'
        : v.isOverdue ? 'warn'
        : v.verdict === VerificationVerdict.Passed ? 'good' : 'neutral',
      icon: v.verdict === VerificationVerdict.Passed ? 'check_circle'
        : v.verdict === VerificationVerdict.Failed ? 'cancel' : 'pending',
    })));

  readonly encumbrances = computed<MiniRow[]>(() =>
    (this.data()?.encumbrances ?? []).map(e => ({
      id: e.id,
      title: ENCUMBRANCE_KIND_LABELS[e.kind] + (e.holderName ? ' — ' + e.holderName : ''),
      sub: e.note ?? e.referenceNumber ?? null,
      meta: ENCUMBRANCE_STATUS_LABELS[e.status]
        + (e.expectedClearanceDate
          ? ', expected ' + new Date(e.expectedClearanceDate).toLocaleDateString() : ''),
      value: e.amount ? this.money(e.amount) : null,
      tone: e.blocksTransaction && e.status !== EncumbranceStatus.Cleared ? 'alert'
        : e.status === EncumbranceStatus.Cleared ? 'good' : 'warn',
      icon: e.blocksTransaction ? 'block' : 'info',
    })));

  readonly costLines = computed<MiniRow[]>(() =>
    (this.data()?.costLines ?? []).map(c => ({
      id: c.id,
      title: c.costType,
      sub: c.description ?? c.payeeName ?? null,
      meta: [
        c.reference,
        c.incurredOn ? new Date(c.incurredOn).toLocaleDateString() : null,
        c.isCapitalised ? 'capitalised' : 'expensed',
      ].filter(Boolean).join(' · '),
      value: this.money(c.actualAmount || c.budgetAmount),
      valueSub: c.variance
        ? (c.variance > 0 ? 'over by ' : 'under by ') + this.money(Math.abs(c.variance))
        : 'on budget',
      tone: c.variance > 0 ? 'warn' : 'neutral',
      icon: 'payments',
    })));

  readonly acquisitionFacts = computed<Fact[]>(() => {
    const a = this.data()?.acquisition;
    if (!a) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Reference', value: a.reference },
      { label: 'Seller', value: a.sellerName },
      { label: 'Stage', value: ACQUISITION_STAGE_KIND_LABELS[a.stage] },
      { label: 'In this stage', value: a.daysInStage + ' days' },
      { label: 'Started', value: on(a.startedOn) },
      { label: 'Target completion', value: on(a.targetCompletionDate) },
      { label: 'Completed', value: on(a.completedOn) },
      { label: 'Asking', value: this.money(a.askingPrice) },
      { label: 'Offered', value: this.money(a.offeredPrice) },
      { label: 'Agreed', value: this.money(a.agreedPrice), tone: 'positive' },
      { label: 'Advance paid', value: this.money(a.advancePaid) },
      { label: 'Total paid', value: this.money(a.totalPaid) },
      {
        label: 'Blocked by', value: a.blockingIssue,
        tone: 'danger', wide: true,
      },
    ];
  });

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

    const res = await firstValueFrom(this.properties.getParcel(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'project') {
      void this.router.navigate(['/realestate/projects'],
        { queryParams: { create: 1, parcelId: d.id } });
    } else if (key === 'edit') {
      void this.router.navigate(['/realestate/land/parcels'], { queryParams: { edit: d.id } });
    }
  }

  stageLabel(kind: M.AcquisitionStageDto['kind']): string {
    return ACQUISITION_STAGE_KIND_LABELS[kind] ?? '—';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toFixed(0);
  }
}
