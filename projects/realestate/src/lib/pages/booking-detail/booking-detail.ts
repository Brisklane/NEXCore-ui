import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookingService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  BOOKING_STATUS_LABELS, BookingStatus, DEMAND_STATUS_LABELS, INSTALMENT_STATUS_LABELS,
  InstalmentStatus, KYC_STATUS_LABELS, KycStatus, LEDGER_ENTRY_KIND_LABELS, LedgerEntryKind,
  PAYMENT_INSTRUMENT_LABELS, RECEIPT_STATUS_LABELS, SOURCING_CHANNEL_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  ConfirmComponent, PillComponent, ProgressComponent, TimelineComponent, ToastComponent,
  type TimelineItem,
} from '../shared/ui';

/* =====================================================================================
 * A booking.
 *
 * The centre of gravity of the whole product. A booking is a unit, a buyer, a price, a plan, and
 * every payment and document that follows from those four.
 *
 * The schedule tab is the one people live on, so it shows the state of every instalment — paid,
 * due, overdue, on hold — with the surcharge that has accrued against it stated separately from
 * the principal. Rolling the two together is how a customer ends up disputing a figure nobody in
 * the office can explain.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-booking-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, TimelineComponent, PillComponent, ConfirmComponent, ToastComponent,
  ],
  templateUrl: './booking-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './booking-detail.css',
  ],
})
export class BookingDetailComponent implements OnInit {
  private bookings = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.BookingDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');
  readonly confirming = signal(false);
  readonly working = signal(false);

  readonly overdueInstalments = computed(() =>
    (this.data()?.paymentPlan?.instalments ?? []).filter(i => i.daysOverdue > 0));

  readonly outstandingChecklist = computed(() =>
    (this.data()?.documentChecklist ?? []).filter(c => !c.isSatisfied && c.isMandatory));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'schedule', label: 'Schedule', icon: 'calendar_month',
        count: this.overdueInstalments().length,
        tone: this.overdueInstalments().length ? 'danger' : 'neutral' },
      { key: 'money', label: 'Money', icon: 'payments',
        count: d.demands.filter(x => x.daysOverdue > 0).length,
        tone: d.demands.some(x => x.daysOverdue > 0) ? 'danger' : 'neutral' },
      { key: 'ledger', label: 'Ledger', icon: 'receipt_long' },
      { key: 'applicants', label: 'Applicants', icon: 'group', count: d.applicants.length },
      { key: 'documents', label: 'Documents', icon: 'folder',
        count: this.outstandingChecklist().length,
        tone: this.outstandingChecklist().length ? 'warning' : 'neutral' },
      { key: 'history', label: 'History', icon: 'history' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: BOOKING_STATUS_LABELS[d.status], tone: this.statusTone(d.status) },
      { label: SOURCING_CHANNEL_LABELS[d.sourcingChannel] },
    ];

    if (d.isDefaulting) {
      pills.push({ label: 'In default', tone: 'danger', icon: 'warning' });
    }
    if (d.isUnderLitigation) {
      pills.push({ label: 'Under litigation', tone: 'danger', icon: 'gavel' });
    }
    if (d.kycStatus !== KycStatus.Verified) {
      pills.push({
        label: 'KYC ' + KYC_STATUS_LABELS[d.kycStatus].toLowerCase(),
        tone: 'warning', icon: 'badge',
      });
    }
    if (d.pendingApprovals.length) {
      pills.push({ label: 'Awaiting approval', tone: 'warning', icon: 'approval' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Consideration', value: this.money(d.totalConsideration) },
      {
        label: 'Paid', value: this.money(d.totalPaid),
        hint: d.collectionPercent.toFixed(0) + '% of the total',
      },
      {
        label: 'Outstanding', value: this.money(d.outstanding),
        hint: d.overdueAmount > 0 ? this.money(d.overdueAmount) + ' overdue' : 'nothing overdue',
      },
      {
        label: 'Next due',
        value: d.nextDueAmount ? this.money(d.nextDueAmount) : '—',
        hint: d.nextDueDate ? new Date(d.nextDueDate).toLocaleDateString() : 'nothing scheduled',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (d.status === BookingStatus.Provisional || d.status === BookingStatus.PendingApproval) {
      actions.push({
        key: 'confirm', label: 'Confirm', icon: 'check', tone: 'success',
        disabled: d.pendingApprovals.length > 0,
        reason: d.pendingApprovals.length
          ? 'An approval is still outstanding on this booking.' : null,
      });
    }

    actions.push({ key: 'receipt', label: 'Take a payment', icon: 'payments', tone: 'primary' });

    if (!d.allotmentId && d.status === BookingStatus.Confirmed) {
      actions.push({ key: 'allotment', label: 'Issue allotment', icon: 'description' });
    }
    if (!d.saleAgreementId && d.allotmentId) {
      actions.push({ key: 'agreement', label: 'Generate agreement', icon: 'gavel' });
    }

    actions.push({ key: 'statement', label: 'Statement', icon: 'summarize' });

    return actions;
  });

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Booked on', value: new Date(d.bookingDate).toLocaleDateString() },
      { label: 'Project', value: d.projectName },
      { label: 'Unit', value: d.unitNumber ?? d.fileNumber },
      { label: 'Block', value: d.blockName },
      { label: 'Area', value: d.area?.displayText },
      { label: 'Buyer', value: d.applicantName },
      { label: 'Phone', value: d.applicantPhone },
      { label: 'Guardian', value: d.fatherOrGuardianName },
      { label: 'Sold by', value: d.salesExecutiveName },
      { label: 'Partner', value: d.partnerName },
      { label: 'Plan', value: d.paymentPlanName },
    ];
  });

  readonly pricing = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'List price', value: this.money(d.listPrice) },
      {
        label: 'Discount',
        value: d.discountAmount ? this.money(d.discountAmount) : 'None',
        hint: d.discountPercent ? d.discountPercent.toFixed(2) + '%' : null,
        tone: d.discountAmount ? 'warning' : 'muted',
      },
      { label: 'Net sale price', value: this.money(d.netSalePrice) },
      { label: 'Rate', value: this.money(d.ratePerSqFt) + ' / sq ft' },
      { label: 'Total consideration', value: this.money(d.totalConsideration), tone: 'positive' },
      { label: 'Demanded to date', value: this.money(d.totalDemanded) },
      { label: 'Received', value: this.money(d.totalPaid), tone: 'positive' },
      {
        label: 'Surcharge accrued', value: this.money(d.totalSurcharge),
        tone: d.totalSurcharge > 0 ? 'danger' : 'muted',
        hint: 'penalty on late instalments',
      },
      {
        label: 'Waived', value: d.totalWaived ? this.money(d.totalWaived) : 'Nothing',
        tone: 'muted',
      },
    ];
  });

  readonly milestoneDates = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Confirmed', value: on(d.confirmedAt) },
      { label: 'Allotment', value: d.allotmentNumber },
      { label: 'Agreement signed', value: on(d.agreementSignedOn) },
      { label: 'Registered', value: on(d.registeredOn) },
      { label: 'Possession offered', value: on(d.possessionOfferedOn) },
      { label: 'Possession taken', value: on(d.possessionTakenOn) },
    ].filter(f => f.value);
  });

  readonly instalments = computed(() => this.data()?.paymentPlan?.instalments ?? []);

  readonly demands = computed<MiniRow[]>(() =>
    (this.data()?.demands ?? []).map(x => ({
      id: x.id,
      title: x.demandNumber + (x.isReminder ? ' (reminder ' + x.reminderNumber + ')' : ''),
      sub: 'due ' + new Date(x.dueDate).toLocaleDateString()
        + (x.daysOverdue > 0 ? ' — ' + x.daysOverdue + ' days overdue' : ''),
      meta: DEMAND_STATUS_LABELS[x.status]
        + (x.sentAt ? ', sent ' + new Date(x.sentAt).toLocaleDateString() : ', not sent'),
      value: this.money(x.totalAmount),
      valueSub: x.balance > 0 ? this.money(x.balance) + ' outstanding' : 'settled',
      tone: x.daysOverdue > 0 ? 'alert' : x.balance > 0 ? 'warn' : 'good',
      icon: 'request_quote',
    })));

  readonly receipts = computed<MiniRow[]>(() =>
    (this.data()?.receipts ?? []).map(r => ({
      id: r.id,
      title: r.receiptNumber,
      sub: PAYMENT_INSTRUMENT_LABELS[r.instrument]
        + (r.instrumentNumber ? ' ' + r.instrumentNumber : '')
        + (r.bankName ? ' · ' + r.bankName : ''),
      meta: new Date(r.receivedOn).toLocaleDateString() + ' · ' + RECEIPT_STATUS_LABELS[r.status],
      value: this.money(r.amount),
      valueSub: r.escrowAmount > 0 ? this.money(r.escrowAmount) + ' to escrow' : null,
      tone: 'good',
      icon: 'payments',
    })));

  readonly applicants = computed<MiniRow[]>(() =>
    (this.data()?.applicants ?? []).map(a => ({
      id: a.id ?? a.partyId,
      title: a.name + (a.isPrimary ? ' (primary)' : ''),
      sub: [a.fatherOrGuardianName, a.identityNumber, a.phone].filter(Boolean).join(' · ') || null,
      meta: a.role + ' · KYC ' + KYC_STATUS_LABELS[a.kycStatus].toLowerCase(),
      value: a.sharePercent.toFixed(2) + '%',
      tone: a.kycStatus === KycStatus.Verified ? 'good' : 'warn',
      icon: 'person',
    })));

  readonly documents = computed<MiniRow[]>(() =>
    (this.data()?.documents ?? []).map(doc => ({
      id: doc.id,
      title: doc.title ?? doc.documentType,
      sub: doc.documentNumber,
      meta: new Date(doc.generatedAt).toLocaleDateString()
        + (doc.generatedByName ? ' by ' + doc.generatedByName : ''),
      valueSub: doc.isSigned ? 'signed' : doc.isSent ? 'sent' : 'generated',
      tone: doc.isSuperseded ? 'warn' : 'neutral',
      icon: doc.isSigned ? 'draw' : 'description',
    })));

  readonly checklist = computed(() => this.data()?.documentChecklist ?? []);

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

  readonly statusHistory = computed<MiniRow[]>(() =>
    (this.data()?.statusHistory ?? []).map((h, i) => ({
      id: String(i),
      title: BOOKING_STATUS_LABELS[h.fromStatus] + ' → ' + BOOKING_STATUS_LABELS[h.toStatus],
      sub: h.reason ?? h.note ?? null,
      meta: new Date(h.changedAt).toLocaleString()
        + (h.changedByName ? ' · ' + h.changedByName : ''),
      icon: 'swap_horiz',
    })));

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();

    if (history.state?.justCreated) {
      this.toast.set('Booking created. The unit is off the market.');
    }
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

    const res = await firstValueFrom(this.bookings.get(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    switch (key) {
      case 'confirm':
        this.confirming.set(true);
        break;
      case 'receipt':
        void this.router.navigate(['/realestate/money/receipts'],
          { queryParams: { bookingId: d.id, create: 1 } });
        break;
      case 'allotment':
        void this.issueAllotment();
        break;
      case 'agreement':
        void this.generateAgreement();
        break;
      case 'statement':
        void this.router.navigate(['/realestate/money/ledger'],
          { queryParams: { bookingId: d.id } });
        break;
    }
  }

  async confirm(): Promise<void> {
    const d = this.data();
    if (!d) return;

    this.working.set(true);
    const res = await firstValueFrom(this.bookings.confirm(d.id)).catch(() => null);
    this.working.set(false);
    this.confirming.set(false);

    if (res?.data) {
      this.data.set(res.data);
      this.toast.set('Confirmed. The payment plan is now live and demands will be raised on it.');
    } else {
      this.toast.set('That did not go through. The booking is unchanged.');
    }
  }

  private async issueAllotment(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.bookings.issueAllotment(d.id)).catch(() => null);

    if (res?.data) {
      this.toast.set('Allotment ' + res.data.allotmentNumber + ' issued.');
      await this.load();
    } else {
      this.toast.set('The allotment could not be issued.');
    }
  }

  private async generateAgreement(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.bookings.generateAgreement(d.id)).catch(() => null);

    if (res?.success) {
      this.toast.set('Agreement generated. It is on the Documents tab.');
      await this.load();
    } else {
      this.toast.set('The agreement could not be generated.');
    }
  }

  instalmentClass(i: M.InstalmentDto): string {
    if (i.daysOverdue > 0) return 'is-overdue';
    if (i.status === InstalmentStatus.Paid) return 'is-paid';
    if (i.balance > 0 && i.dueDate && new Date(i.dueDate) <= new Date()) return 'is-due';
    return '';
  }

  instalmentStatus(i: M.InstalmentDto): string {
    if (i.isOnHold) return 'On hold' + (i.holdReason ? ' — ' + i.holdReason : '');
    if (i.daysOverdue > 0) return i.daysOverdue + ' days overdue';
    return INSTALMENT_STATUS_LABELS[i.status];
  }

  ledgerKind(k: LedgerEntryKind): string {
    return LEDGER_ENTRY_KIND_LABELS[k] ?? '';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  private statusTone(s: BookingStatus): DetailPill['tone'] {
    switch (s) {
      case BookingStatus.Cancelled:
      case BookingStatus.UnderCancellation:
      case BookingStatus.Defaulting:
        return 'danger';
      case BookingStatus.Provisional:
      case BookingStatus.PendingApproval:
        return 'warning';
      case BookingStatus.Completed:
      case BookingStatus.Possessed:
      case BookingStatus.AgreementSigned:
        return 'positive';
      default:
        return 'neutral';
    }
  }
}
