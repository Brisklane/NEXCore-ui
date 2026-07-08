import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SalesInvoiceService } from '../../services/sales-invoice.service';
import { SalesInvoiceDto, InvoiceStatus, RegisterInvoicePaymentDto, CreateCreditNoteFromInvoiceDto } from '../../models/sales-invoice.model';

@Component({
  selector: 'lib-sales-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-invoices.html',
  styleUrl: './sales-invoices.css',
})
export class SalesInvoicesComponent implements OnInit {
  invoices: SalesInvoiceDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  statusFilter = '';
  searchQuery = '';
  showOverdueOnly = false;
  selectedInvoice: SalesInvoiceDto | null = null;

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showCancelForm = false;
  formCancelReason = '';

  // ── Refund / Credit note ─────────────────────────────────
  showCreditNoteForm = false;
  formCreditReason = '';
  formCreditFullReversal = true;

  // ── Preview ──────────────────────────────────────────────
  showPreview = false;
  previewHtml: SafeHtml = '';
  loadingPreview = false;

  // ── Register Payment ─────────────────────────────────────
  showPaymentForm = false;
  formPaymentAmount = 0;
  formPaymentDate = '';
  formPaymentMethod = 'Cash';
  formPaymentReference = '';
  formPaymentBank = '';
  formPaymentJournal = '';
  formPaymentMemo = '';

  readonly paymentMethods = ['Cash', 'Card', 'BankTransfer', 'Online', 'Cheque', 'GiftCard', 'Wallet', 'Other'];

  private readonly statusMap: Record<number, string> = {
    0: 'Draft', 1: 'Confirmed', 2: 'PartiallyPaid', 3: 'Paid', 4: 'Overdue', 5: 'Cancelled', 6: 'Void',
  };

  readonly statuses: InvoiceStatus[] = ['Draft', 'Confirmed', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled', 'Void'];

  constructor(
    private invoiceService: SalesInvoiceService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    const obs = this.showOverdueOnly
      ? this.invoiceService.getOverdue()
      : this.invoiceService.getAll();
    obs.subscribe({
      next: (res) => {
        this.invoices = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load invoices.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleOverdue() {
    this.showOverdueOnly = !this.showOverdueOnly;
    this.load();
  }

  normStatus(v: InvoiceStatus | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    return !isNaN(n) ? (this.statusMap[n] ?? String(v)) : String(v);
  }

  get filtered(): SalesInvoiceDto[] {
    let result = this.invoices;
    if (this.statusFilter) result = result.filter(i => this.normStatus(i.status) === this.statusFilter);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) result = result.filter(i =>
      (i.invoiceNumber ?? '').toLowerCase().includes(q) ||
      (i.contactName ?? '').toLowerCase().includes(q) ||
      (i.orderNumber ?? '').toLowerCase().includes(q)
    );
    const rows = [...result];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  viewInvoice(i: SalesInvoiceDto) {
    this.selectedInvoice = i;
    this.showCancelForm = false;
    this.showPaymentForm = false;
    this.formCancelReason = '';
  }

  closeDetail() {
    this.selectedInvoice = null;
    this.showCancelForm = false;
    this.showPaymentForm = false;
  }

  // ── Preview ──────────────────────────────────────────────
  openPreview(id: string) {
    this.showPreview = true;
    this.previewHtml = '';
    this.loadingPreview = true;
    this.invoiceService.getDocumentHtml(id).subscribe({
      next: (html) => {
        this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        this.loadingPreview = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPreview = false;
        this.showPreview = false;
        this.error = 'Failed to load invoice preview.';
        this.cdr.detectChanges();
      },
    });
  }

  closePreview() {
    this.showPreview = false;
    this.previewHtml = '';
  }

  // ── Register Payment ─────────────────────────────────────
  openRegisterPayment(inv: SalesInvoiceDto) {
    this.formPaymentAmount = inv.balanceDue ?? 0;
    this.formPaymentDate = new Date().toISOString().split('T')[0];
    this.formPaymentMethod = 'Cash';
    this.formPaymentReference = '';
    this.formPaymentBank = '';
    this.formPaymentJournal = '';
    this.formPaymentMemo = '';
    this.showPaymentForm = true;
    this.showCancelForm = false;
    this.error = '';
  }

  cancelPaymentForm() {
    this.showPaymentForm = false;
  }

  submitRegisterPayment() {
    if (!this.selectedInvoice) return;
    if (!this.formPaymentAmount || this.formPaymentAmount <= 0) {
      this.error = 'Amount must be greater than 0.';
      return;
    }
    if (!this.formPaymentDate) {
      this.error = 'Payment date is required.';
      return;
    }
    this.error = '';
    const dto: RegisterInvoicePaymentDto = {
      paymentMethod: this.formPaymentMethod || null,
      journal: this.formPaymentJournal || null,
      amount: this.formPaymentAmount,
      paymentDate: this.formPaymentDate,
      memo: this.formPaymentMemo || null,
      bankName: this.formPaymentBank || null,
      referenceNumber: this.formPaymentReference || null,
    };
    this.invoiceService.registerPayment(this.selectedInvoice.id, dto).subscribe({
      next: () => {
        this.successMsg = 'Payment registered successfully.';
        this.showPaymentForm = false;
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to register payment.';
        this.cdr.detectChanges();
      },
    });
  }

  confirmInvoice(id: string) {
    this.invoiceService.confirm(id).subscribe({
      next: () => {
        this.successMsg = 'Invoice confirmed.';
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to confirm invoice.';
        this.cdr.detectChanges();
      },
    });
  }

  cancelInvoice(id: string) {
    this.invoiceService.cancel(id, { reason: this.formCancelReason || null }).subscribe({
      next: () => {
        this.successMsg = 'Invoice cancelled.';
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to cancel invoice.';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Refund / Credit note ─────────────────────────────────
  openCreditNote(inv: SalesInvoiceDto) {
    this.formCreditReason = '';
    this.formCreditFullReversal = true;
    this.showCreditNoteForm = true;
    this.showPaymentForm = false;
    this.showCancelForm = false;
    this.error = '';
  }

  cancelCreditNote() {
    this.showCreditNoteForm = false;
  }

  submitCreditNote() {
    if (!this.selectedInvoice) return;
    const dto: CreateCreditNoteFromInvoiceDto = {
      reason: this.formCreditReason || null,
      creditNoteDate: new Date().toISOString().split('T')[0],
      fullReversal: this.formCreditFullReversal,
      notes: null,
    };
    this.invoiceService.creditNote(this.selectedInvoice.id, dto).subscribe({
      next: (res) => {
        this.successMsg = `Refund issued — credit note ${res.data?.creditNoteNumber ?? ''}.`;
        this.showCreditNoteForm = false;
        this.closeDetail();
        this.load();
      },
      error: () => { this.error = 'Failed to issue refund / credit note.'; this.cdr.detectChanges(); },
    });
  }

  badgeClass(status: InvoiceStatus | number | string): string {
    return `badge badge-${this.normStatus(status).toLowerCase()}`;
  }

  /** Open the server-rendered invoice document (driven by the default receipt template) and print it. */
  printDocument(id: string) {
    this.invoiceService.getDocumentHtml(id).subscribe({
      next: (html) => {
        const w = window.open('', '_blank');
        if (!w) { this.error = 'Allow pop-ups to print the invoice.'; this.cdr.detectChanges(); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => { try { w.print(); } catch { /* user can print manually */ } }, 300);
      },
      error: () => { this.error = 'Failed to load the invoice document.'; this.cdr.detectChanges(); },
    });
  }
}
