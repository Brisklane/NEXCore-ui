import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistributionReportService } from '../../services/distribution.services';
import {
  ClaimsReportDto, DistributionReportFilter, LogisticsReportDto, OutletAnalyticsDto,
  ProductivityReportDto, RankedRowDto, ReceivablesReportDto, ReturnsReportDto,
  SalesReportDto, StockReportDto, TrendPointDto,
} from '../../models/distribution.models';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent } from '../shared/ui-bits';

type Report = 'sales' | 'productivity' | 'outlets' | 'logistics' | 'receivables' | 'returns' | 'claims' | 'stock';

/**
 * The analytical set.
 *
 * Period and scope are set once at the top and carry across every report, because the commonest
 * analysis mistake is comparing a sales report for one month against a receivables report for
 * another and concluding something false with great confidence.
 *
 * Coverage numbers use the standard trade definitions — outlets billed over outlets covered,
 * lines per call, drop size — rather than a house variant, so they can be argued about with a
 * distributor using the same words.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-reports',
  imports: [CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent, EmptyStateComponent],
  templateUrl: './reports.html',
  styleUrls: ['../distribution-shared.css', './reports.css'],
})
export class DistributionReportsComponent implements OnInit {
  private reports = inject(DistributionReportService);
  private cdr = inject(ChangeDetectorRef);

  report: Report = 'sales';
  groupBy = 'Outlet';

  sales: SalesReportDto | null = null;
  productivity: ProductivityReportDto | null = null;
  outlets: OutletAnalyticsDto | null = null;
  logistics: LogisticsReportDto | null = null;
  receivables: ReceivablesReportDto | null = null;
  returns: ReturnsReportDto | null = null;
  claims: ClaimsReportDto | null = null;
  stock: StockReportDto | null = null;

  loading = false;
  error = '';

  filter: DistributionReportFilter = {};

  readonly reportList: { key: Report; label: string; icon: string }[] = [
    { key: 'sales', label: 'Sales', icon: 'trending_up' },
    { key: 'productivity', label: 'Coverage & productivity', icon: 'groups' },
    { key: 'outlets', label: 'Outlet universe', icon: 'storefront' },
    { key: 'logistics', label: 'Logistics', icon: 'local_shipping' },
    { key: 'receivables', label: 'Receivables', icon: 'account_balance' },
    { key: 'returns', label: 'Returns', icon: 'assignment_return' },
    { key: 'claims', label: 'Claims', icon: 'gavel' },
    { key: 'stock', label: 'Stock', icon: 'inventory' },
  ];

  readonly groupOptions = ['Outlet', 'Route', 'Territory', 'Rep', 'Partner', 'Brand', 'Item', 'Channel'];

  async ngOnInit(): Promise<void> {
    // Nothing loads until a scope arrives, so the first render is never a wrong-period number.
  }

  async onScope(scope: { territoryId: string | null; from: string; to: string }): Promise<void> {
    this.filter = {
      ...this.filter,
      territoryId: scope.territoryId ?? undefined,
      from: scope.from,
      to: scope.to,
    };
    await this.run();
  }

  async setReport(report: Report): Promise<void> {
    this.report = report;
    await this.run();
  }

  async run(): Promise<void> {
    if (!this.filter.from) return;

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    switch (this.report) {
      case 'sales': {
        const res = await firstValueFrom(this.reports.sales(this.filter, this.groupBy)).catch(() => null);
        this.sales = res?.data ?? null;
        if (!res) this.error = 'Could not run the sales report.';
        break;
      }
      case 'productivity': {
        const res = await firstValueFrom(this.reports.productivity(this.filter)).catch(() => null);
        this.productivity = res?.data ?? null;
        break;
      }
      case 'outlets': {
        const res = await firstValueFrom(this.reports.outlets(this.filter)).catch(() => null);
        this.outlets = res?.data ?? null;
        break;
      }
      case 'logistics': {
        const res = await firstValueFrom(this.reports.logistics(this.filter)).catch(() => null);
        this.logistics = res?.data ?? null;
        break;
      }
      case 'receivables': {
        const res = await firstValueFrom(this.reports.receivables(this.filter)).catch(() => null);
        this.receivables = res?.data ?? null;
        break;
      }
      case 'returns': {
        const res = await firstValueFrom(this.reports.returns(this.filter)).catch(() => null);
        this.returns = res?.data ?? null;
        break;
      }
      case 'claims': {
        const res = await firstValueFrom(this.reports.claims(this.filter)).catch(() => null);
        this.claims = res?.data ?? null;
        break;
      }
      case 'stock': {
        const res = await firstValueFrom(this.reports.stock(this.filter)).catch(() => null);
        this.stock = res?.data ?? null;
        break;
      }
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  /**
   * Exports whatever is on screen, filters and all, as CSV. Deliberately client-side: the point
   * is that what somebody downloads is exactly the view they were looking at.
   */
  exportRows(rows: RankedRowDto[], name: string): void {
    const header = ['Rank', 'Name', 'Detail', 'Value', 'Quantity', 'Share %', 'Growth %'];
    const body = rows.map(r => [
      r.rank, r.name, r.subLabel ?? '', r.value, r.quantity, r.sharePercent, r.growthPercent,
    ]);

    const csv = [header, ...body]
      .map(line => line.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}-${this.filter.from}-to-${this.filter.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Chart helpers ──────────────────────────────────────────────────────────

  peak(points: TrendPointDto[]): number {
    return Math.max(1, ...points.map(p => Math.max(p.value, p.comparison)));
  }

  barHeight(p: TrendPointDto, points: TrendPointDto[]): number {
    return Math.max(2, Math.round((p.value / this.peak(points)) * 100));
  }

  comparisonHeight(p: TrendPointDto, points: TrendPointDto[]): number {
    return Math.max(1, Math.round((p.comparison / this.peak(points)) * 100));
  }

  rowWidth(row: RankedRowDto, rows: RankedRowDto[]): number {
    const peak = Math.max(1, ...rows.map(r => r.value));
    return Math.max(2, Math.round((row.value / peak) * 100));
  }

  coverageTone(percent: number): string {
    if (percent >= 90) return 'is-high';
    if (percent >= 70) return 'is-mid';
    return percent > 0 ? 'is-low' : 'is-none';
  }

  trackTrend = (_: number, p: TrendPointDto) => p.bucket;
  trackRow = (_: number, r: RankedRowDto) => r.id ?? r.name;
  trackIndex = (i: number) => i;
}
