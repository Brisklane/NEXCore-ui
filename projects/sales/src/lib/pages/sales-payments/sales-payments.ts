import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesPaymentService } from '../../services/sales-payment.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesInvoiceService } from '../../services/sales-invoice.service';
import { SalesPaymentDto, CreateSalesPaymentDto } from '../../models/sales-payment.model';
import { SalesOrderDto } from '../../models/sales-order.model';
import { SalesInvoiceDto, RegisterInvoicePaymentDto } from '../../models/sales-invoice.model';
import { ContactService, ContactDto } from '@nexcore/crm';
import {
  EntityPickerInputComponent,
  EntityPickerItem,
  EntityPickerColumn,
  EntityPickerDisplayField,
} from '@nexcore/core';
import { LedgerAccountService } from '@nexcore/accounting';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-sales-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './sales-payments.html',
  styleUrl: './sales-payments.css',
})
export class SalesPaymentsComponent implements OnInit {
  payments: SalesPaymentDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showForm = false;
  searchQuery = '';

  highlighter = new RowHighlighter();
  // Set before a reload so the freshly created payment (now row 0 after CreatedAt-desc
  // ordering) flashes green — works for both the plain and invoice register-payment paths.
  private flashNewestPayment = false;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  contacts: ContactDto[] = [];
  orders: SalesOrderDto[] = [];
  invoices: SalesInvoiceDto[] = [];

  // GL accounts (chart of accounts) for the Journal picker
  glAccounts: EntityPickerItem[] = [];
  readonly accountDisplayFields: EntityPickerDisplayField[] = [
    { key: 'accountNumber', style: 'code' },
    { key: 'accountName', style: 'name' },
  ];
  readonly accountColumns: EntityPickerColumn[] = [
    { key: 'accountNumber', header: 'Account #' },
    { key: 'accountName', header: 'Name' },
    { key: 'currencyCode', header: 'Currency' },
  ];

  // Customers for the Customer picker (5 suggestions + paginated modal)
  contactOptions: EntityPickerItem[] = [];
  readonly contactDisplayFields: EntityPickerDisplayField[] = [
    { key: 'name', style: 'name' },
    { key: 'accountName', style: 'badge' },
  ];
  readonly contactColumns: EntityPickerColumn[] = [
    { key: 'name', header: 'Customer' },
    { key: 'accountName', header: 'Account' },
  ];

  contactLabelFor(id: string): string {
    const c = this.contacts.find(x => x.id === id);
    if (!c) return '';
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || (c.accountName ?? '');
  }

  // Form fields
  formContactId = '';
  formAmount = 0;
  formPaymentDate = '';
  formPaymentMethod = 'Cash';
  formSalesOrderId = '';
  formSalesInvoiceId = '';
  formJournal = '';
  formReferenceNumber = '';
  formBankName = '';
  formNotes = '';

  readonly methods = ['Cash', 'Card', 'BankTransfer', 'Online', 'Cheque', 'GiftCard', 'Wallet', 'Other'];

  get filteredPayments(): SalesPaymentDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    let rows = !q ? [...this.payments] : this.payments.filter(p =>
      (p.paymentNumber ?? '').toLowerCase().includes(q) ||
      this.displayContact(p).toLowerCase().includes(q) ||
      (p.referenceNumber ?? '').toLowerCase().includes(q) ||
      (p.paymentMethod ?? '').toLowerCase().includes(q)
    );
    rows = [...rows];
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
    const hid = this.highlighter.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  /**
   * Customer name for a payment. The API doesn't denormalise it and the stored ContactId
   * can be a demo/dangling reference, so resolve through the linked order/invoice (which
   * carry the real customer name), then fall back to the contacts list.
   */
  displayContact(p: SalesPaymentDto): string {
    if (p.contactName) return p.contactName;
    const order = p.salesOrderId ? this.orders.find(o => o.id === p.salesOrderId) : null;
    if (order?.contactName) return order.contactName;
    const inv = p.salesInvoiceId ? this.invoices.find(i => i.id === p.salesInvoiceId) : null;
    if (inv?.contactName) return inv.contactName;
    const c = this.contacts.find(x => x.id === p.contactId);
    if (c) return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || (c.accountName ?? '');
    return '';
  }

  /**
   * Invoices that can actually receive a payment: Issued (1) or PartiallyPaid (2) with a
   * balance still due. Fully-paid, draft, cancelled and void invoices are excluded so the
   * user can't pick one the backend will reject ("Only Posted invoices can be paid").
   */
  get payableInvoices(): SalesInvoiceDto[] {
    return this.invoices.filter(i => this.isPayableInvoice(i));
  }

  private isPayableInvoice(i: SalesInvoiceDto): boolean {
    if ((i.balanceDue ?? 0) <= 0) return false;
    const s = i.status;
    if (typeof s === 'number') return s === 1 || s === 2;
    const str = String(s).toLowerCase();
    return str === 'issued' || str === 'partiallypaid' || str === 'confirmed';
  }

  /** Pull the server's specific message out of an HTTP error, else a fallback. */
  private extractError(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: string[] } })?.error;
    if (body?.message) return body.message;
    if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(' | ');
    return fallback;
  }

  orderNumberFor(p: SalesPaymentDto): string {
    const o = p.salesOrderId ? this.orders.find(x => x.id === p.salesOrderId) : null;
    return o?.orderNumber ?? '';
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  selectedPayment: SalesPaymentDto | null = null;
  viewPayment(p: SalesPaymentDto) { this.selectedPayment = p; this.showForm = false; }
  closeDetail() { this.selectedPayment = null; }

  /** Sets the Journal field to the picked GL account's "number - name" label. */
  onJournalSelected(item: EntityPickerItem) {
    const num = item['accountNumber'] ?? '';
    const name = item['accountName'] ?? '';
    this.formJournal = num && name ? `${num} - ${name}` : (name || num || '');
  }

  constructor(
    private paymentService: SalesPaymentService,
    private orderService: SalesOrderService,
    private invoiceService: SalesInvoiceService,
    private contactService: ContactService,
    private ledgerAccountService: LedgerAccountService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
    this.contactService.getAll().subscribe({
      next: (res) => {
        this.contacts = res.data ?? [];
        this.contactOptions = this.contacts.map(c => ({
          id: c.id,
          name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || (c.accountName ?? '') || c.id,
          accountName: c.accountName ?? '',
        }));
        this.cdr.detectChanges();
      },
      error: () => {},
    });
    this.orderService.getAll().subscribe({ next: (res) => { this.orders = res.data ?? []; this.cdr.detectChanges(); }, error: () => {} });
    this.invoiceService.getAll().subscribe({ next: (res) => { this.invoices = res.data ?? []; this.cdr.detectChanges(); }, error: () => {} });
    this.ledgerAccountService.getAll({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (res) => { this.glAccounts = (res.data ?? []) as unknown as EntityPickerItem[]; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.paymentService.getAll().subscribe({
      next: (res) => {
        this.payments = res.data ?? [];
        this.loading = false;
        if (this.flashNewestPayment) { this.flashNewestPayment = false; this.highlighter.flash(this.payments[0]?.id, this.cdr); }
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load payments.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() {
    this.selectedPayment = null;
    this.formContactId = '';
    this.formAmount = 0;
    this.formPaymentDate = new Date().toISOString().split('T')[0];
    this.formPaymentMethod = 'Cash';
    this.formSalesOrderId = '';
    this.formSalesInvoiceId = '';
    this.formJournal = '';
    this.formReferenceNumber = '';
    this.formBankName = '';
    this.formNotes = '';
    this.error = '';
    this.showForm = true;
  }

  onInvoiceChange() {
    const inv = this.invoices.find(i => i.id === this.formSalesInvoiceId);
    if (!inv) return;
    if (!this.formContactId && inv.contactId) this.formContactId = inv.contactId;
    if (!this.formAmount || this.formAmount === 0) this.formAmount = inv.balanceDue ?? 0;
  }

  cancelForm() {
    this.showForm = false;
  }

  savePayment() {
    if (!this.formAmount || this.formAmount <= 0) {
      this.error = 'Amount must be greater than 0.';
      return;
    }
    this.error = '';

    if (this.formSalesInvoiceId) {
      // Route through the invoice register-payment endpoint so the invoice
      // paidAmount / balanceDue / status update and the accounting journal entry is created.
      // This is the only path that accepts a payment date and a GL journal.
      if (!this.formPaymentDate) {
        this.error = 'Payment date is required.';
        return;
      }
      const dto: RegisterInvoicePaymentDto = {
        paymentMethod: this.formPaymentMethod || null,
        journal: this.formJournal || null,
        amount: this.formAmount,
        paymentDate: this.formPaymentDate,
        referenceNumber: this.formReferenceNumber || null,
        bankName: this.formBankName || null,
        memo: this.formNotes || null,
      };
      this.invoiceService.registerPayment(this.formSalesInvoiceId, dto).subscribe({
        next: () => { this.successMsg = 'Payment recorded.'; this.showForm = false; this.flashNewestPayment = true; this.load(); },
        error: (err) => { this.error = this.extractError(err, 'Failed to record payment.'); this.cdr.detectChanges(); },
      });
    } else {
      // Plain / order payment. The create endpoint assigns the date server-side
      // and has no journal field, so neither is sent here.
      const dto: CreateSalesPaymentDto = {
        contactId: this.formContactId || null,
        amount: this.formAmount,
        paymentMethod: this.formPaymentMethod || null,
        salesOrderId: this.formSalesOrderId || null,
        referenceNumber: this.formReferenceNumber || null,
        bankName: this.formBankName || null,
        notes: this.formNotes || null,
      };
      this.paymentService.create(dto).subscribe({
        next: () => { this.successMsg = 'Payment recorded.'; this.showForm = false; this.flashNewestPayment = true; this.load(); },
        error: (err) => { this.error = this.extractError(err, 'Failed to record payment.'); this.cdr.detectChanges(); },
      });
    }
  }
}
