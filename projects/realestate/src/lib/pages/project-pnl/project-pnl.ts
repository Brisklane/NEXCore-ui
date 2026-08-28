import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FinanceService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import { RECOGNITION_BASIS_LABELS, RecognitionBasis } from '../../models/realestate.enums';
import {
  BreakdownComponent, EmptyStateComponent, ProgressComponent, SkeletonComponent,
  StatsComponent, ToastComponent, TrendComponent, type BreakdownSlice, type StatCard,
  type TrendPoint,
} from '../shared/ui';
import { ProjectPickerComponent } from '../shared/project-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';

/* =====================================================================================
 * Project profit and loss.
 *
 * The screen a finance director opens before a board meeting. It answers one question — is this
 * scheme making money — and then shows the four figures that decide the answer.
 *
 * The distinction it insists on is between money and revenue. Collections are cash received.
 * Revenue recognised is what may be reported as income under the recognition basis the project
 * uses: over time as the building goes up, or at a point in time on handover. On an off-plan
 * scheme these two numbers can differ by a very large amount, in either direction, and confusing
 * them is how a developer concludes it is profitable while running out of cash.
 *
 * The unit table underneath shows where margin is actually made and lost. Discounts given on a
 * handful of units at launch routinely account for the whole difference between the forecast and
 * the outturn.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-project-pnl',
  imports: [
    CommonModule, FormsModule, StatsComponent, ProgressComponent, TrendComponent,
    BreakdownComponent, SkeletonComponent, EmptyStateComponent, ToastComponent,
    ProjectPickerComponent, PageHelpComponent, SectionComponent, FactsComponent,
  ],
  templateUrl: './project-pnl.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './project-pnl.css',
  ],
})
export class ProjectPnlComponent implements OnInit {
  private finance = inject(FinanceService);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.ProjectPnlDto | null>(null);
  readonly units = signal<M.UnitProfitabilityDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly asOf = signal(new Date().toISOString().slice(0, 10));
  readonly unitSort = signal<'margin' | 'marginPercent' | 'discount' | 'unit'>('margin');

  readonly headline = computed<StatCard[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Sales value', value: this.money(d.totalSalesValue), icon: 'sell',
        hint: d.unitsSold + ' of ' + d.unitsTotal + ' units sold',
      },
      {
        label: 'Revenue recognised', value: this.money(d.revenueRecognised), icon: 'insights',
        hint: this.money(d.revenueDeferred) + ' deferred',
      },
      {
        label: 'Collected', value: this.money(d.collectionsToDate), icon: 'payments',
        tone: 'positive', hint: 'cash actually received',
      },
      {
        label: 'Cost incurred', value: this.money(d.costIncurred), icon: 'construction',
        hint: this.money(d.forecastTotalCost) + ' forecast total',
      },
      {
        label: 'Gross margin', value: this.money(d.grossMargin), icon: 'trending_up',
        tone: d.grossMargin < 0 ? 'danger' : 'positive',
        hint: d.marginPercent.toFixed(1) + '% recognised to date',
      },
      {
        label: 'Forecast margin', value: this.money(d.forecastMargin), icon: 'query_stats',
        tone: d.forecastMargin < 0 ? 'danger' : 'accent',
        hint: 'at completion',
      },
    ];
  });

  readonly cash = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'In escrow', value: this.money(d.escrowBalance),
        hint: 'released only against certified progress',
      },
      {
        label: 'Freely available', value: this.money(d.freeCashBalance),
        tone: d.freeCashBalance < 0 ? 'danger' : 'positive',
      },
      {
        label: 'Loan outstanding', value: this.money(d.loanOutstanding),
        tone: d.loanOutstanding > 0 ? 'warning' : 'neutral',
      },
      {
        label: 'Owed to the landowner', value: this.money(d.landownerLiability),
        hint: 'joint venture share not yet settled',
      },
      {
        label: 'Work in progress', value: this.money(d.wipBalance),
        hint: 'cost incurred but not yet recognised against revenue',
      },
    ];
  });

  readonly accounting = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Recognition basis', value: RECOGNITION_BASIS_LABELS[d.recognitionBasis],
        hint: d.recognitionBasis === RecognitionBasis.OverTime
          ? 'revenue accrues as the building goes up'
          : 'revenue waits until control passes to the buyer',
        wide: true,
      },
      { label: 'Revenue recognised', value: this.money(d.revenueRecognised) },
      { label: 'Revenue deferred', value: this.money(d.revenueDeferred) },
      { label: 'Cost recognised', value: this.money(d.costRecognised) },
      { label: 'Cost incurred', value: this.money(d.costIncurred) },
      {
        label: 'Difference', value: this.money(d.costIncurred - d.costRecognised),
        hint: 'sits in work in progress until the matching revenue is recognised',
      },
    ];
  });

  readonly costBreakdown = computed<BreakdownSlice[]>(() => {
    const lines = this.data()?.costBreakdown ?? [];
    const total = lines.reduce((sum, l) => sum + (l.forecastAmount || l.budgetAmount), 0) || 1;

    return lines.map(l => {
      const value = l.forecastAmount || l.budgetAmount;
      return {
        label: l.costHead,
        value,
        percent: (value / total) * 100,
        count: 0,
        tone: l.actualAmount > l.budgetAmount ? 'danger' : null,
      };
    });
  });

  readonly revenueTrend = computed<TrendPoint[]>(() =>
    (this.data()?.revenueTrend ?? []).map(p => ({
      label: p.label, value: p.value, secondaryValue: p.secondaryValue ?? null,
    })));

  /** Sorted so the units that cost the most margin sit at the top by default. */
  readonly sortedUnits = computed(() => {
    const key = this.unitSort();

    return [...this.units()].sort((a, b) => {
      switch (key) {
        case 'marginPercent': return a.marginPercent - b.marginPercent;
        case 'discount': return b.discountGiven - a.discountGiven;
        case 'unit': return a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true });
        default: return a.grossMargin - b.grossMargin;
      }
    });
  });

  readonly unitTotals = computed(() => {
    const rows = this.units();

    return {
      count: rows.length,
      listPrice: rows.reduce((s, r) => s + r.listPrice, 0),
      discount: rows.reduce((s, r) => s + r.discountGiven, 0),
      revenue: rows.reduce((s, r) => s + r.totalRevenue, 0),
      cost: rows.reduce((s, r) => s + r.totalCost, 0),
      margin: rows.reduce((s, r) => s + r.grossMargin, 0),
      lossMakers: rows.filter(r => r.grossMargin < 0).length,
    };
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const projectId = this.ctx.projectId();
    if (!projectId) {
      this.data.set(null);
      this.units.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const [pnl, units] = await Promise.all([
      firstValueFrom(this.finance.getProjectPnl(projectId, this.asOf())).catch(() => null),
      firstValueFrom(this.finance.getUnitProfitability(projectId, { pageSize: 500 }))
        .catch(() => null),
    ]);

    if (pnl?.data) this.data.set(pnl.data);
    else this.error.set('We could not build the profit and loss for this project.');

    this.units.set(units?.data ?? []);
    this.loading.set(false);
  }

  onProject(): void {
    void this.load();
  }

  /**
   * Exports the unit table as it stands. Finance directors reconcile in a spreadsheet whatever
   * the screen shows, so the export has to be the same figures rather than a fresh query.
   */
  exportUnits(): void {
    const rows = this.sortedUnits();
    if (!rows.length) return;

    const header = [
      'Unit', 'Block', 'List price', 'Discount', 'Net realisation', 'Surcharge',
      'Total revenue', 'Allocated cost', 'Direct cost', 'Total cost', 'Gross margin',
      'Margin %', 'Realisation per sq ft', 'Cost per sq ft', 'Margin per sq ft',
    ];

    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.unitNumber, r.blockName ?? '', r.listPrice, r.discountGiven, r.netRealisation,
        r.surchargeEarned, r.totalRevenue, r.allocatedCost, r.directCost, r.totalCost,
        r.grossMargin, r.marginPercent.toFixed(2), r.realisationPerSqFt, r.costPerSqFt,
        r.marginPerSqFt,
      ].join(',')),
    ];

    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unit-profitability-' + this.asOf() + '.csv';
    a.click();
    URL.revokeObjectURL(url);

    this.toast.set('Downloaded ' + rows.length + ' units.');
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.data()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) return c + ' ' + (v / 1_000_000_000).toFixed(2) + 'bn';
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 10_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  exact(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    return (this.data()?.currencyCode ?? this.ctx.currency()) + ' '
      + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
