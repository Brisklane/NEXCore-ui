import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RestaurantReportService } from '../../services/restaurant.services';
import {
  KitchenPerformanceDto, MenuEngineeringReportDto, MenuEngineeringRowDto, ReportFilterDto,
  SalesSummaryReportDto, TableTurnoverDto, VoidAuditRowDto, WaiterPerformanceDto, WastageSummaryDto,
} from '../../models/restaurant.models';
import {
  MENU_CLASS_LABELS, MenuEngineeringClass, TENDER_LABELS,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';

type Report = 'sales' | 'menu' | 'waiters' | 'tables' | 'kitchen' | 'audit' | 'wastage';

/**
 * The reporting suite.
 *
 * Menu engineering is the one worth reading first: it places every dish on popularity against
 * contribution margin and labels it Star, Plowhorse, Puzzle or Dog, with a plain-language next
 * step. That turns "this sold forty" into "re-cost this or take it off", which is the only form
 * of a sales report anybody acts on.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-reports',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent],
  templateUrl: './reports.html',
  styleUrls: ['../restaurant-shared.css', './reports.css'],
})
export class ReportsComponent {
  private reports = inject(RestaurantReportService);
  private cdr = inject(ChangeDetectorRef);

  active: Report = 'sales';
  outletId: string | null = null;

  from = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
  to = new Date().toISOString().slice(0, 10);

  sales: SalesSummaryReportDto | null = null;
  menu: MenuEngineeringReportDto | null = null;
  waiters: WaiterPerformanceDto[] = [];
  tables: TableTurnoverDto[] = [];
  kitchen: KitchenPerformanceDto[] = [];
  audit: VoidAuditRowDto[] = [];
  wastage: WastageSummaryDto[] = [];

  loading = false;
  error = '';

  readonly classLabels = MENU_CLASS_LABELS;
  readonly tenderLabels = TENDER_LABELS;
  readonly MenuClass = MenuEngineeringClass;

  readonly tabs: { key: Report; label: string; icon: string }[] = [
    { key: 'sales', label: 'Sales', icon: 'payments' },
    { key: 'menu', label: 'Menu engineering', icon: 'insights' },
    { key: 'waiters', label: 'Servers', icon: 'badge' },
    { key: 'tables', label: 'Table turnover', icon: 'table_restaurant' },
    { key: 'kitchen', label: 'Kitchen', icon: 'skillet' },
    { key: 'audit', label: 'Voids & discounts', icon: 'gavel' },
    { key: 'wastage', label: 'Wastage', icon: 'delete_sweep' },
  ];

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    await this.run();
  }

  private get filter(): ReportFilterDto {
    return {
      outletId: this.outletId,
      from: new Date(this.from).toISOString(),
      to: new Date(this.to + 'T23:59:59').toISOString(),
      top: 50,
    };
  }

  async select(report: Report): Promise<void> {
    this.active = report;
    await this.run();
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';

    const f = this.filter;

    try {
      switch (this.active) {
        case 'sales':
          this.sales = (await firstValueFrom(this.reports.salesSummary(f)))?.data ?? null;
          break;
        case 'menu':
          this.menu = (await firstValueFrom(this.reports.menuEngineering(f)))?.data ?? null;
          break;
        case 'waiters':
          this.waiters = (await firstValueFrom(this.reports.waiterPerformance(f)))?.data ?? [];
          break;
        case 'tables':
          this.tables = (await firstValueFrom(this.reports.tableTurnover(f)))?.data ?? [];
          break;
        case 'kitchen':
          this.kitchen = (await firstValueFrom(this.reports.kitchenPerformance(f)))?.data ?? [];
          break;
        case 'audit':
          this.audit = (await firstValueFrom(this.reports.voidAudit(f)))?.data ?? [];
          break;
        case 'wastage':
          this.wastage = (await firstValueFrom(this.reports.wastageSummary(f)))?.data ?? [];
          break;
      }
    } catch {
      this.error = 'Could not load that report.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Menu engineering plot ──────────────────────────────────────────

  rowsIn(cls: MenuEngineeringClass): MenuEngineeringRowDto[] {
    return (this.menu?.rows ?? []).filter(r => r.classification === cls);
  }

  classTone(cls: MenuEngineeringClass): string {
    switch (cls) {
      case MenuEngineeringClass.Star: return 'tone-success';
      case MenuEngineeringClass.Plowhorse: return 'tone-warning';
      case MenuEngineeringClass.Puzzle: return 'tone-info';
      default: return 'tone-danger';
    }
  }

  classHint(cls: MenuEngineeringClass): string {
    switch (cls) {
      case MenuEngineeringClass.Star: return 'Popular and profitable — protect these.';
      case MenuEngineeringClass.Plowhorse: return 'Popular, thin margin — re-cost or re-portion.';
      case MenuEngineeringClass.Puzzle: return 'Profitable but overlooked — promote them.';
      default: return 'Neither popular nor profitable — re-work or remove.';
    }
  }

  /** Position on the scatter, as a percentage of the plot area. */
  plotX(row: MenuEngineeringRowDto): number {
    const max = Math.max(...(this.menu?.rows ?? []).map(r => r.popularityPercent), 1);
    return Math.min(96, Math.max(2, (row.popularityPercent / max) * 92 + 2));
  }

  plotY(row: MenuEngineeringRowDto): number {
    const max = Math.max(...(this.menu?.rows ?? []).map(r => r.contributionMargin), 1);
    const min = Math.min(...(this.menu?.rows ?? []).map(r => r.contributionMargin), 0);
    const span = max - min || 1;
    return Math.min(96, Math.max(2, 96 - ((row.contributionMargin - min) / span) * 92));
  }

  get marginLinePercent(): number {
    const rows = this.menu?.rows ?? [];
    if (!rows.length) return 50;

    const max = Math.max(...rows.map(r => r.contributionMargin), 1);
    const min = Math.min(...rows.map(r => r.contributionMargin), 0);
    const span = max - min || 1;
    return Math.min(96, Math.max(2, 96 - (((this.menu?.averageMargin ?? 0) - min) / span) * 92));
  }

  get popularityLinePercent(): number {
    const rows = this.menu?.rows ?? [];
    if (!rows.length) return 50;

    const max = Math.max(...rows.map(r => r.popularityPercent), 1);
    return Math.min(96, Math.max(2, ((this.menu?.popularityThreshold ?? 0) / max) * 92 + 2));
  }

  get peakDay(): number {
    return Math.max(1, ...(this.sales?.byDay ?? []).map(d => d.amount));
  }

  trackRow = (_: number, r: { menuItemId?: string; staffId?: string; tableId?: string; stationId?: string }) =>
    r.menuItemId ?? r.staffId ?? r.tableId ?? r.stationId ?? _;
}
