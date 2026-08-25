import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommerceService } from '../../services/fitness.services';
import {
  CorporateAccountDto, CorporateInvoiceDto, CorporateMemberDto,
  PayerAuthorisationDto, ThirdPartyPayerDto,
} from '../../models/fitness.models';
import {
  CorporateBillingModel, CORPORATE_BILLING_MODEL_LABELS,
  ELIGIBILITY_PROOF_LABELS, INVOICE_STATUS_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Employer schemes and third-party payers.
 *
 * Utilisation is the number this screen is really about. An employer buys a gym scheme to get
 * their staff using a gym, so an invoice with no evidence of use is an invoice that gets queried
 * at renewal — and a scheme with 20% utilisation is one that will not be renewed at all,
 * regardless of how neatly it invoices.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-corporate',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './corporate.html',
  styleUrls: ['../fitness-shared.css', './corporate.css'],
})
export class CorporateComponent {
  private commerce = inject(CommerceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  accounts: CorporateAccountDto[] = [];
  invoices: CorporateInvoiceDto[] = [];
  payers: ThirdPartyPayerDto[] = [];
  authorisations: PayerAuthorisationDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'accounts' | 'invoices' | 'payers' = 'accounts';

  /** Account detail. */
  open: CorporateAccountDto | null = null;
  openMembers: CorporateMemberDto[] = [];

  /** Invoice generation. */
  invoicing: CorporateAccountDto | null = null;
  periodStart = this.firstOfMonth();
  periodEnd = new Date().toISOString().slice(0, 10);
  busy = false;

  readonly modelLabels = CORPORATE_BILLING_MODEL_LABELS;
  readonly proofLabels = ELIGIBILITY_PROOF_LABELS;
  readonly invoiceStatusLabels = INVOICE_STATUS_LABELS;
  readonly CorporateBillingModel = CorporateBillingModel;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [accounts, invoices, payers, auths] = await Promise.all([
      firstValueFrom(this.commerce.getCorporateAccounts(this.clubId ?? undefined, false, { size: 50 }))
        .catch(() => null),
      firstValueFrom(this.commerce.getCorporateInvoices(undefined, undefined, { size: 50 }))
        .catch(() => null),
      firstValueFrom(this.commerce.getPayers(this.clubId ?? undefined, false)).catch(() => null),
      firstValueFrom(this.commerce.getAuthorisations(undefined, undefined, true)).catch(() => null),
    ]);

    this.accounts = accounts?.data ?? [];
    this.invoices = invoices?.data ?? [];
    this.payers = payers?.data ?? [];
    this.authorisations = auths?.data ?? [];

    if (!accounts) this.error = 'Could not load corporate accounts.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  async inspect(a: CorporateAccountDto): Promise<void> {
    this.open = a;
    const res = await firstValueFrom(this.commerce.getCorporateMembers(a.id, true)).catch(() => null);
    this.openMembers = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async generateInvoice(): Promise<void> {
    if (!this.invoicing) return;

    this.busy = true;
    const res = await firstValueFrom(this.commerce.generateCorporateInvoice(
      this.invoicing.id,
      new Date(this.periodStart).toISOString(),
      new Date(this.periodEnd).toISOString(),
    )).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = `${res.data.invoiceNumber} raised for ${this.invoicing.name} — `
        + `${res.data.memberCount} employees, ${res.data.total.toFixed(2)}.`;
      this.invoicing = null;
      this.tab = 'invoices';
      await this.load();
    } else {
      this.error = 'Could not raise that invoice.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  /** Low utilisation is the thing that loses a scheme at renewal. */
  utilisationClass(percent: number): string {
    if (percent >= 60) return 'is-good';
    if (percent >= 35) return 'is-warn';
    return 'is-bad';
  }

  accountClass(a: CorporateAccountDto): string {
    if (a.outstandingBalance > 0) return 'is-warn';
    if (!a.isActive) return '';
    return 'is-good';
  }

  invoiceClass(i: CorporateInvoiceDto): string {
    if (i.daysOverdue > 30) return 'is-alert';
    if (i.daysOverdue > 0) return 'is-warn';
    return '';
  }

  /** How the employer pays, in a sentence. */
  describeModel(a: CorporateAccountDto): string {
    switch (a.billingModel) {
      case CorporateBillingModel.EmployerPaysAll:
        return 'The employer pays the whole membership';
      case CorporateBillingModel.Subsidised:
        return a.subsidyPerMember > 0
          ? `The employer pays ${a.subsidyPerMember.toFixed(2)} of each membership`
          : `The employer pays ${a.subsidyPercent}% of each membership`;
      case CorporateBillingModel.EmployeePaysDiscounted:
        return `Staff get ${a.discountPercent}% off and pay it themselves`;
      default:
        return this.modelLabels[a.billingModel];
    }
  }

  private firstOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
