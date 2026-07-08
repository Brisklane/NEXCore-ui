import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent,
  SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { RfqService } from '../../services/rfq.service';
import { VendorService } from '../../services/vendor.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import {
  RequestForQuotationDto, VendorQuotationDto,
  SubmitVendorQuotationDto, SubmitVendorQuotationLineDto, EvaluateQuotationDto,
} from '../../models/rfq.model';
import {
  RFQStatus, QuotationStatus, RFQ_STATUS_LABELS, QUOTATION_STATUS_LABELS,
} from '../../models/procurement-enums';
import { VendorDto, PaymentTerms, PAYMENT_TERMS_LABELS } from '../../models/vendor.model';
import { Incoterm, INCOTERM_LABELS } from '../../models/purchase-order.model';
import { CURRENCY_OPTIONS, enumOptions } from '../../models/procurement-constants';

interface SubmitLineRow extends SubmitVendorQuotationLineDto {
  itemDescription: string;
  quantity: number;
}

@Component({
  selector: 'lib-vendor-quotations',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent,
  ],
  templateUrl: './vendor-quotations.html',
  styleUrl: './vendor-quotations.css',
})
export class VendorQuotationsPage implements OnInit {
  rfqs: RequestForQuotationDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  selectedRfqId = '';
  rfq: RequestForQuotationDto | null = null;

  // Submit-quotation form
  showSubmitForm = false;
  submitted = false;
  saving = false;
  sForm = {
    vendorId: '', vendorQuotationReference: '', validUntil: '',
    currencyCode: 'PKR', paymentTerms: PaymentTerms.Net30 as number,
    incoterm: '' as number | '', incotermLocation: '', deliveryLeadTimeDays: 0 as number | null, notes: '',
  };
  sLines: SubmitLineRow[] = [];

  // Evaluation model: quotationId -> { technicalScore, commercialScore, isRecommended }
  evalModel: Record<string, { technicalScore: number | null; commercialScore: number | null; isRecommended: boolean }> = {};
  savingEval = false;

  // ── Client-side column sorting for the quotations comparison table ──────────
  sortBy = '';
  sortDir: 'asc' | 'desc' = 'asc';
  sort(key: string): void {
    if (this.sortBy === key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = key; this.sortDir = 'asc'; }
    this.page = 1;
  }
  sortIcon(key: string): string { return this.sortBy === key ? (this.sortDir === 'asc' ? '▲' : '▼') : '↕'; }
  get sortedQuotations(): any[] {
    const list = this.rfq?.vendorQuotations ?? [];
    if (!this.sortBy) return list;
    const key = this.sortBy;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a: any, b: any) => dir * cmpVals(a[key], b[key]));
  }

  // Client-side pagination for the quotations comparison table.
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50];
  get quotationCount(): number { return this.rfq?.vendorQuotations?.length ?? 0; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.quotationCount / this.pageSize)); }
  get pagedQuotations(): any[] {
    const ordered = this.floatHighlighted(this.sortedQuotations);
    const start = (this.page - 1) * this.pageSize;
    return ordered.slice(start, start + this.pageSize);
  }
  onPageSizeChange(): void { this.page = 1; }

  highlighter = new RowHighlighter();

  /** Float a freshly submitted quotation to the top of the comparison list. */
  private floatHighlighted(rows: any[]): any[] {
    if (this.highlighter.id == null) return rows;
    const idx = rows.findIndex(r => r?.id === this.highlighter.id);
    if (idx <= 0) return rows;
    const copy = [...rows];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  rfqOptions: SelectOption[] = [];
  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  readonly paymentTermOptions = enumOptions(PAYMENT_TERMS_LABELS);
  readonly incotermOptions = enumOptions(INCOTERM_LABELS);

  constructor(
    private service: RfqService,
    private vendorService: VendorService,
    private currencyService: CurrencyLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRfqs();
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
  }

  loadRfqs(): void {
    this.loading = true; this.error = '';
    this.service.getAll().subscribe({
      next: (r) => {
        // Only RFQs that have been sent (or beyond) can receive/compare quotations.
        this.rfqs = (r.data ?? []).filter(x => x.status !== RFQStatus.Draft);
        this.rfqOptions = this.rfqs.map(x => ({ value: x.id, label: `${x.rfqNumber} — ${x.title}` }));
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load RFQs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onRfqChange(): void {
    if (!this.selectedRfqId) { this.rfq = null; return; }
    this.loadRfq();
  }

  loadRfq(): void {
    this.loading = true; this.error = '';
    this.service.getById(this.selectedRfqId).subscribe({
      next: (r) => {
        this.rfq = r.data ?? null;
        this.page = 1;
        this.buildEvalModel();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load RFQ'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  /** Live overall preview: average of the entered tech & comm scores; falls back to the saved score. */
  overallDisplay(q: VendorQuotationDto): string {
    const m = this.evalModel[q.id];
    if (m && m.technicalScore != null && m.commercialScore != null) {
      return (((Number(m.technicalScore) + Number(m.commercialScore)) / 2)).toFixed(1);
    }
    return q.overallScore != null ? Number(q.overallScore).toFixed(1) : '—';
  }

  /** Keep evaluation scores within 0–100. */
  clampScore(quotationId: string, field: 'technicalScore' | 'commercialScore'): void {
    const m = this.evalModel[quotationId];
    if (!m || m[field] == null) return;
    m[field] = Math.max(0, Math.min(100, Number(m[field])));
  }

  private buildEvalModel(): void {
    this.evalModel = {};
    for (const q of this.rfq?.vendorQuotations ?? []) {
      this.evalModel[q.id] = {
        technicalScore: q.technicalScore ?? null,
        commercialScore: q.commercialScore ?? null,
        isRecommended: q.isRecommended,
      };
    }
  }

  // ── Labels / helpers ────────────────────────────────────────────────────────
  rfqStatusLabel(s: RFQStatus): string { return RFQ_STATUS_LABELS[s] ?? String(s); }
  quotationStatusLabel(s: QuotationStatus): string { return QUOTATION_STATUS_LABELS[s] ?? String(s); }
  vendorName(id: string): string { return this.vendors.find(v => v.id === id)?.name ?? id; }
  paymentTermLabel(p: PaymentTerms): string { return PAYMENT_TERMS_LABELS[p] ?? String(p); }

  quotationStatusBadge(s: QuotationStatus): string {
    switch (s) {
      case QuotationStatus.Accepted: return 'badge badge-active';
      case QuotationStatus.Rejected: case QuotationStatus.Expired: return 'badge badge-blocked';
      case QuotationStatus.Shortlisted: return 'badge badge-pending';
      default: return 'badge badge-draft';
    }
  }

  get canReceiveQuotations(): boolean {
    return !!this.rfq && (this.rfq.status === RFQStatus.Sent || this.rfq.status === RFQStatus.PartiallyReceived);
  }
  canAward(q: VendorQuotationDto): boolean {
    return q.status === QuotationStatus.Submitted || q.status === QuotationStatus.UnderEvaluation || q.status === QuotationStatus.Shortlisted;
  }

  // ── Submit quotation ──────────────────────────────────────────────────────────
  openSubmitForm(): void {
    if (!this.rfq) return;
    this.sForm = {
      vendorId: '', vendorQuotationReference: '', validUntil: '',
      currencyCode: this.rfq.currencyCode || 'PKR', paymentTerms: PaymentTerms.Net30,
      incoterm: '', incotermLocation: '', deliveryLeadTimeDays: 0, notes: '',
    };
    this.sLines = (this.rfq.lines ?? []).map(l => ({
      rfqLineId: l.id,
      itemDescription: l.itemDescription,
      quantity: l.quantity,
      unitPrice: l.estimatedUnitPrice ?? 0,
      discountPercent: 0,
      taxPercent: 0,
      promisedDeliveryDate: undefined,
      leadTimeDays: undefined,
      isAlternative: false,
      notes: undefined,
    }));
    this.submitted = false;
    this.showSubmitForm = true;
    this.error = ''; this.success = '';
  }

  cancelSubmit(): void { this.showSubmitForm = false; }

  lineNet(l: SubmitLineRow): number {
    const gross = (l.unitPrice ?? 0) * (l.quantity ?? 0);
    const afterDisc = gross * (1 - (l.discountPercent ?? 0) / 100);
    return afterDisc * (1 + (l.taxPercent ?? 0) / 100);
  }
  get sLinesTotal(): number { return this.sLines.reduce((s, l) => s + this.lineNet(l), 0); }

  get submitErrors() {
    return {
      vendorId: this.sForm.vendorId ? '' : 'Select the quoting vendor.',
      validUntil: this.sForm.validUntil ? '' : 'Quotation validity date is required.',
      lines: this.sLines.length === 0 ? 'This RFQ has no lines to quote.' : '',
    };
  }
  get submitValid(): boolean { const e = this.submitErrors; return !e.vendorId && !e.validUntil && !e.lines; }

  submitQuotation(): void {
    this.submitted = true;
    if (!this.submitValid || !this.rfq) { this.error = this.submitErrors.vendorId || this.submitErrors.validUntil || this.submitErrors.lines; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: SubmitVendorQuotationDto = {
      vendorId: this.sForm.vendorId,
      vendorQuotationReference: this.sForm.vendorQuotationReference.trim() || undefined,
      validUntil: this.sForm.validUntil,
      currencyCode: this.sForm.currencyCode || 'PKR',
      paymentTerms: Number(this.sForm.paymentTerms) as PaymentTerms,
      incoterm: this.sForm.incoterm === '' ? undefined : Number(this.sForm.incoterm) as Incoterm,
      incotermLocation: this.sForm.incotermLocation.trim() || undefined,
      deliveryLeadTimeDays: Number(this.sForm.deliveryLeadTimeDays ?? 0),
      notes: this.sForm.notes.trim() || undefined,
      lines: this.sLines.map(l => ({
        rfqLineId: l.rfqLineId,
        unitPrice: Number(l.unitPrice ?? 0),
        discountPercent: Number(l.discountPercent ?? 0),
        taxPercent: Number(l.taxPercent ?? 0),
        promisedDeliveryDate: l.promisedDeliveryDate || undefined,
        leadTimeDays: l.leadTimeDays != null ? Number(l.leadTimeDays) : undefined,
        isAlternative: !!l.isAlternative,
        notes: l.notes?.trim() || undefined,
      })),
    };
    this.service.submitQuotation(this.rfq.id, dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Quotation submitted'; this.showSubmitForm = false; this.loadRfq(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to submit quotation'; this.cdr.detectChanges(); },
    });
  }

  // ── Evaluate ──────────────────────────────────────────────────────────────────
  saveEvaluation(): void {
    if (!this.rfq) return;
    const evaluations: EvaluateQuotationDto[] = (this.rfq.vendorQuotations ?? []).map(q => ({
      quotationId: q.id,
      technicalScore: this.evalModel[q.id]?.technicalScore ?? undefined,
      commercialScore: this.evalModel[q.id]?.commercialScore ?? undefined,
      isRecommended: this.evalModel[q.id]?.isRecommended ?? false,
    }));
    if (!evaluations.length) return;
    this.savingEval = true; this.error = '';
    this.service.evaluate(this.rfq.id, evaluations).subscribe({
      next: () => { this.savingEval = false; this.success = 'Evaluation saved'; this.loadRfq(); },
      error: (e) => { this.savingEval = false; this.error = e?.error?.message ?? 'Failed to save evaluation'; this.cdr.detectChanges(); },
    });
  }

  award(q: VendorQuotationDto): void {
    if (!this.rfq) return;
    this.service.award(this.rfq.id, q.id).subscribe({
      next: () => { this.success = `Awarded to ${this.vendorName(q.vendorId)} — draft PO created`; this.loadRfq(); this.loadRfqs(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to award'; this.cdr.detectChanges(); },
    });
  }
}

/** Generic value comparator for client-side table sorting (numbers, booleans, dates, text). */
function cmpVals(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'boolean') return a === b ? 0 : a ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
