import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FitnessReportService } from '../../services/fitness.services';
import {
  AttendanceReportDto, ClassPerformanceReportDto, CohortRetentionDto, MembershipReportDto,
  MrrMovementDto, OperationsReportDto, ReportFilterDto, RevenueReportDto, SalesReportDto,
  StaffPerformanceReportDto,
} from '../../models/fitness.models';
import { ReportPeriod, REPORT_PERIOD_LABELS, enumOptions } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

type Report =
  | 'membership' | 'cohorts' | 'revenue' | 'mrr'
  | 'attendance' | 'classes' | 'sales' | 'staff' | 'operations';

/**
 * The numbers the club is run on.
 *
 * One filter bar, nine reports, all served from the same period selector — so comparing two
 * reports never means re-entering the same dates twice and hoping they matched.
 *
 * Two of these are calculated differently from most tools in this market, and the difference
 * matters. Churn divides by the *average* active count for the period rather than the closing
 * count, which stops a shrinking club looking better than it is. And MRR movement is broken into
 * new, expansion, contraction, churn and reactivation, because a single net figure hides which of
 * pricing, sales or retention is the thing to fix.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-reports',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './reports.html',
  styleUrls: ['../fitness-shared.css', './reports.css'],
})
export class ReportsComponent {
  private reports = inject(FitnessReportService);
  private cdr = inject(ChangeDetectorRef);

  report: Report = 'membership';
  loading = false;
  error = '';
  clubId: string | null = null;

  period = ReportPeriod.ThisMonth;
  from = '';
  to = '';

  membership: MembershipReportDto | null = null;
  cohorts: CohortRetentionDto | null = null;
  revenue: RevenueReportDto | null = null;
  mrr: MrrMovementDto | null = null;
  attendance: AttendanceReportDto | null = null;
  classes: ClassPerformanceReportDto | null = null;
  sales: SalesReportDto | null = null;
  staff: StaffPerformanceReportDto | null = null;
  operations: OperationsReportDto | null = null;

  readonly periodOptions = enumOptions(REPORT_PERIOD_LABELS);
  readonly ReportPeriod = ReportPeriod;

  readonly tabs: { key: Report; label: string; icon: string }[] = [
    { key: 'membership', label: 'Membership', icon: 'badge' },
    { key: 'cohorts', label: 'Cohort retention', icon: 'grid_view' },
    { key: 'revenue', label: 'Revenue', icon: 'payments' },
    { key: 'mrr', label: 'MRR movement', icon: 'trending_up' },
    { key: 'attendance', label: 'Attendance', icon: 'sensor_door' },
    { key: 'classes', label: 'Classes', icon: 'event' },
    { key: 'sales', label: 'Sales', icon: 'forum' },
    { key: 'staff', label: 'Staff', icon: 'groups' },
    { key: 'operations', label: 'Operations', icon: 'build' },
  ];

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.run();
  }

  async choose(report: Report): Promise<void> {
    this.report = report;
    await this.run();
  }

  private get filter(): ReportFilterDto {
    return {
      clubId: this.clubId,
      period: this.period,
      from: this.period === ReportPeriod.Custom && this.from ? new Date(this.from).toISOString() : null,
      to: this.period === ReportPeriod.Custom && this.to ? new Date(this.to).toISOString() : null,
    } as unknown as ReportFilterDto;
  }

  async run(): Promise<void> {
    this.loading = true;
    this.error = '';
    const f = this.filter;

    try {
      switch (this.report) {
        case 'membership': this.membership = (await firstValueFrom(this.reports.getMembership(f))).data ?? null; break;
        case 'cohorts': this.cohorts = (await firstValueFrom(this.reports.getCohorts(f))).data ?? null; break;
        case 'revenue': this.revenue = (await firstValueFrom(this.reports.getRevenue(f))).data ?? null; break;
        case 'mrr': this.mrr = (await firstValueFrom(this.reports.getMrr(f))).data ?? null; break;
        case 'attendance': this.attendance = (await firstValueFrom(this.reports.getAttendance(f))).data ?? null; break;
        case 'classes': this.classes = (await firstValueFrom(this.reports.getClassPerformance(f))).data ?? null; break;
        case 'sales': this.sales = (await firstValueFrom(this.reports.getSales(f))).data ?? null; break;
        case 'staff': this.staff = (await firstValueFrom(this.reports.getStaffPerformance(f))).data ?? null; break;
        case 'operations': this.operations = (await firstValueFrom(this.reports.getOperations(f))).data ?? null; break;
      }
    } catch {
      this.error = 'Could not run that report.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  /** Retention shading for the cohort grid. Null means the cohort has not reached that month yet. */
  cohortShade(percent: number | null | undefined): string {
    if (percent == null) return 'is-future';
    if (percent >= 80) return 'is-strong';
    if (percent >= 60) return 'is-fair';
    if (percent >= 40) return 'is-weak';
    return 'is-poor';
  }

  barWidth(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(1, Math.round((Math.abs(value) / max) * 100));
  }

  /** The biggest single component of MRR movement, so the bars scale sensibly. */
  get mrrMax(): number {
    const m = this.mrr;
    if (!m) return 1;
    return Math.max(1, m.newMrr, m.expansionMrr, m.contractionMrr, m.churnedMrr, m.reactivationMrr);
  }

  heatStyle(intensity: number): Record<string, string> {
    return { opacity: String(Math.max(0.06, intensity / 100)) };
  }

  hourLabel(hour: number): string {
    return `${String(hour).padStart(2, '0')}`;
  }

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  cellFor(day: number, hour: number) {
    return this.attendance?.heatmap.find(c => c.dayOfWeek === day && c.hour === hour);
  }
}
