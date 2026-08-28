import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LeasingService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  COMPLIANCE_CERTIFICATE_KIND_LABELS, ESCALATION_KIND_LABELS, INSPECTION_KIND_LABELS,
  INSTALMENT_STATUS_LABELS, LEASE_OPTION_KIND_LABELS, MANAGEMENT_SERVICE_LABELS,
  REFERENCING_OUTCOME_LABELS, RENT_FREQUENCY_LABELS, TENANCY_KIND_LABELS,
  TENANCY_STATUS_LABELS, TenancyStatus, WORK_ORDER_STATUS_LABELS,
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
 * A tenancy.
 *
 * A lease on a property: who is in it, what they pay, what they have paid, what has been agreed
 * and what happens next.
 *
 * Three things are deliberately prominent because each of them is a legal exposure rather than
 * an operational inconvenience:
 *
 *   - Deposit registration. In several markets, failing to protect a deposit within the statutory
 *     window costs a multiple of the deposit and blocks possession proceedings. The countdown is
 *     shown before the deadline, not after.
 *   - Compliance certificates. Letting without a current gas or electrical certificate is an
 *     offence in most jurisdictions, so an expired one is red rather than filed.
 *   - Critical dates. Break clauses and option windows open and close. A missed break notice
 *     commits a landlord to years of rent they had planned to escape.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-tenancy-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    TimelineComponent, ToastComponent,
  ],
  templateUrl: './tenancy-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './tenancy-detail.css',
  ],
})
export class TenancyDetailComponent implements OnInit {
  private leasing = inject(LeasingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.TenancyDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly expiredCertificates = computed(() =>
    (this.data()?.certificates ?? []).filter(c => c.isExpired));

  readonly openCriticalDates = computed(() =>
    (this.data()?.criticalDates ?? []).filter(c => !c.isActioned));

  readonly depositAtRisk = computed(() => {
    const dep = this.data()?.deposit;
    return !!dep && !dep.isRegistered;
  });

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'real_estate_agent' },
      { key: 'rent', label: 'Rent', icon: 'payments',
        count: d.rentCharges.filter(r => r.daysOverdue > 0).length,
        tone: d.arrearsAmount > 0 ? 'danger' : 'neutral' },
      { key: 'terms', label: 'Terms', icon: 'gavel' },
      { key: 'deposit', label: 'Deposit', icon: 'savings',
        count: this.depositAtRisk() ? 1 : 0,
        tone: this.depositAtRisk() ? 'danger' : 'neutral' },
      { key: 'dates', label: 'Critical dates', icon: 'event',
        count: this.openCriticalDates().length,
        tone: this.openCriticalDates().some(c => c.isOverdue) ? 'danger' : 'warning' },
      { key: 'condition', label: 'Condition', icon: 'photo_camera',
        count: d.inspections.length + d.workOrders.length },
      { key: 'compliance', label: 'Compliance', icon: 'verified',
        count: this.expiredCertificates().length,
        tone: this.expiredCertificates().length ? 'danger' : 'neutral' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: TENANCY_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: TENANCY_KIND_LABELS[d.kind] },
      { label: MANAGEMENT_SERVICE_LABELS[d.managementService] },
    ];

    if (d.arrearsAmount > 0) {
      pills.push({
        label: this.money(d.arrearsAmount) + ' in arrears',
        tone: 'danger', icon: 'money_off',
      });
    }
    if (d.depositRegistrationOverdue) {
      pills.push({ label: 'Deposit unprotected', tone: 'danger', icon: 'gpp_bad' });
    }
    if (d.isExpiringSoon) {
      pills.push({
        label: 'Expires in ' + (d.daysToExpiry ?? 0) + ' days',
        tone: 'warning', icon: 'event_busy',
      });
    }
    if (d.rollsToPeriodic) pills.push({ label: 'Rolls to periodic', tone: 'muted' });
    if (d.turnoverRentApplies) pills.push({ label: 'Turnover rent', tone: 'accent' });
    if (!d.isRegistered) pills.push({ label: 'Not registered', tone: 'warning' });

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Rent', value: this.money(d.rent),
        hint: RENT_FREQUENCY_LABELS[d.frequency]
          + (d.annualRent ? ' · ' + this.money(d.annualRent) + ' a year' : ''),
      },
      {
        label: 'Paid', value: this.money(d.totalPaid),
        hint: this.money(d.totalCharged) + ' charged',
      },
      {
        label: 'Arrears', value: this.money(d.arrearsAmount),
        hint: d.arrearsAmount > 0
          ? d.monthsInArrears.toFixed(1) + ' months, ' + d.daysInArrears + ' days'
          : 'up to date',
      },
      {
        label: 'Ends',
        value: d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Periodic',
        hint: d.daysToExpiry !== undefined ? d.daysToExpiry + ' days' : null,
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (d.status === TenancyStatus.Active) {
      actions.push({ key: 'renew', label: 'Offer a renewal', icon: 'autorenew', tone: 'primary' });
      actions.push({ key: 'notice', label: 'Serve notice', icon: 'gavel' });
    }

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
      { label: 'Unit', value: d.unitNumber },
      { label: 'Building', value: d.buildingName },
      { label: 'Area', value: d.area?.displayText },
      { label: 'Tenant', value: d.tenantName },
      { label: 'Phone', value: d.tenantPhone },
      { label: 'Landlord', value: d.landlordName },
      { label: 'Managed by', value: d.managedByName },
      { label: 'Starts', value: on(d.startDate) },
      { label: 'Ends', value: on(d.endDate) },
      { label: 'Actually ended', value: on(d.actualEndDate) },
      { label: 'Term', value: d.termMonths ? d.termMonths + ' months' : null },
      { label: 'Signed', value: on(d.signedOn) },
      {
        label: 'Registered', value: d.isRegistered ? d.registrationNumber ?? 'Yes' : 'No',
        tone: d.isRegistered ? 'positive' : 'warning',
      },
      { label: 'Permitted use', value: d.permittedUse, wide: true },
      { label: 'Notes', value: d.notes, wide: true },
    ];
  });

  readonly rentTerms = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Rent', value: this.money(d.rent), hint: RENT_FREQUENCY_LABELS[d.frequency] },
      { label: 'Annual', value: this.money(d.annualRent) },
      { label: 'Per sq ft', value: d.rentPerSqFt ? this.money(d.rentPerSqFt) : null },
      {
        label: 'Payment day', value: d.paymentDay,
        hint: d.paidInAdvance ? 'paid in advance' : 'paid in arrears',
      },
      { label: 'Advance rent held', value: d.advanceRentMonths + ' months' },
      { label: 'Escalation', value: ESCALATION_KIND_LABELS[d.escalation] },
      {
        label: 'Escalation rate',
        value: d.escalationPercent ? d.escalationPercent.toFixed(2) + '%' : null,
        hint: d.escalationMonths ? 'every ' + d.escalationMonths + ' months' : null,
      },
      {
        label: 'Next escalation',
        value: d.nextEscalationDate ? new Date(d.nextEscalationDate).toLocaleDateString() : null,
      },
      { label: 'Management fee', value: d.managementFeePercent.toFixed(2) + '%' },
      { label: 'Deposit', value: this.money(d.depositAmount) },
    ];
  });

  readonly obligations = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Service charge applies', value: d.serviceChargeApplies ? 'Yes' : 'No' },
      {
        label: 'Service charge share',
        value: d.serviceChargePercent ? d.serviceChargePercent.toFixed(3) + '%' : null,
      },
      { label: 'Utilities recharged', value: d.utilitiesRecharged ? 'Yes' : 'No' },
      { label: 'Property tax recharged', value: d.propertyTaxRecharged ? 'Yes' : 'No' },
      { label: 'Insurance recharged', value: d.insuranceRecharged ? 'Yes' : 'No' },
      {
        label: 'Repair authority', value: this.money(d.repairAuthorityLimit),
        hint: 'what we may spend without asking the landlord',
      },
      { label: 'Pets', value: d.petsAllowed ? 'Allowed' : 'Not allowed' },
      { label: 'Smoking', value: d.smokingAllowed ? 'Allowed' : 'Not allowed' },
      { label: 'Subletting', value: d.sublettingAllowed ? 'Allowed' : 'Not allowed' },
      { label: 'Maximum occupants', value: d.maxOccupants },
      { label: 'Tenant’s notice', value: d.noticePeriodDaysTenant + ' days' },
      { label: 'Landlord’s notice', value: d.noticePeriodDaysLandlord + ' days' },
    ];
  });

  readonly parties = computed<MiniRow[]>(() =>
    (this.data()?.parties ?? []).map(p => ({
      id: p.id ?? p.partyId,
      title: p.name + (p.isLeadTenant ? ' (lead)' : ''),
      sub: [p.role, p.phone, p.email].filter(Boolean).join(' · ') || null,
      meta: (p.isJointlyAndSeverallyLiable
        ? 'jointly and severally liable' : 'liable for their share')
        + (p.referencingOutcome !== undefined
          ? ' · referencing ' + REFERENCING_OUTCOME_LABELS[p.referencingOutcome].toLowerCase()
          : ''),
      value: p.liabilitySharePercent ? p.liabilitySharePercent.toFixed(0) + '%' : null,
      icon: 'person',
    })));

  readonly rentCharges = computed(() => this.data()?.rentCharges ?? []);

  readonly recoveries = computed<MiniRow[]>(() =>
    (this.data()?.recoveries ?? []).map(r => ({
      id: r.id ?? r.label,
      title: r.label,
      sub: r.chargeType,
      meta: RENT_FREQUENCY_LABELS[r.frequency]
        + ' · from ' + new Date(r.effectiveFrom).toLocaleDateString()
        + (r.includeInRentRun ? ' · billed with the rent' : ' · billed separately'),
      value: this.money(r.amount),
      valueSub: r.isTaxable ? 'plus ' + r.taxPercent + '% tax' : null,
      tone: r.isActive ? 'neutral' : 'warn',
      icon: 'receipt',
    })));

  readonly escalations = computed<MiniRow[]>(() =>
    (this.data()?.escalations ?? []).map(e => ({
      id: e.id ?? String(e.sortOrder),
      title: ESCALATION_KIND_LABELS[e.kind]
        + (e.percent ? ' — ' + e.percent.toFixed(2) + '%' : '')
        + (e.indexName ? ' on ' + e.indexName : ''),
      sub: [
        'from ' + new Date(e.effectiveFrom).toLocaleDateString(),
        'every ' + e.intervalMonths + ' months',
        e.isCompounding ? 'compounding' : 'simple',
        e.floorPercent !== undefined ? 'floor ' + e.floorPercent + '%' : null,
        e.capPercent !== undefined ? 'cap ' + e.capPercent + '%' : null,
      ].filter(Boolean).join(' · '),
      meta: e.isApplied && e.appliedOn
        ? 'applied ' + new Date(e.appliedOn).toLocaleDateString() : 'not yet applied',
      value: e.resultingRent ? this.money(e.resultingRent) : null,
      valueSub: e.resultingRent ? 'resulting rent' : null,
      tone: e.isApplied ? 'good' : 'neutral',
      icon: 'trending_up',
    })));

  readonly options = computed<MiniRow[]>(() =>
    (this.data()?.options ?? []).map(o => ({
      id: o.id ?? o.kind + o.optionDate,
      title: LEASE_OPTION_KIND_LABELS[o.kind] + ' — held by the ' + o.heldBy.toLowerCase(),
      sub: o.conditions ?? null,
      meta: 'option date ' + new Date(o.optionDate).toLocaleDateString()
        + ' · notice between ' + new Date(o.noticeWindowFrom).toLocaleDateString()
        + ' and ' + new Date(o.noticeWindowTo).toLocaleDateString()
        + ' (' + o.noticeMonths + ' months)',
      value: o.optionPrice ? this.money(o.optionPrice) : null,
      valueSub: o.isExercised ? 'exercised'
        : o.isLapsed ? 'lapsed'
        : o.isWindowOpen ? 'window open — ' + (o.daysToWindowClose ?? 0) + ' days left'
        : 'window not yet open',
      tone: o.isWindowOpen ? 'warn' : o.isLapsed ? 'alert' : 'neutral',
      icon: 'flag',
    })));

  readonly criticalDates = computed<MiniRow[]>(() =>
    (this.data()?.criticalDates ?? []).map(c => ({
      id: c.id,
      title: c.title,
      sub: c.note ?? c.dateType,
      meta: new Date(c.dueDate).toLocaleDateString()
        + (c.isActioned ? ' · actioned'
          : c.isOverdue ? ' · overdue' : ' · in ' + c.daysToDue + ' days')
        + (c.ownerName ? ' · ' + c.ownerName : ''),
      tone: c.isActioned ? 'good' : c.isOverdue ? 'alert'
        : c.daysToDue < 30 ? 'warn' : 'neutral',
      icon: 'event',
    })));

  readonly inspections = computed<MiniRow[]>(() =>
    (this.data()?.inspections ?? []).map(i => ({
      id: i.id,
      title: INSPECTION_KIND_LABELS[i.kind],
      sub: [i.overallCondition, i.cleanlinessRating].filter(Boolean).join(' · ') || null,
      meta: new Date(i.inspectedAt).toLocaleDateString()
        + (i.inspectorName ? ' · ' + i.inspectorName : '')
        + (i.tenantPresent ? ' · tenant present' : ' · tenant absent'),
      icon: 'photo_camera',
    })));

  readonly workOrders = computed<MiniRow[]>(() =>
    (this.data()?.workOrders ?? []).map(w => ({
      id: w.id,
      title: w.title,
      sub: [w.orderNumber, w.trade, w.contractorName].filter(Boolean).join(' · ') || null,
      meta: WORK_ORDER_STATUS_LABELS[w.status]
        + ' · raised ' + new Date(w.raisedAt).toLocaleDateString()
        + (w.slaBreached ? ' · past the promised response' : ''),
      value: this.money(w.totalCost || w.estimatedCost),
      tone: w.slaBreached ? 'alert' : 'neutral',
      icon: 'build',
    })));

  readonly certificates = computed<MiniRow[]>(() =>
    (this.data()?.certificates ?? []).map(c => ({
      id: c.id,
      title: COMPLIANCE_CERTIFICATE_KIND_LABELS[c.kind],
      sub: [c.issuerName, c.certificateNumber].filter(Boolean).join(' · ') || null,
      meta: 'expires ' + new Date(c.expiresOn).toLocaleDateString()
        + (c.isExpired ? ' — expired' : ' — ' + c.daysToExpiry + ' days')
        + (c.servedToTenant ? ' · served to the tenant' : ' · not served'),
      valueSub: c.hasFailures ? 'has failures' : null,
      tone: c.isExpired || c.hasFailures ? 'alert' : c.isExpiringSoon ? 'warn' : 'good',
      icon: 'verified',
    })));

  readonly depositFacts = computed<Fact[]>(() => {
    const dep = this.data()?.deposit;
    if (!dep) return [];

    return [
      { label: 'Amount', value: this.money(dep.amount) },
      { label: 'Received', value: new Date(dep.receivedOn).toLocaleDateString() },
      { label: 'Scheme', value: dep.schemeName },
      { label: 'Reference', value: dep.registrationReference },
      {
        label: 'Registered',
        value: dep.registeredOn ? new Date(dep.registeredOn).toLocaleDateString() : 'Not yet',
        tone: dep.isRegistered ? 'positive' : 'danger',
      },
      {
        label: 'Deadline',
        value: dep.registrationDeadline
          ? new Date(dep.registrationDeadline).toLocaleDateString() : null,
        tone: dep.registrationOverdue ? 'danger' : 'warning',
        hint: dep.daysToRegistrationDeadline !== undefined && !dep.isRegistered
          ? dep.daysToRegistrationDeadline + ' days left'
          : null,
      },
      {
        label: 'Prescribed information served',
        value: dep.prescribedInformationServed ? 'Yes' : 'No',
        tone: dep.prescribedInformationServed ? 'positive' : 'danger',
        hint: dep.prescribedInformationServed
          ? null : 'registering without serving it carries the same penalty',
      },
      { label: 'Deductions proposed', value: this.money(dep.deductionTotal) },
      { label: 'Returned to tenant', value: this.money(dep.returnedToTenant) },
      { label: 'Paid to landlord', value: this.money(dep.paidToLandlord) },
      {
        label: 'Disputed', value: dep.isDisputed ? dep.disputeReference ?? 'Yes' : 'No',
        tone: dep.isDisputed ? 'danger' : 'neutral',
        hint: dep.disputeOutcome, wide: true,
      },
    ];
  });

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

    const res = await firstValueFrom(this.leasing.getTenancy(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'renew') {
      void this.router.navigate(['/realestate/leasing/renewals'], { queryParams: { tenancyId: d.id } });
    } else if (key === 'notice') {
      void this.router.navigate(['/realestate/leasing/critical-dates'], { queryParams: { tenancyId: d.id } });
    } else if (key === 'property') {
      void this.router.navigate(['/realestate/properties', d.propertyId]);
    }
  }

  referencingLabel(o: M.ReferencingCaseDto['outcome']): string {
    return REFERENCING_OUTCOME_LABELS[o] ?? '—';
  }

  chargeClass(c: M.RentChargeDto): string {
    if (c.daysOverdue > 0) return 'is-overdue';
    if (c.balance === 0) return 'is-paid';
    return c.dueDate && new Date(c.dueDate) <= new Date() ? 'is-due' : '';
  }

  chargeStatus(c: M.RentChargeDto): string {
    if (c.isRentFree) return 'Rent free';
    if (c.daysOverdue > 0) return c.daysOverdue + ' days overdue';
    return INSTALMENT_STATUS_LABELS[c.status];
  }

  private statusTone(s: TenancyStatus): DetailPill['tone'] {
    if (s === TenancyStatus.Active) return 'positive';
    if (s === TenancyStatus.Ended || s === TenancyStatus.Terminated) return 'neutral';
    return 'warning';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
