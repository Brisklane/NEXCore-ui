import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CrmService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  ACTIVITY_KIND_LABELS, BOOKING_STATUS_LABELS, IDENTITY_KIND_LABELS, KYC_STATUS_LABELS,
  KycStatus, NOTIFICATION_CHANNEL_LABELS, PARTY_KIND_LABELS, PARTY_ROLE_KIND_LABELS,
  RISK_RATING_LABELS, RiskRating, TENANCY_STATUS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import { TimelineComponent, ToastComponent, type TimelineItem } from '../shared/ui';

/* =====================================================================================
 * A contact.
 *
 * One person or organisation, and everything the business has ever done with them: enquiries,
 * bookings, tenancies, property they own, money they owe.
 *
 * Two things are pulled to the top rather than filed on a tab. A caution entry, because a person
 * on the caution list should not be quietly sold to. And their money position, because the second
 * question anybody asks about a customer is whether they pay.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-contact-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    TimelineComponent, ToastComponent,
  ],
  templateUrl: './contact-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './contact-detail.css',
  ],
})
export class ContactDetailComponent implements OnInit {
  private crm = inject(CrmService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.PartyDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly activeCautions = computed(() =>
    (this.data()?.cautions ?? []).filter(c => c.isActive));

  readonly blockingCautions = computed(() =>
    this.activeCautions().filter(c => c.blocksNewBusiness));

  readonly expiredIdentities = computed(() =>
    (this.data()?.identities ?? []).filter(i => i.isExpired));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'person' },
      { key: 'contact', label: 'How to reach them', icon: 'contacts',
        count: d.contacts.length + d.addresses.length },
      { key: 'identity', label: 'Identity and KYC', icon: 'badge',
        count: this.expiredIdentities().length,
        tone: this.expiredIdentities().length ? 'danger' : 'neutral' },
      { key: 'business', label: 'Business', icon: 'work',
        count: d.bookings.length + d.tenancies.length + d.enquiries.length },
      { key: 'money', label: 'Money', icon: 'payments',
        count: d.money.overdueAmount > 0 ? 1 : 0,
        tone: d.money.overdueAmount > 0 ? 'danger' : 'neutral' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PARTY_KIND_LABELS[d.kind] },
      {
        label: 'KYC ' + KYC_STATUS_LABELS[d.kycStatus].toLowerCase(),
        tone: d.kycStatus === KycStatus.Verified ? 'positive' : 'warning',
        icon: 'badge',
      },
    ];

    if (d.riskRating === RiskRating.High) {
      pills.push({ label: 'High risk', tone: 'danger', icon: 'warning' });
    }
    if (d.isPoliticallyExposed) {
      pills.push({ label: 'Politically exposed', tone: 'warning', icon: 'gavel' });
    }
    if (this.blockingCautions().length) {
      pills.push({ label: 'No new business', tone: 'danger', icon: 'block' });
    } else if (this.activeCautions().length) {
      pills.push({ label: 'On the caution list', tone: 'warning', icon: 'flag' });
    }
    if (d.money.isDefaulter) {
      pills.push({ label: 'In default', tone: 'danger', icon: 'money_off' });
    }

    for (const role of d.roles.filter(r => r.isActive)) {
      pills.push({ label: PARTY_ROLE_KIND_LABELS[role.kind], tone: 'muted' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const m = this.data()?.money;
    if (!m) return [];

    const figures: DetailFigure[] = [];

    if (m.totalInvested > 0) {
      figures.push({
        label: 'Bought', value: this.money(m.totalInvested),
        hint: this.money(m.totalPaid) + ' paid',
      });
    }
    if (m.totalOutstanding > 0) {
      figures.push({
        label: 'Owes', value: this.money(m.totalOutstanding),
        hint: m.overdueAmount > 0 ? this.money(m.overdueAmount) + ' overdue' : 'none overdue',
      });
    }
    if (m.rentArrears > 0) {
      figures.push({ label: 'Rent arrears', value: this.money(m.rentArrears) });
    }
    if (m.nextDueAmount > 0) {
      figures.push({
        label: 'Next due', value: this.money(m.nextDueAmount),
        hint: m.nextDueDate ? new Date(m.nextDueDate).toLocaleDateString() : null,
      });
    }

    return figures.slice(0, 4);
  });

  readonly actions = computed<DetailAction[]>(() => {
    const blocked = this.blockingCautions().length > 0;

    return [
      {
        key: 'enquiry', label: 'Log an enquiry', icon: 'add_comment', tone: 'primary',
        disabled: blocked,
        reason: blocked ? 'This contact is on the caution list and blocked for new business.' : null,
      },
      { key: 'kyc', label: 'KYC', icon: 'badge' },
      { key: 'call', label: 'Call', icon: 'call' },
    ];
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly personal = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Type', value: PARTY_KIND_LABELS[d.kind] },
      { label: 'Guardian', value: d.fatherOrGuardianName },
      {
        label: 'Date of birth',
        value: d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString() : null,
      },
      { label: 'Nationality', value: d.nationality },
      { label: 'Residency', value: d.residencyStatus },
      { label: 'Occupation', value: d.occupation },
      { label: 'Employer', value: d.employer },
      { label: 'Organisation', value: d.organisationName },
      { label: 'Trading as', value: d.tradingName },
      { label: 'Registration', value: d.registrationNumber },
      { label: 'Tax number', value: d.taxNumber },
      { label: 'Industry', value: d.industry },
      { label: 'Owned by', value: d.ownerAgentName, hint: 'the agent responsible' },
      { label: 'Prefers', value: NOTIFICATION_CHANNEL_LABELS[d.preferredChannel] },
      { label: 'Language', value: d.preferredLanguage },
    ];
  });

  readonly kyc = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Status', value: KYC_STATUS_LABELS[d.kycStatus],
        tone: d.kycStatus === KycStatus.Verified ? 'positive' : 'warning',
      },
      { label: 'Risk rating', value: RISK_RATING_LABELS[d.riskRating] },
      {
        label: 'Verified on',
        value: d.kycVerifiedOn ? new Date(d.kycVerifiedOn).toLocaleDateString() : null,
      },
      {
        label: 'Expires',
        value: d.kycExpiresOn ? new Date(d.kycExpiresOn).toLocaleDateString() : null,
        tone: d.kycExpiresOn && new Date(d.kycExpiresOn) < new Date() ? 'danger' : 'neutral',
      },
      { label: 'Politically exposed', value: d.isPoliticallyExposed ? 'Yes' : 'No' },
    ];
  });

  readonly moneyFacts = computed<Fact[]>(() => {
    const m = this.data()?.money;
    if (!m) return [];

    return [
      { label: 'Total bought', value: this.money(m.totalInvested) },
      { label: 'Paid', value: this.money(m.totalPaid), tone: 'positive' },
      {
        label: 'Outstanding', value: this.money(m.totalOutstanding),
        tone: m.totalOutstanding > 0 ? 'warning' : 'positive',
      },
      {
        label: 'Overdue', value: this.money(m.overdueAmount),
        tone: m.overdueAmount > 0 ? 'danger' : 'positive',
        hint: m.daysOverdue ? m.daysOverdue + ' days' : null,
      },
      { label: 'Surcharge accrued', value: this.money(m.surchargeAccrued) },
      { label: 'Rent paid this year', value: this.money(m.rentPaidThisYear) },
      {
        label: 'Rent arrears', value: this.money(m.rentArrears),
        tone: m.rentArrears > 0 ? 'danger' : 'positive',
      },
      {
        label: 'Maintenance arrears', value: this.money(m.maintenanceArrears),
        tone: m.maintenanceArrears > 0 ? 'danger' : 'positive',
      },
    ];
  });

  readonly contacts = computed<MiniRow[]>(() =>
    (this.data()?.contacts ?? []).map(c => ({
      id: c.id ?? c.value,
      title: c.value,
      sub: [c.label, c.personName, c.designation].filter(Boolean).join(' · ') || c.contactType,
      meta: [
        c.isPrimary ? 'primary' : null,
        c.isWhatsApp ? 'WhatsApp' : null,
        c.isVerified ? 'verified' : 'not verified',
        c.isAuthorisedSignatory ? 'authorised signatory' : null,
      ].filter(Boolean).join(' · '),
      tone: c.isUnreachable ? 'alert' : c.isVerified ? 'good' : 'neutral',
      icon: c.contactType?.toLowerCase().includes('email') ? 'mail' : 'call',
    })));

  readonly addresses = computed<MiniRow[]>(() =>
    (this.data()?.addresses ?? []).map(a => ({
      id: a.id ?? a.oneLine,
      title: a.oneLine,
      sub: a.addressType,
      meta: [a.isMailingAddress ? 'post goes here' : null, a.isVerified ? 'verified' : null]
        .filter(Boolean).join(' · '),
      icon: 'location_on',
    })));

  readonly identities = computed<MiniRow[]>(() =>
    (this.data()?.identities ?? []).map(i => ({
      id: i.id ?? i.number,
      title: (i.localLabel ?? IDENTITY_KIND_LABELS[i.kind]) + ' ' + i.number,
      sub: [i.issuingAuthority, i.issuingCountry].filter(Boolean).join(', ') || null,
      meta: i.expiresOn
        ? (i.isExpired ? 'expired ' : 'expires ') + new Date(i.expiresOn).toLocaleDateString()
        : 'no expiry recorded',
      tone: i.isExpired ? 'alert' : 'good',
      icon: i.isPrimary ? 'badge' : 'description',
    })));

  readonly relationships = computed<MiniRow[]>(() =>
    (this.data()?.relationships ?? []).map(r => ({
      id: r.id ?? r.relatedPartyId,
      title: r.relatedPartyName,
      sub: r.relationshipType + (r.powerScope ? ' — ' + r.powerScope : ''),
      meta: r.poaDocumentNumber
        ? 'Power of attorney ' + r.poaDocumentNumber
          + (r.poaIsExpired ? ' (expired)' : r.poaIsRegistered ? ' (registered)' : '')
        : null,
      value: r.sharePercent ? r.sharePercent.toFixed(2) + '%' : null,
      tone: r.poaIsExpired ? 'alert' : r.isVerified ? 'good' : 'neutral',
      icon: 'group',
    })));

  readonly cautions = computed<MiniRow[]>(() =>
    (this.data()?.cautions ?? []).map(c => ({
      id: c.id,
      title: c.category,
      sub: c.reason,
      meta: 'raised ' + new Date(c.raisedOn).toLocaleDateString()
        + (c.raisedByName ? ' by ' + c.raisedByName : ''),
      valueSub: c.blocksNewBusiness ? 'blocks new business' : null,
      tone: c.blocksNewBusiness ? 'alert' : c.isActive ? 'warn' : 'neutral',
      icon: 'flag',
    })));

  readonly bookings = computed<MiniRow[]>(() =>
    (this.data()?.bookings ?? []).map(b => ({
      id: b.id,
      title: b.reference + ' · ' + b.projectName,
      sub: [b.unitNumber, b.blockName].filter(Boolean).join(', ') || null,
      meta: BOOKING_STATUS_LABELS[b.status],
      value: this.money(b.totalConsideration),
      valueSub: b.outstanding > 0 ? this.money(b.outstanding) + ' owed' : 'settled',
      tone: b.overdueAmount > 0 ? 'alert' : 'neutral',
      icon: 'sell',
    })));

  readonly tenancies = computed<MiniRow[]>(() =>
    (this.data()?.tenancies ?? []).map(t => ({
      id: t.id,
      title: t.reference,
      sub: t.addressOneLine ?? null,
      meta: TENANCY_STATUS_LABELS[t.status],
      value: this.money(t.rent),
      valueSub: 'rent',
      tone: t.arrearsAmount > 0 ? 'alert' : 'neutral',
      icon: 'real_estate_agent',
    })));

  readonly properties = computed<MiniRow[]>(() =>
    (this.data()?.ownedProperties ?? []).map(p => ({
      id: p.id,
      title: p.addressOneLine ?? p.reference,
      sub: p.reference,
      value: p.askingPrice ? this.money(p.askingPrice) : null,
      icon: 'home_work',
    })));

  readonly enquiries = computed<MiniRow[]>(() =>
    (this.data()?.enquiries ?? []).map(e => ({
      id: e.id,
      title: e.reference,
      sub: [e.projectName, e.sourceLabel].filter(Boolean).join(' · ') || null,
      meta: new Date(e.receivedAt).toLocaleDateString()
        + (e.assignedAgentName ? ' · ' + e.assignedAgentName : ''),
      value: 'score ' + e.score,
      tone: e.slaBreached ? 'alert' : 'neutral',
      icon: 'contact_support',
    })));

  readonly consents = computed<MiniRow[]>(() =>
    (this.data()?.consents ?? []).map(c => ({
      id: c.id ?? c.purpose + c.channel,
      title: NOTIFICATION_CHANNEL_LABELS[c.channel] + ' — ' + c.purpose,
      sub: c.source ? 'given via ' + c.source : null,
      meta: c.withdrawnAt
        ? 'withdrawn ' + new Date(c.withdrawnAt).toLocaleDateString()
        : 'recorded ' + new Date(c.recordedAt).toLocaleDateString(),
      tone: c.isGranted && !c.withdrawnAt ? 'good' : 'alert',
      icon: c.isGranted && !c.withdrawnAt ? 'check_circle' : 'block',
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

    const res = await firstValueFrom(this.crm.getParty(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'enquiry') {
      void this.router.navigate(['/realestate/enquiries'],
        { queryParams: { partyId: d.id, create: 1 } });
    } else if (key === 'kyc') {
      void this.router.navigate(['/realestate/kyc'], { queryParams: { partyId: d.id } });
    } else if (key === 'call') {
      const phone = d.contacts.find(c => c.isPrimary && !c.contactType?.toLowerCase()
        .includes('email'))?.value;
      if (phone) window.location.href = 'tel:' + phone;
      else this.toast.set('No telephone number is recorded for this contact.');
    }
  }

  openBooking(id: string): void {
    void this.router.navigate(['/realestate/bookings', id]);
  }

  activityLabel(k: number): string {
    return ACTIVITY_KIND_LABELS[k as keyof typeof ACTIVITY_KIND_LABELS] ?? '';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.money?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
