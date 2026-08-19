import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CreditService } from '../../services/distribution.services';
import { CollectionDto, CreditSnapshotDto, PaymentAllocationDto, RecordCollectionDto } from '../../models/distribution.models';
import { PaymentTender, TENDER_ICONS, TENDER_LABELS } from '../../models/distribution.enums';
import { FieldErrorComponent, FieldErrors, required, positive, validate } from './validation';

/**
 * Recording money coming in.
 *
 * Deliberately a record, not a transaction: cash, a cheque number, a bank reference, a wallet id.
 * No card is ever processed here and no card number is accepted — the last four digits exist only
 * so a reconciler can match a statement line, and are typed by a human reading a receipt.
 *
 * Allocation against specific invoices is the part people skip and then regret. The oldest open
 * invoices are pre-allocated so the common case is one tap, but every line stays editable because
 * a partner who says "this payment is for the March invoice" is usually right.
 */
@Component({
  standalone: true,
  selector: 'dst-collection-sheet',
  imports: [CommonModule, FormsModule, FieldErrorComponent],
  templateUrl: './collection-sheet.html',
  styleUrls: ['../distribution-shared.css', './collection-sheet.css'],
})
export class CollectionSheetComponent implements OnInit {
  private credit = inject(CreditService);
  private cdr = inject(ChangeDetectorRef);

  @Input() outletId?: string;
  @Input() partnerId?: string;
  @Input() partyName = '';

  @Input() visitId?: string;
  @Input() fieldDayId?: string;
  @Input() fieldRepId?: string;
  @Input() tripId?: string;

  @Input() touch = false;

  @Output() recorded = new EventEmitter<CollectionDto>();
  @Output() closed = new EventEmitter<void>();

  snapshot: CreditSnapshotDto | null = null;
  allocations: PaymentAllocationDto[] = [];

  readonly tenders = [
    PaymentTender.Cash,
    PaymentTender.Cheque,
    PaymentTender.BankTransfer,
    PaymentTender.Upi,
    PaymentTender.Wallet,
    PaymentTender.Card,
    PaymentTender.CreditAdjustment,
  ];

  readonly tenderLabels = TENDER_LABELS;
  readonly tenderIcons = TENDER_ICONS;
  readonly PaymentTender = PaymentTender;

  model = {
    tender: PaymentTender.Cash,
    amount: null as number | null,
    reference: '',
    bankName: '',
    cardLast4: '',
    chequeNumber: '',
    chequeDate: '',
    note: '',
  };

  errors: FieldErrors = {};
  loading = true;
  saving = false;
  error = '';

  private readonly idempotencyKey = crypto.randomUUID();

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.credit.snapshot({
      outletId: this.outletId,
      partnerId: this.partnerId,
    })).catch(() => null);

    this.snapshot = res?.data ?? null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  get outstanding(): number {
    return this.snapshot?.outstandingAmount ?? 0;
  }

  /** Paying off everything is the common case and worth one tap. */
  payAll(): void {
    this.model.amount = this.outstanding > 0 ? this.outstanding : null;
  }

  get requiresReference(): boolean {
    return this.model.tender === PaymentTender.BankTransfer
      || this.model.tender === PaymentTender.Upi
      || this.model.tender === PaymentTender.Wallet
      || this.model.tender === PaymentTender.Card;
  }

  get isCheque(): boolean {
    return this.model.tender === PaymentTender.Cheque;
  }

  async save(): Promise<void> {
    this.errors = validate(this.model as unknown as Record<string, unknown>, {
      amount: [required('An amount'), positive('The amount')],
      reference: this.requiresReference ? [required('A reference')] : [],
      chequeNumber: this.isCheque ? [required('The cheque number')] : [],
      chequeDate: this.isCheque ? [required('The cheque date')] : [],
    });

    if (Object.keys(this.errors).length > 0) { this.cdr.detectChanges(); return; }

    this.saving = true;
    this.error = '';
    this.cdr.detectChanges();

    const dto: RecordCollectionDto = {
      outletId: this.outletId,
      partnerId: this.partnerId,
      visitId: this.visitId,
      fieldDayId: this.fieldDayId,
      fieldRepId: this.fieldRepId,
      tripId: this.tripId,
      tender: this.model.tender,
      amount: Number(this.model.amount),
      reference: this.model.reference || undefined,
      bankName: this.model.bankName || undefined,
      cardLast4: this.model.cardLast4 || undefined,
      note: this.model.note || undefined,
      idempotencyKey: this.idempotencyKey,
      cheque: this.isCheque
        ? {
            chequeNumber: this.model.chequeNumber,
            bankName: this.model.bankName || undefined,
            amount: Number(this.model.amount),
            chequeDate: this.model.chequeDate,
          }
        : undefined,
    };

    const res = await firstValueFrom(this.credit.recordCollection(dto)).catch(() => null);

    if (res?.data) {
      this.recorded.emit(res.data);
    } else {
      this.error = 'The receipt could not be recorded. Nothing was saved — try again.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }
}
