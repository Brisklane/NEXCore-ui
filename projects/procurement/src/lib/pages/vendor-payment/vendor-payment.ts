import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { VendorPaymentService } from '../../services/vendor-payment.service';
import { InvoiceService } from '../../services/invoice.service';
import { VendorService } from '../../services/vendor.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { VendorPaymentDto, CreateVendorPaymentDto, CreatePaymentAllocationDto } from '../../models/vendor-payment.model';
import { VendorPaymentStatus, VendorPaymentMethod, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../../models/procurement-enums';
import { PurchaseInvoiceDto } from '../../models/invoice.model';
import { VendorDto, VendorBankAccountDto } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, enumOptions } from '../../models/procurement-constants';

interface AllocationRow extends CreatePaymentAllocationDto {
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  outstanding: number;
}

@Component({
  selector: 'lib-vendor-payment',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './vendor-payment.html',
  styleUrl: './vendor-payment.css',
})
export class VendorPaymentPage implements OnInit {
  payments: VendorPaymentDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';
  statusFilter: number | '' = '';

  // Server-side pagination / sort state.
  page = 1;
  pageSize = 10;
  totalCount = 0;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  showForm = false;
  submitted = false;
  saving = false;

  showMarkSentModal = false; sentTargetId = ''; transactionReference = '';
  showClearModal = false; clearTargetId = ''; bankReference = '';
  showDeleteConfirm = false; deleteTarget: VendorPaymentDto | null = null;

  form = {
    vendorId: '', vendorBankAccountId: '', paymentDate: new Date().toISOString().split('T')[0], valueDate: '',
    paymentMethod: VendorPaymentMethod.BankTransfer as number,
    currencyCode: 'PKR', exchangeRate: 1 as number | null, totalAmount: 0 as number | null,
    bankReferenceNumber: '', checkNumber: '', withholdingTaxAmount: 0 as number | null, notes: '',
  };
  allocations: AllocationRow[] = [];

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  vendorBankAccountOptions: SelectOption[] = [];
  readonly methodOptions = enumOptions(PAYMENT_METHOD_LABELS);
  readonly statusFilterOptions = enumOptions(PAYMENT_STATUS_LABELS);

  highlighter = new RowHighlighter();

  readonly columns: TableColumn[] = [
    { key: 'paymentNumber', label: 'Payment #', width: '140px' },
    { key: 'vendorName', label: 'Vendor', format: (v, row) => v ?? this.vendorName(row.vendorId) },
    { key: 'paymentDate', label: 'Date', type: 'date' },
    { key: 'paymentMethod', label: 'Method', format: (v) => PAYMENT_METHOD_LABELS[v as VendorPaymentMethod] ?? String(v) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => PAYMENT_STATUS_LABELS[v as VendorPaymentStatus] ?? String(v) },
    { key: 'totalAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'allocatedAmount', label: 'Allocated', type: 'currency', align: 'right' },
    { key: 'unallocatedAmount', label: 'Unallocated', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    // One-click settle: records the payment, reduces the bill's outstanding, and posts the GL.
    { eventName: 'markPaid', label: 'Mark as Paid', icon: '✅', variant: 'primary',
      visible: (p: VendorPaymentDto) => p.status !== VendorPaymentStatus.Cleared && p.status !== VendorPaymentStatus.Cancelled },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', variant: 'danger',
      visible: (p: VendorPaymentDto) => p.status !== VendorPaymentStatus.Cleared && p.status !== VendorPaymentStatus.Cancelled },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (p: VendorPaymentDto) => p.status === VendorPaymentStatus.Draft },
  ];

  constructor(
    private service: VendorPaymentService,
    private invoiceService: InvoiceService,
    private vendorService: VendorService,
    private currencyService: CurrencyLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined,
      sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => {
        this.payments = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.payments.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load payments'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // Search is debounced; status change is immediate. Both reset to the first page.
  onSearchChange(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300);
  }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load();
  }

  vendorName(id: string): string { return this.vendors.find(v => v.id === id)?.name ?? id; }

  statusBadge(s: VendorPaymentStatus): string {
    switch (s) {
      case VendorPaymentStatus.Cleared: return 'badge-active';
      case VendorPaymentStatus.Cancelled: case VendorPaymentStatus.Returned: return 'badge-blocked';
      case VendorPaymentStatus.Sent: case VendorPaymentStatus.Approved: case VendorPaymentStatus.Processing: return 'badge-pending';
      default: return 'badge-draft';
    }
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void { this.resetForm(); this.submitted = false; this.showForm = true; this.error = ''; this.success = ''; }
  cancelForm(): void { this.showForm = false; this.resetForm(); }

  resetForm(): void {
    this.form = {
      vendorId: '', vendorBankAccountId: '', paymentDate: new Date().toISOString().split('T')[0], valueDate: '',
      paymentMethod: VendorPaymentMethod.BankTransfer, currencyCode: 'PKR', exchangeRate: 1, totalAmount: 0,
      bankReferenceNumber: '', checkNumber: '', withholdingTaxAmount: 0, notes: '',
    };
    this.allocations = [];
    this.vendorBankAccountOptions = [];
  }

  onVendorChange(): void {
    this.allocations = [];
    this.vendorBankAccountOptions = [];
    this.form.vendorBankAccountId = '';
    if (!this.form.vendorId) return;
    this.applyVendorDefaults();
    this.invoiceService.getByVendor(this.form.vendorId).subscribe({
      next: (r) => {
        this.allocations = (r.data ?? [])
          .filter(inv => inv.outstandingAmount > 0)
          .map(inv => ({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            vendorInvoiceNumber: inv.vendorInvoiceNumber,
            outstanding: inv.outstandingAmount,
            allocatedAmount: 0, discountTaken: 0, writeOffAmount: 0,
          }));
        this.cdr.detectChanges();
      },
    });
  }

  /** Default currency and bank account from the selected vendor (create only). */
  private applyVendorDefaults(): void {
    const vendor = this.vendors.find(v => v.id === this.form.vendorId);
    if (!vendor) return;
    if (vendor.currencyCode) this.form.currencyCode = vendor.currencyCode;
    if (vendor.bankAccounts && vendor.bankAccounts.length) {
      this.populateVendorBankAccounts(vendor.bankAccounts);
    } else {
      // The list endpoint may omit bankAccounts; fetch the full vendor.
      this.vendorService.getById(this.form.vendorId).subscribe({
        next: (r) => {
          if (r.data?.currencyCode) this.form.currencyCode = r.data.currencyCode;
          this.populateVendorBankAccounts(r.data?.bankAccounts ?? []);
        },
      });
    }
  }

  private populateVendorBankAccounts(accounts: VendorBankAccountDto[]): void {
    this.vendorBankAccountOptions = accounts.map(b => ({
      value: b.id,
      label: `${b.bankName ?? ''} — ${b.accountNumber} (${b.currencyCode})`,
    }));
    const def = accounts.find(b => b.isDefault);
    this.form.vendorBankAccountId = def ? def.id : (accounts[0]?.id ?? '');
    this.cdr.detectChanges();
  }

  get allocatedTotal(): number { return this.allocations.reduce((s, a) => s + Number(a.allocatedAmount ?? 0), 0); }

  /** Clamp an allocation to the invoice's outstanding amount. */
  clampAllocation(a: AllocationRow): void {
    const v = Number(a.allocatedAmount ?? 0);
    if (v < 0) a.allocatedAmount = 0;
    else if (v > a.outstanding) a.allocatedAmount = a.outstanding;
  }

  /** Auto-allocate the payment total across outstanding invoices (oldest first). */
  autoAllocate(): void {
    let remaining = Number(this.form.totalAmount ?? 0);
    for (const a of this.allocations) {
      const alloc = Math.min(remaining, a.outstanding);
      a.allocatedAmount = alloc > 0 ? alloc : 0;
      remaining -= alloc;
    }
    this.cdr.detectChanges();
  }

  get errors() {
    return {
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      totalAmount: (this.form.totalAmount ?? 0) > 0 ? '' : 'Payment amount must be greater than zero.',
      allocation: this.allocatedTotal > Number(this.form.totalAmount ?? 0) + 0.001
        ? 'Allocated amount exceeds the payment total.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.vendorId && !e.totalAmount && !e.allocation; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.vendorId || this.errors.totalAmount || this.errors.allocation; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: CreateVendorPaymentDto = {
      vendorId: this.form.vendorId,
      vendorBankAccountId: this.form.vendorBankAccountId || undefined,
      paymentDate: this.form.paymentDate,
      valueDate: this.form.valueDate || undefined,
      paymentMethod: Number(this.form.paymentMethod) as VendorPaymentMethod,
      currencyCode: this.form.currencyCode || 'PKR',
      exchangeRate: Number(this.form.exchangeRate ?? 1),
      totalAmount: Number(this.form.totalAmount ?? 0),
      bankReferenceNumber: this.form.bankReferenceNumber.trim() || undefined,
      checkNumber: this.form.checkNumber.trim() || undefined,
      withholdingTaxAmount: Number(this.form.withholdingTaxAmount ?? 0),
      notes: this.form.notes.trim() || undefined,
      allocations: this.allocations
        .filter(a => Number(a.allocatedAmount ?? 0) > 0)
        .map(a => ({
          invoiceId: a.invoiceId, allocatedAmount: Number(a.allocatedAmount),
          discountTaken: Number(a.discountTaken ?? 0), writeOffAmount: Number(a.writeOffAmount ?? 0),
        })),
    };
    this.service.create(dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Payment created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create payment'; this.cdr.detectChanges(); },
    });
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<VendorPaymentDto>): void {
    switch (e.eventName) {
      case 'markPaid': this.clearTargetId = e.row.id; this.bankReference = ''; this.showClearModal = true; break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Payment cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<VendorPaymentService['approve']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmClear(): void {
    this.service.clear(this.clearTargetId, this.bankReference.trim() || undefined).subscribe({
      next: () => { this.success = 'Payment recorded — bill updated and posted to the ledger.'; this.showClearModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed'; this.showClearModal = false; this.cdr.detectChanges(); },
    });
  }
  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Payment deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
