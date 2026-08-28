import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SocietyService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  AlertSeverity, MAINTENANCE_BASIS_LABELS, RENT_FREQUENCY_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import {
  BreakdownComponent, ProgressComponent, StatsComponent, ToastComponent,
  TrendComponent, type BreakdownSlice, type StatCard, type TrendPoint,
} from '../shared/ui';

/* =====================================================================================
 * A society.
 *
 * The residents' association that runs a scheme after the developer hands it over: billing,
 * the gate, amenities, complaints and the corpus fund.
 *
 * The handover is the moment that matters most and it is the one most often left half-done. A
 * society that has taken the units but not the common areas, or the common areas but not the
 * documents, is a society that cannot lawfully act — so all three are shown separately rather
 * than as a single "handed over" flag.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-society-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    StatsComponent, ProgressComponent, TrendComponent, BreakdownComponent, ToastComponent,
  ],
  templateUrl: './society-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './society-detail.css',
  ],
})
export class SocietyDetailComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.SocietyDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly handoverIncomplete = computed(() => {
    const d = this.data();
    return !!d && d.isHandedOver
      && (!d.commonAreasTransferred || !d.documentsTransferred);
  });

  readonly dashboard = computed(() => this.data()?.dashboard ?? null);

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    const db = d.dashboard;

    return [
      { key: 'overview', label: 'Today', icon: 'dashboard',
        count: db.complaintsBreachingSla,
        tone: db.complaintsBreachingSla ? 'danger' : 'neutral' },
      { key: 'money', label: 'Money', icon: 'payments',
        count: db.defaulterCount,
        tone: db.defaulterCount ? 'warning' : 'neutral' },
      { key: 'charges', label: 'Charge schemes', icon: 'receipt_long',
        count: d.chargeSchemes.length },
      { key: 'amenities', label: 'Amenities', icon: 'pool', count: d.amenities.length },
      { key: 'committee', label: 'Committee', icon: 'groups', count: d.committee.length },
      { key: 'notices', label: 'Notices', icon: 'campaign', count: d.recentNotices.length },
      { key: 'handover', label: 'Handover', icon: 'move_down',
        count: this.handoverIncomplete() ? 1 : 0,
        tone: this.handoverIncomplete() ? 'warning' : 'neutral' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      {
        label: d.isHandedOver ? 'Handed over' : 'Developer managed',
        tone: d.isHandedOver ? 'positive' : 'warning',
      },
    ];

    if (d.registrationNumber) {
      pills.push({ label: 'Registered ' + d.registrationNumber, icon: 'verified' });
    }
    if (this.handoverIncomplete()) {
      pills.push({ label: 'Handover incomplete', tone: 'warning', icon: 'pending' });
    }
    if (d.defaulterCount > 0) {
      pills.push({ label: d.defaulterCount + ' defaulters', tone: 'danger' });
    }
    if (d.complaintsBreachingSla > 0) {
      pills.push({
        label: d.complaintsBreachingSla + ' complaints past the promise', tone: 'danger',
      });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Units', value: String(d.totalUnits),
        hint: d.occupancyPercent.toFixed(0) + '% occupied',
      },
      { label: 'Billed monthly', value: this.money(d.monthlyBillingTotal) },
      {
        label: 'Outstanding', value: this.money(d.outstandingTotal),
        hint: d.collectionEfficiencyPercent.toFixed(0) + '% collection efficiency',
      },
      {
        label: 'Corpus fund', value: this.money(d.corpusFundBalance),
        hint: 'plus ' + this.money(d.sinkingFundBalance) + ' sinking fund',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => [
    { key: 'bill', label: 'Run the billing', icon: 'receipt_long', tone: 'primary' },
    { key: 'notice', label: 'Post a notice', icon: 'campaign' },
    { key: 'residents', label: 'Residents', icon: 'groups' },
  ]);

  readonly todayStats = computed<StatCard[]>(() => {
    const db = this.dashboard();
    if (!db) return [];

    return [
      {
        label: 'Inside the gate', value: db.visitorsInsideNow, icon: 'badge',
        hint: db.visitorsToday + ' today',
      },
      {
        label: 'Awaiting the resident', value: db.pendingGateApprovals, icon: 'doorbell',
        tone: db.pendingGateApprovals > 0 ? 'warning' : 'neutral',
      },
      {
        label: 'Open complaints', value: db.openComplaints, icon: 'report',
        tone: db.complaintsBreachingSla > 0 ? 'danger' : 'neutral',
        hint: db.complaintsBreachingSla
          ? db.complaintsBreachingSla + ' past the promise' : 'all within the promise',
      },
      {
        label: 'Amenity bookings', value: db.amenityBookingsToday, icon: 'pool',
        hint: db.pendingAmenityApprovals
          ? db.pendingAmenityApprovals + ' awaiting approval' : 'nothing to approve',
      },
      {
        label: 'Open work orders', value: db.openWorkOrders, icon: 'build',
        hint: db.ppmOverdue ? db.ppmOverdue + ' planned jobs overdue' : 'maintenance on schedule',
        tone: db.ppmOverdue > 0 ? 'warning' : 'neutral',
      },
      {
        label: 'Faulty assets', value: db.assetsFaulty, icon: 'report_problem',
        tone: db.assetsFaulty > 0 ? 'danger' : 'positive',
      },
    ];
  });

  readonly moneyStats = computed<StatCard[]>(() => {
    const db = this.dashboard();
    if (!db) return [];

    return [
      { label: 'Billed this month', value: this.money(db.billedThisMonth), icon: 'receipt' },
      {
        label: 'Collected', value: this.money(db.collectedThisMonth), icon: 'payments',
        tone: 'positive',
      },
      {
        label: 'Outstanding', value: this.money(db.outstandingTotal), icon: 'account_balance_wallet',
        tone: db.outstandingTotal > 0 ? 'warning' : 'positive',
      },
      {
        label: 'Defaulters', value: db.defaulterCount, icon: 'money_off',
        tone: db.defaulterCount > 0 ? 'danger' : 'positive',
        hint: this.money(db.defaulterExposure) + ' exposure',
      },
    ];
  });

  readonly collectionEfficiency = computed(() => {
    const db = this.dashboard();
    if (!db || !db.billedThisMonth) return 0;
    return (db.collectedThisMonth / db.billedThisMonth) * 100;
  });

  readonly complaintBreakdown = computed<BreakdownSlice[]>(() =>
    (this.dashboard()?.complaintsByCategory ?? []).map(s => ({
      label: s.label, value: s.value, percent: s.percent, count: s.count, tone: s.tone ?? null,
    })));

  readonly collectionTrend = computed<TrendPoint[]>(() =>
    (this.dashboard()?.collectionTrend ?? []).map(p => ({
      label: p.label, value: p.value, secondaryValue: p.secondaryValue ?? null,
    })));

  // ── Tab contents ──────────────────────────────────────────────────

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Name', value: d.name },
      { label: 'Code', value: d.code },
      { label: 'Project', value: d.projectName },
      { label: 'Registration', value: d.registrationNumber },
      { label: 'Authority', value: d.registrationAuthority },
      {
        label: 'Registered',
        value: d.registeredOn ? new Date(d.registeredOn).toLocaleDateString() : null,
      },
      { label: 'Total area', value: d.totalArea.displayText },
      { label: 'Units', value: d.totalUnits },
      { label: 'Occupied', value: d.occupiedUnits },
      { label: 'Financial year starts', value: this.monthName(d.financialYearStartMonth) },
      { label: 'Facility manager', value: d.facilityManagerName },
      {
        label: 'Amenities blocked for defaulters',
        value: d.suspendAmenitiesOnDefault
          ? 'Above ' + this.money(d.amenitySuspensionThreshold)
          : 'No',
        hint: d.suspendAmenitiesOnDefault
          ? 'a resident owing more than this cannot book the pool or the hall' : null,
        wide: true,
      },
    ];
  });

  readonly handoverFacts = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Handed over',
        value: d.handoverDate ? new Date(d.handoverDate).toLocaleDateString() : 'Not yet',
        tone: d.isHandedOver ? 'positive' : 'warning',
      },
      {
        label: 'Common areas transferred',
        value: d.commonAreasTransferred ? 'Yes' : 'No',
        tone: d.commonAreasTransferred ? 'positive' : 'danger',
      },
      {
        label: 'Documents transferred',
        value: d.documentsTransferred ? 'Yes' : 'No',
        tone: d.documentsTransferred ? 'positive' : 'danger',
        hint: d.documentsTransferred
          ? null : 'approvals, warranties, as-built drawings and maintenance manuals',
      },
      {
        label: 'Corpus transferred', value: this.money(d.corpusTransferred),
        hint: 'the fund the developer hands across at transfer',
      },
      { label: 'Corpus balance now', value: this.money(d.corpusFundBalance) },
      {
        label: 'Sinking fund', value: this.money(d.sinkingFundBalance),
        hint: 'set aside for major works — lifts, roofs, resurfacing',
      },
      { label: 'Managed by the developer', value: d.managedByDeveloper ? 'Yes' : 'No' },
    ];
  });

  readonly committee = computed<MiniRow[]>(() =>
    (this.data()?.committee ?? []).map(c => ({
      id: c.id,
      title: c.name + ' — ' + c.position,
      sub: [c.unitLabel, c.phone].filter(Boolean).join(' · ') || null,
      meta: 'from ' + new Date(c.fromDate).toLocaleDateString()
        + (c.toDate ? ' to ' + new Date(c.toDate).toLocaleDateString() : ''),
      value: c.canApproveSpend ? this.money(c.spendLimit) : null,
      valueSub: c.canApproveSpend ? 'spend limit' : 'cannot approve spend',
      tone: c.isActive ? 'good' : 'neutral',
      icon: 'person',
    })));

  readonly amenities = computed<MiniRow[]>(() =>
    (this.data()?.amenities ?? []).map(a => ({
      id: a.id,
      title: a.name,
      sub: [a.amenityType, a.location, 'holds ' + a.capacity].filter(Boolean).join(' · '),
      meta: a.opensAt + ' to ' + a.closesAt
        + ' · ' + a.slotMinutes + ' minute slots'
        + (a.requiresApproval ? ' · needs approval' : '')
        + (a.blockedForDefaulters ? ' · closed to defaulters' : '')
        + (a.isUnderMaintenance ? ' · under maintenance' : ''),
      value: a.chargePerSlot ? this.money(a.chargePerSlot) : (a.chargePerHour
        ? this.money(a.chargePerHour) + '/hr' : 'Free'),
      valueSub: a.utilisationPercent.toFixed(0) + '% used, '
        + a.bookingsThisMonth + ' this month',
      tone: a.isUnderMaintenance ? 'warn' : a.isActive ? 'neutral' : 'alert',
      icon: 'pool',
    })));

  readonly schemes = computed<MiniRow[]>(() =>
    (this.data()?.chargeSchemes ?? []).map(s => ({
      id: s.id,
      title: s.name,
      sub: MAINTENANCE_BASIS_LABELS[s.basis]
        + (s.ratePerSqFt ? ' at ' + this.money(s.ratePerSqFt) + ' per sq ft'
          : s.flatAmount ? ' at ' + this.money(s.flatAmount) : '')
        + ' · ' + RENT_FREQUENCY_LABELS[s.frequency],
      meta: [
        'from ' + new Date(s.effectiveFrom).toLocaleDateString(),
        s.graceDays + ' days grace',
        s.lateFeePercent ? s.lateFeePercent + '% late fee' : null,
        s.vacantUnitPercent < 100 ? 'vacant units at ' + s.vacantUnitPercent + '%' : null,
        s.allowAnnualPrepayment ? 'annual prepayment allowed' : null,
      ].filter(Boolean).join(' · '),
      value: this.money(s.monthlyValue),
      valueSub: s.unitsCovered + ' units covered',
      tone: s.isActive ? 'good' : 'neutral',
      icon: 'receipt_long',
    })));

  readonly notices = computed<MiniRow[]>(() =>
    (this.data()?.recentNotices ?? []).map(n => ({
      id: n.id,
      title: n.title,
      sub: n.body,
      meta: new Date(n.publishedAt).toLocaleDateString()
        + (n.publishedByName ? ' · ' + n.publishedByName : '')
        + ' · read by ' + n.readCount
        + (n.targetBlocks ? ' · ' + n.targetBlocks : ' · everybody'),
      tone: n.severity === AlertSeverity.Critical ? 'alert'
        : n.severity === AlertSeverity.Warning ? 'warn' : 'neutral',
      icon: n.isPinned ? 'push_pin' : 'campaign',
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

    const res = await firstValueFrom(this.societies.get(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    // Every society screen is scoped by the society in the URL, not by a query parameter.
    const page = key === 'bill' ? 'billing' : key === 'notice' ? 'notices' : 'residents';
    void this.router.navigate(['/realestate/society', d.id, page]);
  }

  private monthName(m: number): string {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return names[Math.max(0, Math.min(11, m - 1))];
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
