import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BrokerageService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  COMMISSION_STATUS_LABELS, COMMISSION_TRIGGER_LABELS, DEAL_PARTY_ROLE_LABELS,
  DEAL_STATUS_LABELS, DealStatus, LISTING_KIND_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  PillComponent, ProgressComponent, TimelineComponent, ToastComponent, type TimelineItem,
} from '../shared/ui';

/* =====================================================================================
 * A deal.
 *
 * A sale or letting agreed between a buyer and a seller, from handshake to completion.
 *
 * Between those two points sits a conveyancing process that fails roughly a third of the time,
 * and it almost never fails suddenly. It stalls. So the screen leads with two things: how many
 * days since anything moved, and which single step everyone is waiting on. A deal where nothing
 * has happened for three weeks is the one to telephone about today.
 *
 * The commission calculation shows its working, line by line, because an agent whose fee is
 * wrong by fifty pounds will want to see exactly where the fifty pounds went.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-deal-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, TimelineComponent, ToastComponent,
  ],
  templateUrl: './deal-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './deal-detail.css',
  ],
})
export class DealDetailComponent implements OnInit {
  private brokerage = inject(BrokerageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.DealDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('progress');

  readonly blockingSteps = computed(() =>
    (this.data()?.checklist ?? []).filter(c => c.isBlocking && !c.isCompleted));

  readonly overdueSteps = computed(() =>
    (this.data()?.checklist ?? []).filter(c => c.isOverdue && !c.isCompleted));

  readonly unresponsive = computed(() =>
    (this.data()?.parties ?? []).filter(p => !p.isResponsive));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'progress', label: 'Progress', icon: 'checklist',
        count: this.overdueSteps().length,
        tone: this.overdueSteps().length ? 'danger' : 'neutral' },
      { key: 'parties', label: 'Who is involved', icon: 'group',
        count: this.unresponsive().length,
        tone: this.unresponsive().length ? 'warning' : 'neutral' },
      { key: 'chain', label: 'Chain', icon: 'link',
        count: d.chain?.linkCount ?? 0,
        tone: d.chainAtRisk ? 'danger' : 'neutral' },
      { key: 'conveyancing', label: 'Conveyancing', icon: 'gavel' },
      { key: 'commission', label: 'Commission', icon: 'percent' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: DEAL_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: LISTING_KIND_LABELS[d.kind] },
    ];

    if (d.isStalled) {
      pills.push({
        label: 'Stalled — ' + (d.daysSinceLastMilestone ?? 0) + ' days',
        tone: 'danger', icon: 'pause_circle',
      });
    }
    if (d.chainAtRisk) pills.push({ label: 'Chain at risk', tone: 'danger', icon: 'link_off' });
    if (d.depositReceived) pills.push({ label: 'Deposit held', tone: 'positive' });
    if (d.feeReceived) pills.push({ label: 'Fee received', tone: 'positive' });
    else if (d.feeInvoiced) pills.push({ label: 'Fee invoiced', tone: 'warning' });

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Agreed price', value: this.money(d.agreedPrice) },
      {
        label: 'Our fee', value: this.money(d.grossFee),
        hint: d.feePercent ? d.feePercent.toFixed(2) + '% plus tax' : null,
      },
      {
        label: 'Progress', value: d.completedSteps + ' of ' + d.totalSteps,
        hint: d.progressPercent.toFixed(0) + '% complete',
      },
      {
        label: 'Running', value: d.daysInProgress + ' days',
        hint: d.targetCompletionDate
          ? 'target ' + new Date(d.targetCompletionDate).toLocaleDateString()
          : 'no target set',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (d.listingId) actions.push({ key: 'listing', label: 'The listing', icon: 'storefront' });
    actions.push({ key: 'property', label: 'The property', icon: 'home_work' });

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Property', value: d.addressOneLine, wide: true },
      { label: 'Buyer', value: d.buyerName },
      { label: 'Seller', value: d.sellerName },
      { label: 'Listing agent', value: d.listingAgentName },
      { label: 'Selling agent', value: d.sellingAgentName },
      { label: 'Agreed', value: on(d.agreedOn) },
      { label: 'Target exchange', value: on(d.targetExchangeDate) },
      { label: 'Actual exchange', value: on(d.actualExchangeDate) },
      { label: 'Target completion', value: on(d.targetCompletionDate) },
      { label: 'Actual completion', value: on(d.actualCompletionDate) },
      { label: 'Deposit', value: this.money(d.depositAmount) },
      { label: 'Notes', value: d.notes, wide: true },
    ];
  });

  readonly feeFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Gross fee', value: this.money(d.grossFee) },
      { label: 'Rate', value: d.feePercent ? d.feePercent.toFixed(2) + '%' : null },
      { label: 'Tax on the fee', value: this.money(d.feeTax) },
      { label: 'Listing side', value: this.money(d.listingSideFee) },
      { label: 'Selling side', value: this.money(d.sellingSideFee) },
      {
        label: 'Invoiced', value: d.feeInvoiced ? 'Yes' : 'No',
        tone: d.feeInvoiced ? 'positive' : 'warning',
      },
      {
        label: 'Received', value: d.feeReceived ? 'Yes' : 'No',
        tone: d.feeReceived ? 'positive' : 'warning',
      },
    ];
  });

  readonly parties = computed<MiniRow[]>(() =>
    (this.data()?.parties ?? []).map(p => ({
      id: p.id ?? p.role + (p.contactName ?? ''),
      title: p.contactName ?? p.organisationName ?? DEAL_PARTY_ROLE_LABELS[p.role],
      sub: [
        DEAL_PARTY_ROLE_LABELS[p.role],
        p.organisationName !== p.contactName ? p.organisationName : null,
        p.phone,
        p.email,
      ].filter(Boolean).join(' · '),
      meta: p.lastContactedAt
        ? 'last spoken to ' + new Date(p.lastContactedAt).toLocaleDateString()
          + (p.daysSinceContact ? ' — ' + p.daysSinceContact + ' days ago' : '')
        : 'never contacted',
      valueSub: p.isResponsive ? null : 'not responding',
      tone: p.isResponsive ? 'neutral' : 'alert',
      icon: 'person',
    })));

  readonly milestones = computed<MiniRow[]>(() =>
    (this.data()?.milestones ?? []).map(m => ({
      id: m.id,
      title: m.name,
      sub: m.delayReason ?? null,
      meta: m.actualDate
        ? 'done ' + new Date(m.actualDate).toLocaleDateString()
        : (m.targetDate ? 'target ' + new Date(m.targetDate).toLocaleDateString() : null),
      value: m.varianceDays
        ? (m.varianceDays > 0 ? '+' : '') + m.varianceDays + ' days'
        : null,
      tone: (m.varianceDays ?? 0) > 0 ? 'warn' : m.actualDate ? 'good' : 'neutral',
      icon: m.actualDate ? 'check_circle' : 'flag',
    })));

  readonly chainLinks = computed<MiniRow[]>(() =>
    [...(this.data()?.chain?.links ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(l => ({
        id: l.id,
        title: l.position + '. '
          + (l.addressOneLine ?? l.externalDescription ?? 'Link in the chain'),
        sub: l.holdUpReason
          ?? [l.externalAgentName, l.solicitorName].filter(Boolean).join(' · ')
          ?? null,
        meta: DEAL_STATUS_LABELS[l.status]
          + (l.lastUpdatedAt
            ? ' · last moved ' + new Date(l.lastUpdatedAt).toLocaleDateString()
            : ' · never updated'),
        valueSub: l.isOurs ? 'this deal' : (l.externalAgentPhone ?? null),
        tone: l.isHoldingUpChain ? 'alert' : l.isOurs ? 'good' : 'neutral',
        icon: l.isHoldingUpChain ? 'pause_circle' : l.isOurs ? 'star' : 'link',
      })));

  readonly conveyancingFacts = computed<Fact[]>(() => {
    const c = this.data()?.conveyancing;
    if (!c) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Buyer’s solicitor', value: c.buyerSolicitorName },
      { label: 'Seller’s solicitor', value: c.sellerSolicitorName },
      { label: 'Draft deed', value: on(c.draftDeedOn) },
      { label: 'Deed approved', value: on(c.deedApprovedOn) },
      { label: 'Consideration', value: this.money(c.considerationValue) },
      {
        label: 'Government value', value: this.money(c.governmentValue),
        hint: 'duty is charged on the higher of the two',
      },
      {
        label: 'Stamp duty', value: this.money(c.stampDutyAmount),
        hint: c.stampDutyRate ? 'at ' + c.stampDutyRate + '%' : null,
      },
      { label: 'Registration fee', value: this.money(c.registrationFee) },
      { label: 'Withholding tax', value: this.money(c.withholdingTax) },
      { label: 'Other levies', value: this.money(c.otherLevies) },
      {
        label: 'Total transaction cost', value: this.money(c.totalTransactionCost),
        tone: 'warning', hint: 'over and above the price', wide: true,
      },
      { label: 'Registrar', value: c.registrarOffice },
      { label: 'Appointment', value: on(c.registrationAppointmentOn) },
      { label: 'Token', value: c.tokenNumber },
      { label: 'Registered', value: on(c.registeredOn) },
      { label: 'Deed number', value: c.deedNumber },
      { label: 'Mutation applied', value: on(c.mutationAppliedOn) },
      {
        label: 'Mutation complete', value: c.isMutationComplete ? 'Yes' : 'No',
        tone: c.isMutationComplete ? 'positive' : 'warning',
        hint: c.isMutationComplete
          ? null : 'registration alone does not change the revenue record',
      },
    ];
  });

  readonly commission = computed(() => this.data()?.commission ?? null);

  readonly commissionFacts = computed<Fact[]>(() => {
    const c = this.commission();
    if (!c) return [];

    return [
      { label: 'Reference', value: c.reference },
      { label: 'Status', value: COMMISSION_STATUS_LABELS[c.status] },
      { label: 'Earned when', value: COMMISSION_TRIGGER_LABELS[c.trigger] },
      { label: 'Transaction value', value: this.money(c.transactionValue) },
      { label: 'Gross fee', value: this.money(c.grossFee) },
      { label: 'Tax', value: this.money(c.taxOnFee) },
      { label: 'Deductions', value: this.money(c.totalDeductions) },
      {
        label: 'Net distributable', value: this.money(c.netDistributable),
        tone: 'positive', hint: 'what actually gets paid out',
      },
      {
        label: 'Collection at calculation',
        value: c.collectionPercentAtCalculation.toFixed(0) + '%',
        hint: 'how much of the price had been received',
      },
      {
        label: 'Earned on',
        value: c.earnedOn ? new Date(c.earnedOn).toLocaleDateString() : 'Not yet earned',
      },
      { label: 'Due', value: c.dueOn ? new Date(c.dueOn).toLocaleDateString() : null },
      { label: 'Disputed because', value: c.disputeNote, tone: 'danger', wide: true },
    ];
  });

  readonly splits = computed<MiniRow[]>(() =>
    (this.commission()?.splits ?? []).map(s => ({
      id: s.id,
      title: s.agentName ?? s.partnerName ?? s.teamName ?? s.referrerName ?? 'Recipient',
      sub: s.role + (s.tierApplied ? ' · tier ' + s.tierApplied : ''),
      meta: s.sharePercent.toFixed(2) + '% of ' + this.money(s.baseAmount)
        + (s.deductionTotal ? ' · less ' + this.money(s.deductionTotal) + ' deductions' : '')
        + (s.withholdingAmount ? ' · less ' + this.money(s.withholdingAmount) + ' withheld' : '')
        + (s.capReached ? ' · cap reached' : ''),
      value: this.money(s.netAmount),
      valueSub: s.paidAmount >= s.netAmount ? 'paid' : this.money(s.paidAmount) + ' paid',
      tone: s.capReached ? 'warn' : s.paidAmount >= s.netAmount ? 'good' : 'neutral',
      icon: 'person',
    })));

  readonly timeline = computed<TimelineItem[]>(() =>
    (this.data()?.timeline ?? []).map(t => ({
      id: t.id,
      occurredAt: t.occurredAt,
      kind: t.kind,
      title: t.title,
      detail: t.detail ?? null,
      icon: t.icon ?? null,
      tone: t.tone ?? null,
      actorName: t.actorName ?? null,
      amount: t.amount ?? null,
    })));

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

    const res = await firstValueFrom(this.brokerage.getDeal(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'listing' && d.listingId) {
      void this.router.navigate(['/realestate/listings', d.listingId]);
    } else if (key === 'property') {
      void this.router.navigate(['/realestate/properties', d.propertyId]);
    }
  }

  private statusTone(s: DealStatus): DetailPill['tone'] {
    if (s === DealStatus.Completed) return 'positive';
    if (s === DealStatus.FellThrough || s === DealStatus.Cancelled) return 'danger';
    if (s === DealStatus.OnHold) return 'warning';
    return 'neutral';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
