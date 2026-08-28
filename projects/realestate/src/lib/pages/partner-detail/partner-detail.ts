import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BrokerageService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  BOOKING_STATUS_LABELS, LEAD_REGISTRATION_STATUS_LABELS, LeadRegistrationStatus,
  PARTNER_STATUS_LABELS, PartnerStatus,
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
 * A channel partner.
 *
 * A broker who introduces buyers in exchange for commission. The relationship is entirely
 * governed by two things, and both are on this screen rather than buried:
 *
 *   - Lead registration. A partner registers a prospect and that registration protects their
 *     commission for a fixed window. Almost every dispute with a broker is an argument about
 *     whose registration was live when the buyer walked in, so conflicts are shown explicitly.
 *   - Conversion. Registrations against bookings. A partner who registers two hundred leads and
 *     converts one is not a good partner; they are occupying the registration window.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-partner-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, TimelineComponent, PillComponent, ToastComponent,
  ],
  templateUrl: './partner-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './partner-detail.css',
  ],
})
export class PartnerDetailComponent implements OnInit {
  private brokerage = inject(BrokerageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ChannelPartnerDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly conflicts = computed(() =>
    (this.data()?.recentRegistrations ?? []).filter(r => r.conflictsWithRegistrationId));

  readonly expiringRegistrations = computed(() =>
    (this.data()?.recentRegistrations ?? [])
      .filter(r => r.isExpiringSoon && r.status === LeadRegistrationStatus.Registered));

  readonly missingDocs = computed(() =>
    (this.data()?.documents ?? []).filter(doc => !doc.isSatisfied && doc.isMandatory));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'handshake' },
      { key: 'registrations', label: 'Registrations', icon: 'how_to_reg',
        count: this.conflicts().length,
        tone: this.conflicts().length ? 'danger' : 'neutral' },
      { key: 'bookings', label: 'Bookings', icon: 'sell', count: d.bookings.length },
      { key: 'money', label: 'Commission', icon: 'percent',
        count: d.advanceOutstanding > 0 ? 1 : 0,
        tone: d.advanceOutstanding > 0 ? 'warning' : 'neutral' },
      { key: 'access', label: 'Access', icon: 'key',
        count: d.users.length + d.authorisations.length },
      { key: 'compliance', label: 'Compliance', icon: 'verified',
        count: this.missingDocs().length,
        tone: this.missingDocs().length ? 'danger' : 'neutral' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PARTNER_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
    ];

    if (d.tierName) pills.push({ label: d.tierName, tone: 'accent', icon: 'workspace_premium' });
    if (d.licenceExpiring) {
      pills.push({ label: 'Licence expiring', tone: 'danger', icon: 'event_busy' });
    }
    if (d.hasExpiredDocuments) {
      pills.push({ label: 'Documents expired', tone: 'danger', icon: 'folder_off' });
    }
    if (!d.bankDetailsVerified) {
      pills.push({ label: 'Bank details unverified', tone: 'warning', icon: 'account_balance' });
    }
    if (d.advanceOutstanding > 0) {
      pills.push({
        label: this.money(d.advanceOutstanding) + ' advance outstanding', tone: 'warning',
      });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Registered', value: String(d.leadsRegistered),
        hint: d.siteVisitsDone + ' site visits done',
      },
      {
        label: 'Booked', value: String(d.bookingsMade),
        hint: d.conversionPercent.toFixed(1) + '% conversion',
      },
      {
        label: 'Booking value', value: this.money(d.bookingValue),
        hint: this.money(d.collectionContribution) + ' collected',
      },
      {
        label: 'Commission', value: this.money(d.commissionEarned),
        hint: this.money(d.commissionPending) + ' still to pay',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [
      { key: 'statement', label: 'Generate a statement', icon: 'summarize', tone: 'primary' },
    ];

    if (d.status === PartnerStatus.Active) {
      actions.push({ key: 'suspend', label: 'Suspend', icon: 'pause', tone: 'danger' });
    }

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Name', value: d.name },
      { label: 'Trading as', value: d.tradingName },
      { label: 'Tier', value: d.tierName },
      { label: 'Contact', value: d.contactName },
      { label: 'Phone', value: d.phone },
      { label: 'Email', value: d.email },
      { label: 'Address', value: d.addressLine, wide: true },
      { label: 'City', value: d.city },
      { label: 'Relationship manager', value: d.relationshipManagerName },
      {
        label: 'Onboarded',
        value: d.onboardedOn ? new Date(d.onboardedOn).toLocaleDateString() : null,
      },
      { label: 'Registration number', value: d.registrationNumber },
      { label: 'Licence', value: d.licenceNumber },
      {
        label: 'Licence expires',
        value: d.licenceExpiresOn ? new Date(d.licenceExpiresOn).toLocaleDateString() : null,
        tone: d.licenceExpiring ? 'danger' : 'neutral',
      },
      { label: 'Tax number', value: d.taxNumber },
      { label: 'Suspended on', value: d.suspendedOn ? new Date(d.suspendedOn).toLocaleDateString() : null },
      { label: 'Suspended because', value: d.suspensionReason, tone: 'danger', wide: true },
      { label: 'Notes', value: d.notes, wide: true },
    ];
  });

  readonly banking = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Bank', value: d.bankName },
      { label: 'Account title', value: d.accountTitle },
      { label: 'Account number', value: d.accountNumber },
      {
        label: 'Verified', value: d.bankDetailsVerified ? 'Yes' : 'No',
        tone: d.bankDetailsVerified ? 'positive' : 'danger',
        hint: d.bankDetailsVerified
          ? null : 'nothing should be paid out until these are checked',
      },
      {
        label: 'Withholding', value: d.withholdingPercent.toFixed(2) + '%',
        hint: 'deducted from every payout',
      },
    ];
  });

  readonly moneyFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Commission earned', value: this.money(d.commissionEarned) },
      { label: 'Paid', value: this.money(d.commissionPaid), tone: 'positive' },
      {
        label: 'Pending', value: this.money(d.commissionPending),
        tone: d.commissionPending > 0 ? 'warning' : 'positive',
      },
      {
        label: 'Advance outstanding', value: this.money(d.advanceOutstanding),
        tone: d.advanceOutstanding > 0 ? 'danger' : 'positive',
        hint: 'recovered from future commission',
      },
      { label: 'Booking value', value: this.money(d.bookingValue) },
      {
        label: 'Collection contribution', value: this.money(d.collectionContribution),
        hint: 'money actually received on their bookings',
      },
      {
        label: 'Cancellations', value: d.cancellationCount,
        tone: d.cancellationCount > 0 ? 'warning' : 'neutral',
        hint: 'commission on these is clawed back',
      },
    ];
  });

  readonly registrations = computed<MiniRow[]>(() =>
    (this.data()?.recentRegistrations ?? []).map(r => ({
      id: r.id,
      title: r.prospectName + ' — ' + r.projectName,
      sub: [r.prospectPhone, r.partnerUserName ? 'by ' + r.partnerUserName : null]
        .filter(Boolean).join(' · '),
      meta: LEAD_REGISTRATION_STATUS_LABELS[r.status]
        + ' · registered ' + new Date(r.registeredAt).toLocaleDateString()
        + (r.status === LeadRegistrationStatus.Registered
          ? ' · ' + r.daysRemaining + ' days left' : '')
        + (r.conflictsWithPartnerName
          ? ' · conflicts with ' + r.conflictsWithPartnerName : ''),
      valueSub: r.bookingId ? 'converted' : (r.extensionCount ? 'extended ' + r.extensionCount + '×' : null),
      tone: r.conflictsWithRegistrationId ? 'alert'
        : r.bookingId ? 'good'
        : r.isExpiringSoon ? 'warn' : 'neutral',
      icon: r.conflictsWithRegistrationId ? 'warning' : 'how_to_reg',
    })));

  readonly bookings = computed<MiniRow[]>(() =>
    (this.data()?.bookings ?? []).map(b => ({
      id: b.id,
      title: b.reference + ' · ' + b.applicantName,
      sub: [b.projectName, b.unitNumber].filter(Boolean).join(' · '),
      meta: BOOKING_STATUS_LABELS[b.status]
        + ' · ' + new Date(b.bookingDate).toLocaleDateString(),
      value: this.money(b.totalConsideration),
      valueSub: b.collectionPercent.toFixed(0) + '% collected',
      tone: b.overdueAmount > 0 ? 'warn' : 'neutral',
      icon: 'sell',
    })));

  readonly users = computed<MiniRow[]>(() =>
    (this.data()?.users ?? []).map(u => ({
      id: u.id ?? u.name,
      title: u.name + (u.isPrimary ? ' (primary)' : ''),
      sub: [u.designation, u.phone, u.email].filter(Boolean).join(' · ') || null,
      meta: [
        u.canRegisterLeads ? 'can register leads' : null,
        u.canBookVisits ? 'can book visits' : null,
        u.canViewCommission ? 'sees commission' : null,
        u.lastLoginAt ? 'last in ' + new Date(u.lastLoginAt).toLocaleDateString() : 'never signed in',
      ].filter(Boolean).join(' · '),
      value: u.bookingsMade + ' bookings',
      valueSub: u.leadsRegistered + ' leads',
      tone: u.isActive ? 'neutral' : 'warn',
      icon: 'person',
    })));

  readonly authorisations = computed<MiniRow[]>(() =>
    (this.data()?.authorisations ?? []).map(a => ({
      id: a.id ?? a.projectId,
      title: a.projectName ?? 'Project',
      sub: a.commissionPlanName ?? null,
      meta: 'from ' + new Date(a.effectiveFrom).toLocaleDateString()
        + (a.effectiveTo ? ' to ' + new Date(a.effectiveTo).toLocaleDateString() : '')
        + (a.canSeePrices ? ' · sees prices' : '')
        + (a.canHoldUnits ? ' · can hold units' : ''),
      value: a.maxBookings
        ? a.bookingsMade + ' of ' + a.maxBookings
        : String(a.bookingsMade),
      valueSub: a.maxBookings ? 'booking allowance' : 'bookings',
      tone: a.isActive ? 'good' : 'neutral',
      icon: 'apartment',
    })));

  readonly statements = computed<MiniRow[]>(() =>
    (this.data()?.statements ?? []).map(s => ({
      id: s.id,
      title: s.reference,
      sub: new Date(s.periodFrom).toLocaleDateString()
        + ' to ' + new Date(s.periodTo).toLocaleDateString(),
      meta: s.bookingCount + ' bookings'
        + (s.isAcknowledged ? ' · acknowledged'
          : s.isPublishedToPortal ? ' · on the portal, not acknowledged' : ' · not published'),
      value: this.money(s.closingBalance),
      valueSub: 'closing balance',
      tone: s.isAcknowledged ? 'good' : 'neutral',
      icon: 'summarize',
    })));

  readonly advances = computed<MiniRow[]>(() =>
    (this.data()?.advances ?? []).map(a => ({
      id: a.id,
      title: a.reference + (a.purpose ? ' — ' + a.purpose : ''),
      sub: 'advanced ' + new Date(a.advancedOn).toLocaleDateString()
        + ', recovered at ' + a.recoveryPercent.toFixed(0) + '% of each payout',
      meta: a.isWrittenOff ? 'written off'
        : a.fullyRecoveredOn
          ? 'fully recovered ' + new Date(a.fullyRecoveredOn).toLocaleDateString()
          : null,
      value: this.money(a.amount),
      valueSub: a.outstandingAmount > 0
        ? this.money(a.outstandingAmount) + ' outstanding' : 'clear',
      tone: a.outstandingAmount > 0 ? 'warn' : 'good',
      icon: 'account_balance_wallet',
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

    const res = await firstValueFrom(this.brokerage.getPartner(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'statement') void this.generateStatement();
    else if (key === 'suspend') void this.suspend();
  }

  private async generateStatement(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.brokerage.generateStatement(d.id)).catch(() => null);

    if (res?.data) {
      this.toast.set('Statement ' + res.data.reference + ' generated.');
      await this.load();
    } else {
      this.toast.set('The statement could not be generated.');
    }
  }

  private async suspend(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(
      this.brokerage.changePartnerStatus(d.id, PartnerStatus.Suspended),
    ).catch(() => null);

    if (res?.data) {
      this.data.set(res.data);
      this.toast.set('Suspended. Their live registrations still stand, but they cannot make new '
        + 'ones until this is lifted.');
    } else {
      this.toast.set('That could not be done.');
    }
  }

  private statusTone(s: PartnerStatus): DetailPill['tone'] {
    if (s === PartnerStatus.Active) return 'positive';
    if (s === PartnerStatus.Suspended || s === PartnerStatus.Blacklisted) return 'danger';
    return 'warning';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
