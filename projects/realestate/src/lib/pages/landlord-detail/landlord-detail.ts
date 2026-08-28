import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LeasingService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  MANAGEMENT_SERVICE_LABELS, NOTIFICATION_CHANNEL_LABELS, PROPERTY_STATUS_LABELS,
  TENANCY_STATUS_LABELS, WORK_ORDER_STATUS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  TimelineComponent, ToastComponent, type TimelineItem,
} from '../shared/ui';

/* =====================================================================================
 * A landlord.
 *
 * Somebody whose property we manage, and the money we hold on their behalf.
 *
 * That last part is the reason this screen is careful. Rent collected for a landlord is client
 * money: it is theirs, held in a designated account, and the balance shown here is a liability
 * rather than income. So the screen distinguishes what has been collected from what is payable
 * after fees, deductions, tax withholding and the float that has to stay behind.
 *
 * Payouts on hold are stated at the top with the reason, because a landlord telephoning about a
 * missing payment should get an answer in one sentence.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-landlord-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    TimelineComponent, ToastComponent,
  ],
  templateUrl: './landlord-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './landlord-detail.css',
  ],
})
export class LandlordDetailComponent implements OnInit {
  private leasing = inject(LeasingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.LandlordDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'person' },
      { key: 'portfolio', label: 'Portfolio', icon: 'home_work',
        count: d.properties.length + d.tenancies.length },
      { key: 'money', label: 'Money', icon: 'payments',
        count: d.arrearsOnPortfolio > 0 ? 1 : 0,
        tone: d.arrearsOnPortfolio > 0 ? 'danger' : 'neutral' },
      { key: 'statements', label: 'Statements', icon: 'summarize', count: d.statements.length },
      { key: 'agreements', label: 'Agreements', icon: 'gavel', count: d.agreements.length },
      { key: 'repairs', label: 'Repairs', icon: 'build', count: d.workOrders.length },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: MANAGEMENT_SERVICE_LABELS[d.defaultService] },
    ];

    if (d.payoutsOnHold) {
      pills.push({ label: 'Payouts on hold', tone: 'danger', icon: 'pause_circle' });
    }
    if (d.isNonResident) {
      pills.push({
        label: 'Non-resident — ' + d.withholdingPercent.toFixed(1) + '% withheld',
        tone: 'warning', icon: 'public',
      });
    }
    if (d.arrearsOnPortfolio > 0) {
      pills.push({
        label: this.money(d.arrearsOnPortfolio) + ' in arrears',
        tone: 'danger', icon: 'money_off',
      });
    }
    if (d.openComplianceIssues > 0) {
      pills.push({
        label: d.openComplianceIssues + ' compliance issues',
        tone: 'danger', icon: 'verified',
      });
    }
    if (d.portalAccessEnabled) pills.push({ label: 'Has portal access', tone: 'muted' });

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Portfolio', value: d.propertyCount + ' properties',
        hint: d.tenancyCount + ' let',
      },
      {
        label: 'Rent roll', value: this.money(d.monthlyRent), hint: 'a month, contracted',
      },
      {
        label: 'Collected', value: this.money(d.totalRentCollected), hint: 'to date',
      },
      {
        label: 'We hold', value: this.money(d.currentBalance),
        hint: 'client money, owed to them',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        key: 'statement', label: 'Generate a statement', icon: 'summarize', tone: 'primary',
        disabled: d.payoutsOnHold,
        reason: d.payoutsOnHold
          ? 'Payouts are on hold' + (d.holdReason ? ': ' + d.holdReason : '') + '.' : null,
      },
      { key: 'portal', label: 'Their portal view', icon: 'open_in_new' },
    ];
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Name', value: d.name },
      { label: 'Phone', value: d.phone },
      { label: 'Email', value: d.email },
      { label: 'Managed by', value: d.managedByName },
      { label: 'Default service', value: MANAGEMENT_SERVICE_LABELS[d.defaultService] },
      { label: 'Default fee', value: d.defaultFeePercent.toFixed(2) + '%' },
      {
        label: 'Repair authority', value: this.money(d.repairAuthorityLimit),
        hint: 'what we may spend without asking',
      },
      { label: 'Statements go by', value: NOTIFICATION_CHANNEL_LABELS[d.statementChannel] },
      { label: 'Portal access', value: d.portalAccessEnabled ? 'Enabled' : 'Not enabled' },
      { label: 'Notes', value: d.notes, wide: true },
    ];
  });

  readonly payoutFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Frequency', value: d.payoutFrequency },
      { label: 'Payout day', value: d.payoutDay },
      { label: 'Bank', value: d.bankName },
      { label: 'Account title', value: d.accountTitle },
      { label: 'Account number', value: d.accountNumber },
      { label: 'Sort code or IBAN', value: d.sortCodeOrIban },
      {
        label: 'Verified', value: d.bankDetailsVerified ? 'Yes' : 'No',
        tone: d.bankDetailsVerified ? 'positive' : 'danger',
        hint: d.bankDetailsVerified
          ? null : 'nothing should be paid out until these are checked against a document',
      },
      {
        label: 'Float required', value: this.money(d.floatRequired),
        hint: 'kept back for repairs between payouts',
      },
      {
        label: 'Float held', value: this.money(d.floatBalance),
        tone: d.floatBalance < d.floatRequired ? 'warning' : 'positive',
      },
      {
        label: 'Withholding', value: d.withholdingPercent.toFixed(2) + '%',
        hint: d.isNonResident ? 'non-resident landlord scheme' : null,
      },
      { label: 'Tax exemption', value: d.taxExemptionReference },
      {
        label: 'Exemption valid until',
        value: d.exemptionValidUntil
          ? new Date(d.exemptionValidUntil).toLocaleDateString() : null,
        tone: d.exemptionValidUntil && new Date(d.exemptionValidUntil) < new Date()
          ? 'danger' : 'neutral',
      },
      {
        label: 'Payouts on hold', value: d.payoutsOnHold ? 'Yes' : 'No',
        tone: d.payoutsOnHold ? 'danger' : 'positive',
        hint: d.holdReason, wide: true,
      },
    ];
  });

  readonly moneyFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Contracted rent', value: this.money(d.monthlyRent), hint: 'a month' },
      { label: 'Collected to date', value: this.money(d.totalRentCollected), tone: 'positive' },
      {
        label: 'Arrears on the portfolio', value: this.money(d.arrearsOnPortfolio),
        tone: d.arrearsOnPortfolio > 0 ? 'danger' : 'positive',
      },
      {
        label: 'Balance we hold', value: this.money(d.currentBalance),
        hint: 'their money, in a client account',
      },
    ];
  });

  readonly properties = computed<MiniRow[]>(() =>
    (this.data()?.properties ?? []).map(p => ({
      id: p.id,
      title: p.addressOneLine,
      sub: [p.reference, p.subTypeLabel].filter(Boolean).join(' · '),
      meta: PROPERTY_STATUS_LABELS[p.status],
      value: p.monthlyRent ? this.money(p.monthlyRent) : null,
      valueSub: p.monthlyRent ? 'a month' : null,
      icon: 'home_work',
    })));

  readonly tenancies = computed<MiniRow[]>(() =>
    (this.data()?.tenancies ?? []).map(t => ({
      id: t.id,
      title: t.tenantName,
      sub: t.addressOneLine,
      meta: TENANCY_STATUS_LABELS[t.status]
        + ' · to ' + (t.endDate ? new Date(t.endDate).toLocaleDateString() : 'periodic')
        + (t.isExpiringSoon ? ' — expiring soon' : ''),
      value: this.money(t.rent),
      valueSub: t.arrearsAmount > 0 ? this.money(t.arrearsAmount) + ' arrears' : 'up to date',
      tone: t.arrearsAmount > 0 ? 'alert' : t.isExpiringSoon ? 'warn' : 'neutral',
      icon: 'real_estate_agent',
    })));

  readonly statements = computed<MiniRow[]>(() =>
    (this.data()?.statements ?? []).map(s => ({
      id: s.id,
      title: s.reference,
      sub: new Date(s.periodFrom).toLocaleDateString()
        + ' to ' + new Date(s.periodTo).toLocaleDateString()
        + (s.addressOneLine ? ' · ' + s.addressOneLine : ''),
      meta: 'collected ' + this.money(s.rentCollected)
        + ' · fee ' + this.money(s.managementFee)
        + ' · repairs ' + this.money(s.maintenanceCost)
        + (s.taxWithheld ? ' · withheld ' + this.money(s.taxWithheld) : '')
        + (s.isSent ? ' · sent' : ' · not sent'),
      value: this.money(s.netPayable),
      valueSub: 'paid out',
      tone: s.isSent ? 'good' : 'neutral',
      icon: 'summarize',
    })));

  readonly agreements = computed<MiniRow[]>(() =>
    (this.data()?.agreements ?? []).map(a => ({
      id: a.id,
      title: a.addressOneLine ?? a.reference,
      sub: MANAGEMENT_SERVICE_LABELS[a.service]
        + ' at ' + (a.feePercent ? a.feePercent.toFixed(2) + '%'
          : this.money(a.fixedMonthlyFee) + ' a month'),
      meta: 'from ' + new Date(a.startDate).toLocaleDateString()
        + (a.endDate ? ' to ' + new Date(a.endDate).toLocaleDateString() : '')
        + ' · ' + a.noticePeriodDays + ' days notice'
        + (a.canSignTenancyOnBehalf ? ' · may sign tenancies' : '')
        + (a.holdsDeposit ? ' · we hold the deposit' : ' · landlord holds the deposit'),
      value: this.money(a.repairAuthorityLimit),
      valueSub: 'repair authority',
      tone: a.isActive ? 'good' : 'neutral',
      icon: 'gavel',
    })));

  readonly workOrders = computed<MiniRow[]>(() =>
    (this.data()?.workOrders ?? []).map(w => ({
      id: w.id,
      title: w.title,
      sub: [w.orderNumber, w.addressOneLine, w.contractorName].filter(Boolean).join(' · '),
      meta: WORK_ORDER_STATUS_LABELS[w.status]
        + ' · raised ' + new Date(w.raisedAt).toLocaleDateString()
        + (w.requiresAuthorisation && !w.isAuthorised ? ' · awaiting the landlord' : ''),
      value: this.money(w.totalCost || w.estimatedCost),
      tone: w.requiresAuthorisation && !w.isAuthorised ? 'warn'
        : w.slaBreached ? 'alert' : 'neutral',
      icon: 'build',
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

    const res = await firstValueFrom(this.leasing.getLandlord(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'statement') void this.generateStatement();
    else if (key === 'portal') {
      void this.router.navigate(['/realestate/portal-users'], { queryParams: { landlordId: d.id } });
    }
  }

  private async generateStatement(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.leasing.generateStatement(d.id)).catch(() => null);

    if (res?.data) {
      this.toast.set('Statement ' + res.data.reference + ' generated, '
        + this.money(res.data.netPayable) + ' payable.');
      await this.load();
    } else {
      this.toast.set('The statement could not be generated.');
    }
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
