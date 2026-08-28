import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProjectService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  APPROVAL_KIND_LABELS, APPROVAL_STATE_LABELS, COST_ALLOCATION_BASIS_LABELS,
  MILESTONE_STATUS_LABELS, MilestoneStatus, PROJECT_KIND_LABELS, PROJECT_NODE_KIND_LABELS,
  PROJECT_STATUS_LABELS, RECOGNITION_BASIS_LABELS,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import {
  FactsComponent, MiniListComponent, SectionComponent, type Fact, type MiniRow,
} from '../shared/detail-bits';
import { ProgressComponent, ToastComponent } from '../shared/ui';

/* =====================================================================================
 * A project.
 *
 * A scheme being sold, built, or both. Four things determine whether it is going well, and they
 * are the four figures in the header: how much has been sold, how much of that money has arrived,
 * how far along the building is, and whether the handover date still holds.
 *
 * The milestone tab is the one that matters operationally, because in a construction-linked plan
 * certifying a milestone raises money. That figure is stated on each milestone before it is
 * certified, so nobody certifies a milestone without knowing what it will invoice.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-project-detail',
  imports: [
    CommonModule, DetailPageComponent, SectionComponent, FactsComponent, MiniListComponent,
    ProgressComponent, ToastComponent,
  ],
  templateUrl: './project-detail.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './project-detail.css',
  ],
})
export class ProjectDetailComponent implements OnInit {
  private projects = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ProjectDetailDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('overview');

  readonly blockingApprovals = computed(() =>
    (this.data()?.approvals ?? []).filter(a => a.isBlocking));

  readonly slippedMilestones = computed(() =>
    (this.data()?.milestones ?? []).filter(m => (m.slipDays ?? 0) > 0));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'overview', label: 'Overview', icon: 'info' },
      { key: 'structure', label: 'Structure', icon: 'account_tree', count: d.structure.length },
      { key: 'milestones', label: 'Milestones', icon: 'flag',
        count: this.slippedMilestones().length,
        tone: this.slippedMilestones().length ? 'warning' : 'neutral' },
      { key: 'approvals', label: 'Approvals', icon: 'gavel',
        count: this.blockingApprovals().length,
        tone: this.blockingApprovals().length ? 'danger' : 'neutral' },
      { key: 'area', label: 'Area statement', icon: 'straighten' },
      { key: 'team', label: 'Team', icon: 'groups', count: d.team.length },
      { key: 'marketing', label: 'Marketing', icon: 'campaign' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: PROJECT_STATUS_LABELS[d.status] },
      { label: PROJECT_KIND_LABELS[d.kind] },
    ];

    if (d.hasJointVenture) pills.push({ label: 'Joint venture', icon: 'handshake' });
    if (d.registrationNumber) {
      pills.push({ label: 'Registered ' + d.registrationNumber, tone: 'positive', icon: 'verified' });
    }
    if (this.blockingApprovals().length) {
      pills.push({ label: 'Approval outstanding', tone: 'danger', icon: 'block' });
    }
    if ((d.slipDays ?? 0) > 0) {
      pills.push({ label: this.slipText(d.slipDays!), tone: 'danger', icon: 'schedule' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Sold', value: d.absorptionPercent.toFixed(1) + '%',
        hint: d.unitsSold + ' sold, ' + d.unitsBooked + ' booked of ' + d.totalUnits,
      },
      {
        label: 'Collected', value: this.money(d.totalCollected),
        hint: this.money(d.outstanding) + ' still owed',
      },
      {
        label: 'Built', value: d.physicalProgressPercent.toFixed(0) + '%',
        hint: 'weighted by value',
      },
      {
        label: 'Handover',
        value: d.forecastPossessionDate
          ? new Date(d.forecastPossessionDate).toLocaleDateString()
          : (d.promisedPossessionDate
            ? new Date(d.promisedPossessionDate).toLocaleDateString() : '—'),
        hint: (d.slipDays ?? 0) > 0 ? this.slipText(d.slipDays!) : 'on programme',
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => [
    { key: 'inventory', label: 'Inventory', icon: 'grid_view', tone: 'primary' },
    { key: 'pnl', label: 'Profit and loss', icon: 'analytics' },
    { key: 'edit', label: 'Edit', icon: 'edit' },
  ]);

  // ── Tab contents ──────────────────────────────────────────────────

  readonly identity = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Code', value: d.code },
      { label: 'Kind', value: PROJECT_KIND_LABELS[d.kind] },
      { label: 'Status', value: PROJECT_STATUS_LABELS[d.status] },
      { label: 'City', value: d.city },
      { label: 'Area', value: d.areaName },
      { label: 'Address', value: d.addressLine, wide: true },
      { label: 'Regulator', value: d.regulatorName },
      { label: 'Registration', value: d.registrationNumber },
      {
        label: 'Registration valid until',
        value: d.registrationValidUntil
          ? new Date(d.registrationValidUntil).toLocaleDateString() : null,
      },
    ];
  });

  readonly dates = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    const on = (v?: string) => v ? new Date(v).toLocaleDateString() : null;

    return [
      { label: 'Launched', value: on(d.launchDate) },
      { label: 'Bookings opened', value: on(d.bookingOpenDate) },
      { label: 'Construction started', value: on(d.constructionStartDate) },
      { label: 'Planned completion', value: on(d.plannedCompletionDate) },
      { label: 'Actual completion', value: on(d.actualCompletionDate) },
      { label: 'Promised possession', value: on(d.promisedPossessionDate) },
      {
        label: 'Forecast possession', value: on(d.forecastPossessionDate),
        tone: (d.slipDays ?? 0) > 0 ? 'danger' : 'positive',
        hint: (d.slipDays ?? 0) > 0 ? this.slipText(d.slipDays!) : null,
      },
      { label: 'Handed to society', value: on(d.handoverToSocietyDate) },
    ];
  });

  readonly commercial = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Sales value', value: this.money(d.totalSalesValue) },
      { label: 'Collected', value: this.money(d.totalCollected), tone: 'positive' },
      {
        label: 'Outstanding', value: this.money(d.outstanding),
        tone: d.outstanding > 0 ? 'warning' : 'positive',
      },
      { label: 'Budget', value: this.money(d.totalBudget) },
      { label: 'Escrow held', value: this.money(d.escrowBalance) },
      {
        label: 'Escrow share',
        value: d.escrowPercent !== undefined ? d.escrowPercent + '%' : null,
        hint: 'of each receipt',
      },
      {
        label: 'Revenue recognised',
        value: RECOGNITION_BASIS_LABELS[d.recognitionBasis],
        hint: d.recognitionRationale ?? null, wide: true,
      },
      { label: 'Costs allocated', value: COST_ALLOCATION_BASIS_LABELS[d.costAllocationBasis] },
      { label: 'Default plan', value: d.defaultPaymentPlanName },
      { label: 'Hold length', value: d.holdHours + ' hours' },
      {
        label: 'Transfer fee',
        value: d.transferFeePerSqFt
          ? this.money(d.transferFeePerSqFt) + ' per sq ft'
          : (d.transferFeeFlat ? this.money(d.transferFeeFlat) + ' flat' : 'None'),
      },
    ];
  });

  readonly areaFacts = computed<Fact[]>(() => {
    const a = this.data()?.areaStatement;
    if (!a) return [];

    return [
      { label: 'Total land', value: a.totalLandArea.displayText },
      {
        label: 'Saleable', value: a.saleableArea.displayText,
        hint: a.saleablePercent.toFixed(1) + '% of the site',
      },
      { label: 'Common', value: a.commonArea.displayText },
      { label: 'Roads', value: a.roadsArea.displayText },
      { label: 'Parks', value: a.parksArea.displayText },
      { label: 'Amenities', value: a.amenitiesArea.displayText },
      { label: 'Commercial reserve', value: a.commercialReserve.displayText },
      { label: 'Utilities', value: a.utilitiesArea.displayText },
    ];
  });

  readonly milestones = computed<MiniRow[]>(() =>
    (this.data()?.milestones ?? []).map(m => ({
      id: m.id,
      title: m.name + (m.blockName ? ' — ' + m.blockName : ''),
      sub: [
        MILESTONE_STATUS_LABELS[m.status],
        m.weightPercent ? m.weightPercent.toFixed(1) + '% of the build' : null,
        m.certifiedByName ? 'certified by ' + m.certifiedByName : null,
      ].filter(Boolean).join(' · '),
      meta: m.reachedOn
        ? 'reached ' + new Date(m.reachedOn).toLocaleDateString()
        : (m.forecastDate ? 'forecast ' + new Date(m.forecastDate).toLocaleDateString() : null),
      value: m.linkedDemandValue ? this.money(m.linkedDemandValue) : null,
      valueSub: m.linkedInstalmentCount
        ? (m.demandsRaised ? 'already demanded' : 'would be demanded')
        : null,
      tone: (m.slipDays ?? 0) > 0 ? 'warn'
        : m.status === MilestoneStatus.Certified ? 'good' : 'neutral',
      icon: m.status === MilestoneStatus.Certified ? 'task_alt' : 'flag',
    })));

  readonly approvals = computed<MiniRow[]>(() =>
    (this.data()?.approvals ?? []).map(a => ({
      id: a.id,
      title: APPROVAL_KIND_LABELS[a.kind],
      sub: [a.authority, a.approvalNumber ?? a.applicationNumber].filter(Boolean).join(' · ') || null,
      meta: APPROVAL_STATE_LABELS[a.state]
        + (a.validUntil ? ', valid to ' + new Date(a.validUntil).toLocaleDateString() : ''),
      value: a.totalCost ? this.money(a.totalCost) : null,
      valueSub: a.blocksMilestoneName ? 'blocks ' + a.blocksMilestoneName : null,
      tone: a.isBlocking ? 'alert' : a.isOverdue ? 'warn' : 'good',
      icon: a.isBlocking ? 'block' : 'gavel',
    })));

  readonly team = computed<MiniRow[]>(() =>
    (this.data()?.team ?? []).map(t => ({
      id: t.id,
      title: t.name ?? t.role,
      sub: t.name ? t.role : null,
      meta: [t.phone, t.email].filter(Boolean).join(' · ') || null,
      icon: 'person',
    })));

  /** Flattens the block/floor tree for display, keeping the depth for indentation. */
  readonly flatStructure = computed(() => {
    const out: M.ProjectNodeDto[] = [];

    const walk = (nodes: M.ProjectNodeDto[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) walk(n.children);
      }
    };

    walk(this.data()?.structure ?? []);
    return out;
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

    const res = await firstValueFrom(this.projects.get(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    // Switching the scoped project keeps the inventory board and the P&L on this scheme.
    this.ctx.setProject(d.id);

    if (key === 'inventory') void this.router.navigateByUrl('/realestate/inventory');
    else if (key === 'pnl') void this.router.navigateByUrl('/realestate/finance/pnl');
    else if (key === 'edit') {
      void this.router.navigate(['/realestate/projects'], { queryParams: { edit: d.id } });
    }
  }

  nodeKind(n: M.ProjectNodeDto): string {
    return PROJECT_NODE_KIND_LABELS[n.kind] ?? '';
  }

  private slipText(days: number): string {
    if (days < 30) return days + ' days behind';
    const months = Math.round(days / 30);
    return months + (months === 1 ? ' month behind' : ' months behind');
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toFixed(0);
  }
}
