import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingService } from '../../services/fitness.services';
import { InvoiceDetailDto, InvoiceSummaryDto } from '../../models/fitness.models';
import {
  InvoiceStatus, INVOICE_STATUS_LABELS, PaymentMethod, PAYMENT_METHOD_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Every invoice raised, and what has been paid against it.
 *
 * Taking a payment lives here rather than on its own screen, because the question a member of
 * staff is answering is always "this person owes something — what, and can they pay it now".
 * Payment is recorded, never processed: the fields below are the reference, the brand and the
 * last four, which is all this app is ever allowed to hold.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-invoices',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './invoices.html',
  styleUrls: ['../fitness-shared.css', './invoices.css'],
})
export class InvoicesComponent {
  private billing = inject(BillingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: InvoiceSummaryDto[] = [];
  total = 0;
  page = 1;
  readonly size = 25;

  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  status: InvoiceStatus | null = null;
  overdueOnly = false;
  memberId: string | null = null;

  /** The invoice being looked at. */
  open: InvoiceDetailDto | null = null;
  openLoading = false;

  /** Take-payment dialog. */
  payingFor: InvoiceSummaryDto | null = null;
  payAmount = 0;
  payMethod = PaymentMethod.Card;
  payReference = '';
  payTendered: number | null = null;
  paying = false;

  readonly statusLabels = INVOICE_STATUS_LABELS;
  readonly methodLabels = PAYMENT_METHOD_LABELS;
  readonly statusOptions = enumOptions(INVOICE_STATUS_LABELS);
  readonly methodOptions = enumOptions(PAYMENT_METHOD_LABELS);
  readonly InvoiceStatus = InvoiceStatus;
  readonly PaymentMethod = PaymentMethod;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    this.memberId = this.route.snapshot.queryParamMap.get('memberId');
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.billing.listInvoices({
      clubId: this.clubId ?? undefined,
      memberId: this.memberId ?? undefined,
      status: this.status ?? undefined,
      overdueOnly: this.overdueOnly || undefined,
      page: this.page,
      size: this.size,
    })).catch(() => null);

    if (!res) {
      this.error = 'Could not load invoices.';
    } else {
      this.rows = res.data ?? [];
      this.total = res.pagination?.totalCount ?? this.rows.length;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async inspect(row: InvoiceSummaryDto): Promise<void> {
    this.openLoading = true;
    this.open = null;

    const res = await firstValueFrom(this.billing.getInvoice(row.id)).catch(() => null);
    this.open = res?.data ?? null;
    this.openLoading = false;

    if (!this.open) this.error = 'Could not open that invoice.';
    this.cdr.detectChanges();
  }

  // ── Payment ────────────────────────────────────────────────────────────

  startPayment(row: InvoiceSummaryDto): void {
    this.payingFor = row;
    this.payAmount = row.balanceDue;
    this.payMethod = PaymentMethod.Card;
    this.payReference = '';
    this.payTendered = null;
  }

  async takePayment(): Promise<void> {
    if (!this.payingFor || this.payAmount <= 0) return;

    this.paying = true;
    const res = await firstValueFrom(this.billing.takePayment({
      memberId: this.payingFor.memberId,
      clubId: this.payingFor.clubId,
      invoiceId: this.payingFor.id,
      amount: this.payAmount,
      method: this.payMethod,
      providerReference: this.payReference.trim() || null,
      amountTendered: this.payTendered,
      // Guards against a double-tap on the till, which happens more than anyone admits.
      idempotencyKey: `inv:${this.payingFor.id}:${this.payAmount}:${Date.now() / 60000 | 0}`,
    } as never)).catch(() => null);

    this.paying = false;

    if (res?.data) {
      const r = res.data;
      this.notice = r.changeDue > 0
        ? `Payment taken. Change due: ${r.changeDue.toFixed(2)}.`
        : r.accessRestored
          ? 'Payment taken — their access is back on.'
          : 'Payment taken.';
      this.payingFor = null;
      await this.load();
      if (this.open) await this.inspect({ id: this.open.id } as InvoiceSummaryDto);
    } else {
      this.error = 'That payment did not go through.';
    }

    this.cdr.detectChanges();
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.size)); }

  goPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
    void this.load();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  statusClass(row: InvoiceSummaryDto): string {
    if (row.status === InvoiceStatus.Paid) return 'is-good';
    if (row.daysOverdue > 30) return 'is-alert';
    if (row.daysOverdue > 0) return 'is-warn';
    return '';
  }

  /** Change to hand back, worked out as the amount is typed. */
  get changeDue(): number {
    if (this.payMethod !== PaymentMethod.Cash || this.payTendered == null) return 0;
    return Math.max(0, this.payTendered - this.payAmount);
  }
}
