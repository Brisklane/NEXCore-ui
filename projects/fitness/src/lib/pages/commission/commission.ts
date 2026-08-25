import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StaffService } from '../../services/fitness.services';
import { CommissionRuleDto, CommissionStatementDto } from '../../models/fitness.models';
import {
  CommissionBasis, COMMISSION_BASIS_LABELS,
  CommissionStatementStatus, COMMISSION_STATEMENT_STATUS_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * What the team has earned, and what has been paid.
 *
 * The order here is deliberate: generate, review, approve, export. Exporting marks a statement
 * paid so it cannot go through payroll a second time — which is the failure mode this screen
 * exists to prevent, and the reason approval and export are separate steps rather than one button.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-commission',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './commission.html',
  styleUrls: ['../fitness-shared.css', './commission.css'],
})
export class CommissionComponent {
  private staff = inject(StaffService);
  private cdr = inject(ChangeDetectorRef);

  statements: CommissionStatementDto[] = [];
  rules: CommissionRuleDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'statements' | 'rules' = 'statements';
  status: CommissionStatementStatus | null = null;

  /** Generating a period. */
  generating = false;
  periodStart = this.firstOfMonth();
  periodEnd = new Date().toISOString().slice(0, 10);
  busy = false;

  /** Statement detail. */
  open: CommissionStatementDto | null = null;

  readonly basisLabels = COMMISSION_BASIS_LABELS;
  readonly statusLabels = COMMISSION_STATEMENT_STATUS_LABELS;
  readonly CommissionStatementStatus = CommissionStatementStatus;
  readonly CommissionBasis = CommissionBasis;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [statements, rules] = await Promise.all([
      firstValueFrom(this.staff.listStatements({
        clubId: this.clubId ?? undefined,
        status: this.status ?? undefined,
        size: 50,
      })).catch(() => null),
      firstValueFrom(this.staff.getCommissionRules(this.clubId ?? undefined)).catch(() => null),
    ]);

    this.statements = statements?.data ?? [];
    this.rules = rules?.data ?? [];

    if (!statements) this.error = 'Could not load commission.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  async generate(): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.staff.generateStatements({
      clubId: this.clubId,
      periodStart: new Date(this.periodStart).toISOString(),
      periodEnd: new Date(this.periodEnd).toISOString(),
      staffIds: [],
      previewOnly: false,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = `${res.data.length} statement${res.data.length === 1 ? '' : 's'} generated. `
        + 'Review them before approving.';
      this.generating = false;
      await this.load();
    } else {
      this.error = 'Could not generate statements.';
    }

    this.cdr.detectChanges();
  }

  async approve(s: CommissionStatementDto): Promise<void> {
    const res = await firstValueFrom(this.staff.approveStatement({
      statementId: s.id,
      approve: true,
    } as never)).catch(() => null);

    if (res?.data) {
      this.notice = `${s.staffName}'s statement approved.`;
      await this.load();
    } else {
      this.error = 'Could not approve that statement.';
    }
  }

  async exportToPayroll(s: CommissionStatementDto): Promise<void> {
    const res = await firstValueFrom(this.staff.exportStatement(s.id)).catch(() => null);

    if (res?.data) {
      this.notice = `${s.staffName}'s statement exported. It cannot be paid twice.`;
      await this.load();
    } else {
      this.error = 'Could not export that statement.';
    }
  }

  async inspect(s: CommissionStatementDto): Promise<void> {
    const res = await firstValueFrom(this.staff.getStatement(s.id)).catch(() => null);
    this.open = res?.data ?? s;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  statusClass(s: CommissionStatementDto): string {
    switch (s.status) {
      case CommissionStatementStatus.Paid:
      case CommissionStatementStatus.Exported: return 'is-good';
      case CommissionStatementStatus.Approved: return '';
      case CommissionStatementStatus.Rejected: return 'is-alert';
      default: return 'is-warn';
    }
  }

  /** How a rule pays, in a sentence rather than an enum name. */
  describeRule(r: CommissionRuleDto): string {
    const base = this.basisLabels[r.basis];

    switch (r.basis) {
      case CommissionBasis.PercentOfSessionValue:
      case CommissionBasis.PercentOfMembershipSold:
      case CommissionBasis.PercentOfPackageSold:
      case CommissionBasis.PercentOfRetailSold: {
        const accel = r.threshold > 0 && r.acceleratedRate > 0
          ? `, rising to ${r.acceleratedRate}% past ${r.threshold}`
          : '';
        return `${r.percentage}% of ${base.toLowerCase()}${accel}`;
      }
      case CommissionBasis.PerClassHead:
        return `${r.ratePerUnit} a head${r.threshold > 0 ? ` above ${r.threshold}` : ''}`;
      case CommissionBasis.PerClassTaught:
      case CommissionBasis.PerSessionDelivered:
        return `${r.ratePerUnit} each`;
      case CommissionBasis.FlatPerPeriod:
        return `${r.ratePerUnit} per period`;
      default:
        return base;
    }
  }

  private firstOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
