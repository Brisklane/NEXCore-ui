import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ReportService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import { AlertSeverity } from '../../models/realestate.enums';
import {
  BreakdownComponent, EmptyStateComponent, PillComponent, ProgressComponent,
  SkeletonComponent, StatsComponent, TrendComponent, type BreakdownSlice,
  type StatCard, type TrendPoint,
} from '../shared/ui';
import { ProjectPickerComponent } from '../shared/project-picker';
import { SectionComponent } from '../shared/detail-bits';

/* =====================================================================================
 * The Real Estate dashboard.
 *
 * A brokerage, a plot developer, a contractor and a society manager all open this screen, and
 * only one of them cares about retention held against certified work. So the dashboard is built
 * from bands that switch on the lines of business the company actually runs — an agency never
 * sees a construction figure, and a contractor is never asked about void units.
 *
 * The top of the screen is not statistics. It is the attention list: what will go wrong today if
 * nobody looks, ranked by what it costs. Everything below it is context for that.
 * ===================================================================================== */

interface Band {
  key: string;
  title: string;
  note: string;
  stats: StatCard[];
}

@Component({
  standalone: true,
  selector: 'lib-re-dashboard',
  imports: [
    CommonModule, RouterLink, StatsComponent, TrendComponent, BreakdownComponent,
    ProgressComponent, SkeletonComponent, EmptyStateComponent, PillComponent,
    ProjectPickerComponent, SectionComponent,
  ],
  templateUrl: './realestate-dashboard.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './realestate-dashboard.css',
  ],
})
export class RealEstateDashboardComponent implements OnInit {
  private reports = inject(ReportService);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.RealEstateDashboardDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  });

  readonly attention = computed(() => this.data()?.needsAttention ?? []);

  readonly critical = computed(() =>
    this.attention().filter(a => a.severity === AlertSeverity.Critical).length);

  /** The four or five figures that belong above everything else, whatever the business does. */
  readonly today = computed<StatCard[]>(() => {
    const d = this.data();
    if (!d) return [];

    const cards: StatCard[] = [];

    if (d.brokerageEnabled || d.estateManagementEnabled) {
      cards.push({
        label: 'Leads unanswered',
        value: d.unansweredLeads,
        icon: 'contact_support',
        tone: d.unansweredLeads > 0 ? 'danger' : 'positive',
        hint: d.averageSpeedToLeadMinutes > 0
          ? Math.round(d.averageSpeedToLeadMinutes) + ' min average reply'
          : 'nothing waiting',
        route: '/realestate/enquiries',
      });
      cards.push({
        label: 'Viewings today',
        value: d.viewingsToday,
        icon: 'event',
        hint: d.siteVisitsToday ? d.siteVisitsToday + ' site visits too' : 'nothing booked in',
        route: '/realestate/viewings',
      });
    }

    if (d.developmentEnabled) {
      cards.push({
        label: 'Holds expiring today',
        value: d.holdsExpiringToday,
        icon: 'timer',
        tone: d.holdsExpiringToday > 0 ? 'warning' : 'neutral',
        hint: 'units back on sale at midnight',
        route: '/realestate/inventory/holds',
      });
    }

    cards.push({
      label: 'Collected today',
      value: this.money(d.collectedToday),
      icon: 'payments',
      tone: 'positive',
      hint: d.receiptsToday + (d.receiptsToday === 1 ? ' receipt' : ' receipts'),
      route: '/realestate/money/receipts',
    });

    cards.push({
      label: 'Due today',
      value: this.money(d.demandsDueToday),
      icon: 'schedule',
      hint: 'demands falling due',
      route: '/realestate/money/demands',
    });

    if (d.estateManagementEnabled) {
      cards.push({
        label: 'Inside the gate',
        value: d.visitorsInsideNow,
        icon: 'badge',
        hint: 'visitors not yet signed out',
        route: '/realestate/society',
      });
    }

    return cards;
  });

  /** The bands below. Each one is a line of business; absent lines are not drawn at all. */
  readonly bands = computed<Band[]>(() => {
    const d = this.data();
    if (!d) return [];

    const bands: Band[] = [];

    if (d.developmentEnabled) {
      bands.push({
        key: 'development',
        title: 'Sales and inventory',
        note: 'Absorption is units taken out of the market, not money received. The two diverge '
          + 'when bookings are being cancelled, which is why cancellations sit beside it.',
        stats: [
          {
            label: 'Units', value: d.totalUnits, icon: 'grid_view',
            hint: d.unitsAvailable + ' still available',
          },
          {
            label: 'Absorption', value: this.pct(d.absorptionPercent), icon: 'trending_up',
            tone: 'accent', hint: d.unitsSold + ' sold, ' + d.unitsBooked + ' booked',
          },
          {
            label: 'Booked this month', value: this.money(d.bookingValueThisMonth), icon: 'sell',
            hint: this.compare(d.bookingValueThisMonth, d.bookingValueLastMonth),
          },
          {
            label: 'Cancellations', value: d.cancellationsThisMonth, icon: 'undo',
            hint: 'this month', tone: d.cancellationsThisMonth > 0 ? 'warning' : 'neutral',
          },
          {
            label: 'Outstanding', value: this.money(d.totalOutstanding),
            icon: 'account_balance_wallet', hint: this.money(d.overdueAmount) + ' overdue',
            tone: d.overdueAmount > 0 ? 'danger' : 'neutral',
          },
          {
            label: 'In escrow', value: this.money(d.escrowBalance), icon: 'lock',
            hint: 'held for buyers',
          },
        ],
      });
    }

    if (d.brokerageEnabled) {
      bands.push({
        key: 'brokerage',
        title: 'Brokerage',
        note: 'Fall-through is the share of agreed deals that did not complete. Above about a '
          + 'third, the cause is usually qualification rather than bad luck.',
        stats: [
          {
            label: 'Live listings', value: d.liveListings, icon: 'storefront',
            route: '/realestate/listings',
          },
          {
            label: 'Open enquiries', value: d.openEnquiries, icon: 'forum',
            hint: d.leadsBreachingSla
              ? d.leadsBreachingSla + ' past the promise'
              : 'all within the promise',
            tone: d.leadsBreachingSla > 0 ? 'warning' : 'neutral',
            route: '/realestate/enquiries',
          },
          {
            label: 'Deals in progress', value: d.dealsInProgress, icon: 'handshake',
            hint: this.money(d.pipelineValue) + ' pipeline', route: '/realestate/brokerage/deals',
          },
          {
            label: 'Commission', value: this.money(d.commissionEarnedThisMonth), icon: 'percent',
            hint: 'earned this month', tone: 'positive',
          },
          {
            label: 'Fall-through', value: this.pct(d.fallThroughRatePercent), icon: 'link_off',
            hint: 'of agreed deals', tone: d.fallThroughRatePercent > 30 ? 'warning' : 'neutral',
          },
        ],
      });
    }

    if (d.estateManagementEnabled) {
      bands.push({
        key: 'estate',
        title: 'Lettings and management',
        note: 'Rent roll is contracted rent on today’s terms, not what was collected. '
          + 'Arrears and voids are the two ways it fails to arrive.',
        stats: [
          {
            label: 'Rent roll', value: this.money(d.monthlyRentRoll), icon: 'real_estate_agent',
            hint: d.activeTenancies + ' active tenancies',
          },
          {
            label: 'Occupancy', value: this.pct(d.occupancyPercent), icon: 'domain',
            hint: d.voidUnits + ' void', tone: d.occupancyPercent >= 95 ? 'positive' : 'neutral',
          },
          {
            label: 'Arrears', value: this.money(d.rentArrears), icon: 'money_off',
            tone: d.rentArrears > 0 ? 'danger' : 'positive',
          },
          {
            label: 'Expiring', value: d.tenanciesExpiringIn90Days, icon: 'event_busy',
            hint: 'within 90 days', tone: d.tenanciesExpiringIn90Days > 0 ? 'warning' : 'neutral',
            route: '/realestate/leasing/renewals',
          },
          {
            label: 'Certificates', value: d.complianceCertificatesExpiring, icon: 'verified',
            hint: 'expiring soon',
            tone: d.complianceCertificatesExpiring > 0 ? 'danger' : 'positive',
            route: '/realestate/compliance/calendar',
          },
          {
            label: 'Complaints', value: d.openComplaints, icon: 'report',
            hint: d.complaintsBreachingSla
              ? d.complaintsBreachingSla + ' past the promise'
              : 'all within the promise',
            tone: d.complaintsBreachingSla > 0 ? 'danger' : 'neutral',
            route: '/realestate/society',
          },
        ],
      });
    }

    if (d.contractingEnabled) {
      bands.push({
        key: 'contracting',
        title: 'Construction',
        note: 'Progress is physical completion weighted by value. Retention is money already '
          + 'earned but withheld until the defects period ends.',
        stats: [
          {
            label: 'Active projects', value: d.activeConstructionProjects, icon: 'construction',
            route: '/realestate/construction',
          },
          {
            label: 'Physical progress', value: this.pct(d.averagePhysicalProgressPercent),
            icon: 'engineering', hint: 'weighted by value', tone: 'accent',
          },
          {
            label: 'Certified', value: this.money(d.certifiedValueThisMonth), icon: 'task_alt',
            hint: 'this month',
          },
          {
            label: 'Retention held', value: this.money(d.retentionHeld), icon: 'savings',
            hint: 'released after defects',
          },
          {
            label: 'Open variations', value: d.openVariations, icon: 'edit_note',
            hint: 'not yet priced or agreed',
            tone: d.openVariations > 0 ? 'warning' : 'neutral',
            route: '/realestate/build/variations',
          },
          {
            label: 'At risk of delay', value: d.projectsAtRiskOfDelay, icon: 'warning',
            tone: d.projectsAtRiskOfDelay > 0 ? 'danger' : 'positive',
          },
        ],
      });
    }

    return bands;
  });

  readonly collectionTrend = computed<TrendPoint[]>(() =>
    (this.data()?.collectionTrend ?? []).map(p => ({
      label: p.label, value: p.value, secondaryValue: p.secondaryValue ?? null,
    })));

  readonly bookingTrend = computed<TrendPoint[]>(() =>
    (this.data()?.bookingTrend ?? []).map(p => ({
      label: p.label, value: p.value, secondaryValue: p.secondaryValue ?? null,
    })));

  readonly inventory = computed<BreakdownSlice[]>(() =>
    (this.data()?.inventoryByStatus ?? []).map(s => this.slice(s)));

  readonly leadSources = computed<BreakdownSlice[]>(() =>
    (this.data()?.leadsBySource ?? []).map(s => this.slice(s)));

  readonly collectionEfficiency = computed(() => this.data()?.collectionEfficiencyPercent ?? 0);

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.reports.getDashboard(
      this.ctx.officeId() ?? undefined,
      this.ctx.projectId() ?? undefined,
    )).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.error.set('We could not load the dashboard. Nothing below is being shown.');

    this.loading.set(false);
  }

  onProject(): void {
    void this.load();
  }

  go(item: M.AttentionItemDto): void {
    if (item.route) void this.router.navigateByUrl(item.route);
  }

  severityTone(s: AlertSeverity): 'danger' | 'warning' | 'accent' {
    if (s === AlertSeverity.Critical) return 'danger';
    return s === AlertSeverity.Warning ? 'warning' : 'accent';
  }

  severityLabel(s: AlertSeverity): string {
    if (s === AlertSeverity.Critical) return 'Today';
    return s === AlertSeverity.Warning ? 'This week' : 'Note';
  }

  private slice(s: M.BreakdownSliceDto): BreakdownSlice {
    return {
      label: s.label, value: s.value, percent: s.percent, count: s.count, tone: s.tone ?? null,
    };
  }

  /** Compact money, because a dashboard tile is not the place for eight significant figures. */
  money(v: number | undefined): string {
    const n = v ?? 0;
    const abs = Math.abs(n);
    const c = this.ctx.currency();
    if (abs >= 1_000_000_000) return c + ' ' + (n / 1_000_000_000).toFixed(2) + 'bn';
    if (abs >= 1_000_000) return c + ' ' + (n / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (n / 1_000).toFixed(1) + 'k';
    return c + ' ' + n.toFixed(0);
  }

  pct(v: number | undefined): string {
    return (v ?? 0).toFixed(1) + '%';
  }

  private compare(now: number, before: number): string {
    if (!before) return 'no comparison yet';
    const change = ((now - before) / Math.abs(before)) * 100;
    return (change >= 0 ? 'up ' : 'down ') + Math.abs(change).toFixed(0) + '% on last month';
  }
}
