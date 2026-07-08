import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import {
  EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField,
} from '@nexcore/core';
import { InvoiceService } from '../../services/invoice.service';
import { VendorService } from '../../services/vendor.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ProcurementCategoryService, ProcurementSettingsService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import {
  PurchaseInvoiceDto, CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto,
  CreatePurchaseInvoiceLineDto, HoldInvoiceDto, DisputeInvoiceDto,
} from '../../models/invoice.model';
import {
  PurchaseInvoiceStatus, INVOICE_STATUS_LABELS,
  InvoiceMatchingStatus, MATCHING_STATUS_LABELS, InvoicePaymentStatus,
} from '../../models/procurement-enums';
import { VendorDto, PaymentTerms, PAYMENT_TERMS_LABELS } from '../../models/vendor.model';
import { PurchaseOrderDto } from '../../models/purchase-order.model';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

type InvoiceView = 'all' | 'overdue' | 'pendingPayment';

@Component({
  selector: 'lib-purchase-invoice',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './purchase-invoice.html',
  styleUrl: './purchase-invoice.css',
})
export class PurchaseInvoicePage implements OnInit {
  invoices: PurchaseInvoiceDto[] = [];
  vendors: VendorDto[] = [];
  orders: PurchaseOrderDto[] = [];
  loading = false;
  error = '';
  success = '';

  view: InvoiceView = 'all';
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
  editing: PurchaseInvoiceDto | null = null;
  formTab: 'details' | 'lines' | 'notes' = 'details';
  submitted = false;
  saving = false;

  showHoldModal = false; holdTargetId = ''; holdReason = ''; holdSubmitted = false;
  showDisputeModal = false; disputeTargetId = ''; disputeReason = ''; disputeSubmitted = false;
  showDeleteConfirm = false; deleteTarget: PurchaseInvoiceDto | null = null;

  form = {
    vendorInvoiceNumber: '', vendorId: '', purchaseOrderId: '',
    invoiceDate: new Date().toISOString().split('T')[0], dueDate: '',
    postingDate: new Date().toISOString().split('T')[0],
    currencyCode: 'PKR', exchangeRate: 1 as number | null, paymentTerms: PaymentTerms.Net30 as number,
    notes: '', internalNotes: '',
  };
  formLines: CreatePurchaseInvoiceLineDto[] = [];
  newLine: Partial<CreatePurchaseInvoiceLineDto> = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 };

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  poOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];
  readonly paymentTermOptions = enumOptions(PAYMENT_TERMS_LABELS);
  readonly statusFilterOptions = enumOptions(INVOICE_STATUS_LABELS);

  defaultCurrency = 'PKR';

  highlighter = new RowHighlighter();

  private readonly paymentStatusLabels: Record<InvoicePaymentStatus, string> = {
    [InvoicePaymentStatus.NotPaid]: 'Not Paid',
    [InvoicePaymentStatus.InPayment]: 'In Payment',
    [InvoicePaymentStatus.PartiallyPaid]: 'Partially Paid',
    [InvoicePaymentStatus.FullyPaid]: 'Fully Paid',
    [InvoicePaymentStatus.Reversed]: 'Reversed',
  };

  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  readonly columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', width: '130px' },
    { key: 'vendorInvoiceNumber', label: 'Vendor Inv #' },
    { key: 'vendorName', label: 'Vendor', format: (v, row) => v ?? this.vendorName(row.vendorId) },
    { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => INVOICE_STATUS_LABELS[v as PurchaseInvoiceStatus] ?? String(v) },
    { key: 'matchingStatus', label: 'Match', type: 'badge', align: 'center',
      badgeClass: (v) => this.matchBadge(v), format: (v) => MATCHING_STATUS_LABELS[v as InvoiceMatchingStatus] ?? String(v) },
    { key: 'paymentStatus', label: 'Payment', align: 'center',
      format: (v) => this.paymentStatusLabels[v as InvoicePaymentStatus] ?? String(v) },
    { key: 'totalAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️', visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Draft },
    { eventName: 'match', label: '3-Way Match', icon: '🔗',
      visible: (i: PurchaseInvoiceDto) => !!i.purchaseOrderId && i.status === PurchaseInvoiceStatus.UnderApproval },
    { eventName: 'approve', label: 'Approve', icon: '✓', variant: 'primary',
      visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.UnderApproval },
    { eventName: 'post', label: 'Post', icon: '📌', variant: 'primary',
      visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Draft || i.status === PurchaseInvoiceStatus.UnderApproval },
    { eventName: 'hold', label: 'Hold', icon: '⏸️',
      visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Posted || i.status === PurchaseInvoiceStatus.PartiallyPaid },
    { eventName: 'releaseHold', label: 'Release Hold', icon: '▶️', visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.OnHold },
    { eventName: 'dispute', label: 'Dispute', icon: '⚠️',
      visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Posted || i.status === PurchaseInvoiceStatus.PartiallyPaid || i.status === PurchaseInvoiceStatus.OnHold },
    { eventName: 'resolveDispute', label: 'Resolve Dispute', icon: '☑️', visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Disputed },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', variant: 'danger',
      visible: (i: PurchaseInvoiceDto) => i.status !== PurchaseInvoiceStatus.Draft && i.status !== PurchaseInvoiceStatus.FullyPaid && i.status !== PurchaseInvoiceStatus.Cancelled },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (i: PurchaseInvoiceDto) => i.status === PurchaseInvoiceStatus.Draft },
  ];

  constructor(
    private service: InvoiceService,
    private vendorService: VendorService,
    private poService: PurchaseOrderService,
    private categoryService: ProcurementCategoryService,
    private currencyService: CurrencyLookupService,
    private uomService: UomLookupService,
    private settingsService: ProcurementSettingsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.uomService.getUnits().subscribe(u => {
      this.units = u;
      this.uomOptions = u.map(x => ({ value: x.id, label: x.code + ' — ' + x.name }));
      this.cdr.detectChanges();
    });
    this.settingsService.get().subscribe(r => { this.defaultCurrency = r.data?.defaultCurrencyCode || 'PKR'; this.cdr.detectChanges(); });
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
    this.poService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.orders = r.data ?? [];
        this.poOptions = this.orders.map(o => ({ value: o.id, label: `${o.orderNumber} — ${o.vendorName ?? ''}` }));
        this.cdr.detectChanges();
      },
    });
    this.categoryService.getActive().subscribe({
      next: (r) => { this.categoryOptions = (r.data ?? []).map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })); this.cdr.detectChanges(); },
    });
    this.route.data.subscribe(d => { this.view = (d['view'] as InvoiceView) ?? 'all'; this.page = 1; this.load(); });
  }

  get title(): string {
    return this.view === 'overdue' ? 'Overdue Bills'
      : this.view === 'pendingPayment' ? 'Bills Pending Payment'
      : 'Vendor Bills';
  }
  get subtitle(): string {
    return this.view === 'overdue' ? 'Posted invoices past their due date'
      : this.view === 'pendingPayment' ? 'Approved/posted invoices awaiting payment'
      : 'Vendor invoices (accounts payable)';
  }
  get isAllView(): boolean { return this.view === 'all'; }

  load(): void {
    this.loading = true; this.error = '';
    const pagination = {
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined,
      sortDirection: this.sortDirection,
    };
    const obs = this.view === 'overdue' ? this.service.getOverdue(pagination)
      : this.view === 'pendingPayment' ? this.service.getPendingPayment(pagination)
      : this.service.getAll(pagination);
    obs.subscribe({
      next: (r) => {
        this.invoices = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.invoices.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load invoices'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load();
  }

  vendorName(id: string): string { return this.vendors.find(v => v.id === id)?.name ?? id; }
  categoryName(id?: string): string { return id ? (this.categoryOptions.find(o => o.value === id)?.label ?? '—') : '—'; }
  unitName(id?: string): string { return this.units.find(u => u.id === id)?.name ?? ''; }

  matchBadge(s: InvoiceMatchingStatus): string {
    switch (s) {
      case InvoiceMatchingStatus.FullyMatched: return 'badge-active';
      case InvoiceMatchingStatus.MatchException: return 'badge-blocked';
      default: return 'badge-pending';
    }
  }

  statusBadge(s: PurchaseInvoiceStatus): string {
    switch (s) {
      case PurchaseInvoiceStatus.Posted: return 'badge-pending';
      case PurchaseInvoiceStatus.FullyPaid: return 'badge-active';
      case PurchaseInvoiceStatus.Cancelled: return 'badge-blocked';
      case PurchaseInvoiceStatus.OnHold: return 'badge-pending';
      case PurchaseInvoiceStatus.Disputed: return 'badge-blocked';
      default: return 'badge-draft';
    }
  }

  // ── Item picker / PO population ──────────────────────────────────────────────
  onLineItemSelect(item: EntityPickerItem): void {
    this.newLine.itemId = item['id'];
    this.newLine.itemCode = item['code'] ?? '';
    this.newLine.itemDescription = item['shortDescription'] || item['name'] || this.newLine.itemDescription;
    if (item['purchasePrice'] != null) this.newLine.unitPrice = item['purchasePrice'];
    this.cdr.detectChanges();
  }

  onPOChange(): void {
    if (!this.form.purchaseOrderId || this.formLines.length) return;
    // Optional integration: pull billable lines from the PO when one is selected and no lines yet.
    this.poService.getById(this.form.purchaseOrderId).subscribe({
      next: (res) => {
        const po = res.data;
        if (!po) return;
        this.formLines = po.lines
          .filter(l => (l.quantityToInvoice ?? l.quantity) > 0)
          .map(l => ({
            purchaseOrderLineId: l.id, itemId: l.itemId, itemCode: l.itemCode, itemDescription: l.itemDescription,
            quantity: l.quantityToInvoice && l.quantityToInvoice > 0 ? l.quantityToInvoice : l.quantity,
            unitOfMeasureId: l.unitOfMeasureId, unitOfMeasureName: l.unitOfMeasureName,
            unitPrice: l.unitPrice, discountPercent: l.discountPercent, taxPercent: l.taxPercent,
            procurementCategoryId: l.procurementCategoryId,
          }));
        // default payment terms / currency from the PO header
        if (po.currencyCode) this.form.currencyCode = po.currencyCode;
        this.form.paymentTerms = po.paymentTerms;
        // pre-fill vendor invoice number with the PO number as a placeholder (vendors often quote it on their invoice)
        if (!this.form.vendorInvoiceNumber) this.form.vendorInvoiceNumber = po.orderNumber;
        this.recomputeDueDate();
        this.cdr.detectChanges();
      },
    });
  }

  onVendorChange(vendorId: string): void {
    const vendor = this.vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    // A linked PO carries its own currency/terms — don't override them with vendor defaults.
    if (!this.form.purchaseOrderId) {
      if (vendor.currencyCode) this.form.currencyCode = vendor.currencyCode;
      this.form.paymentTerms = vendor.paymentTerms;
    }
    this.recomputeDueDate();
    this.cdr.detectChanges();
  }

  /** Sets the due date from the invoice date plus the offset implied by the payment terms. Stays editable for manual override. */
  recomputeDueDate(): void {
    if (!this.form.invoiceDate) return;
    const base = new Date(this.form.invoiceDate + 'T00:00:00');
    if (isNaN(base.getTime())) return;
    const due = new Date(base);
    switch (Number(this.form.paymentTerms) as PaymentTerms) {
      case PaymentTerms.Net15: due.setDate(due.getDate() + 15); break;
      case PaymentTerms.Net30: due.setDate(due.getDate() + 30); break;
      case PaymentTerms.Net45: due.setDate(due.getDate() + 45); break;
      case PaymentTerms.Net60: due.setDate(due.getDate() + 60); break;
      case PaymentTerms.Net90: due.setDate(due.getDate() + 90); break;
      case PaymentTerms.TwoTenNet30: due.setDate(due.getDate() + 30); break; // '2/10 Net 30' → net 30 days
      case PaymentTerms.EndOfMonth: due.setMonth(due.getMonth() + 1, 0); break; // last day of the invoice month
      case PaymentTerms.Immediate:
      case PaymentTerms.CashOnDelivery:
      case PaymentTerms.AdvancePayment:
      default: break; // due immediately (offset 0)
    }
    this.form.dueDate = due.toISOString().split('T')[0];
  }

  lineTotal(line: Partial<CreatePurchaseInvoiceLineDto>): number {
    const sub = (line.quantity ?? 0) * (line.unitPrice ?? 0) * (1 - (line.discountPercent ?? 0) / 100);
    return sub * (1 + (line.taxPercent ?? 0) / 100);
  }
  get formLinesTotal(): number { return this.formLines.reduce((s, l) => s + this.lineTotal(l), 0); }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void { this.editing = null; this.resetForm(); this.formTab = 'details'; this.submitted = false; this.showForm = true; this.error = ''; this.success = ''; }

  openEdit(inv: PurchaseInvoiceDto): void {
    this.service.getById(inv.id).subscribe({
      next: (res) => { if (res.data) this.populateForm(res.data); },
      error: () => this.populateForm(inv),
    });
    this.populateForm(inv);
  }

  private populateForm(inv: PurchaseInvoiceDto): void {
    this.editing = inv;
    this.form = {
      vendorInvoiceNumber: inv.vendorInvoiceNumber, vendorId: inv.vendorId, purchaseOrderId: inv.purchaseOrderId ?? '',
      invoiceDate: inv.invoiceDate?.split('T')[0] ?? '', dueDate: inv.dueDate?.split('T')[0] ?? '',
      postingDate: inv.postingDate?.split('T')[0] ?? '', currencyCode: inv.currencyCode, exchangeRate: inv.exchangeRate,
      paymentTerms: inv.paymentTerms, notes: inv.notes ?? '', internalNotes: inv.internalNotes ?? '',
    };
    this.formLines = inv.lines.map(l => ({
      purchaseOrderLineId: l.purchaseOrderLineId, goodsReceiptLineId: l.goodsReceiptLineId, itemId: l.itemId,
      itemCode: l.itemCode, itemDescription: l.itemDescription, quantity: l.quantity, unitPrice: l.unitPrice,
      discountPercent: l.discountPercent, taxPercent: l.taxPercent, procurementCategoryId: l.procurementCategoryId, notes: l.notes,
    }));
    this.newLine = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
    this.formTab = 'details'; this.submitted = false; this.showForm = true; this.error = ''; this.success = '';
    this.cdr.detectChanges();
  }

  cancelForm(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      vendorInvoiceNumber: '', vendorId: '', purchaseOrderId: '',
      invoiceDate: new Date().toISOString().split('T')[0], dueDate: '',
      postingDate: new Date().toISOString().split('T')[0],
      currencyCode: this.defaultCurrency, exchangeRate: 1, paymentTerms: PaymentTerms.Net30, notes: '', internalNotes: '',
    };
    this.formLines = []; this.newLine = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0, unitOfMeasureId: undefined };
    this.recomputeDueDate();
  }

  // ── Lines ──────────────────────────────────────────────────────────────────────
  get newLineError(): string {
    if (!this.newLine.itemDescription?.trim()) return 'Select an item or enter a description.';
    if ((this.newLine.quantity ?? 0) <= 0) return 'Quantity must be greater than zero.';
    return '';
  }
  addLine(): void {
    if (this.newLineError) { this.error = this.newLineError; return; }
    this.error = '';
    this.formLines.push({
      itemId: this.newLine.itemId || undefined, itemCode: this.newLine.itemCode?.trim() || undefined,
      itemDescription: this.newLine.itemDescription!.trim(), quantity: Number(this.newLine.quantity),
      unitOfMeasureId: this.newLine.unitOfMeasureId || undefined,
      unitOfMeasureName: this.unitName(this.newLine.unitOfMeasureId) || undefined,
      unitPrice: Number(this.newLine.unitPrice ?? 0),
      discountPercent: this.newLine.discountPercent != null ? Number(this.newLine.discountPercent) : undefined,
      taxPercent: this.newLine.taxPercent != null ? Number(this.newLine.taxPercent) : undefined,
      procurementCategoryId: this.newLine.procurementCategoryId || undefined,
      notes: this.newLine.notes?.trim() || undefined,
    });
    this.newLine = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0, unitOfMeasureId: undefined };
  }
  removeLine(i: number): void { this.formLines.splice(i, 1); }

  // ── Validation / save ───────────────────────────────────────────────────────────
  get errors() {
    return {
      vendorInvoiceNumber: requiredText(this.form.vendorInvoiceNumber, 'Vendor invoice number'),
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      dueDate: this.form.dueDate ? '' : 'Due date is required.',
      lines: this.formLines.length === 0 ? 'Add at least one line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.vendorInvoiceNumber && !e.vendorId && !e.dueDate && !e.lines; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) {
      this.error = this.errors.lines || 'Please correct the highlighted fields.';
      this.formTab = this.errors.lines && !this.errors.vendorInvoiceNumber && !this.errors.vendorId && !this.errors.dueDate ? 'lines' : 'details';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true; this.error = '';

    if (this.editing) {
      const upd: UpdatePurchaseInvoiceDto = {
        invoiceDate: this.form.invoiceDate || undefined,
        dueDate: this.form.dueDate || undefined,
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.update(this.editing.id, upd).subscribe({
        next: () => { this.saving = false; this.success = 'Invoice updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePurchaseInvoiceDto = {
        vendorInvoiceNumber: this.form.vendorInvoiceNumber.trim(),
        vendorId: this.form.vendorId,
        purchaseOrderId: this.form.purchaseOrderId || undefined,
        invoiceDate: this.form.invoiceDate,
        dueDate: this.form.dueDate,
        postingDate: this.form.postingDate || undefined,
        currencyCode: this.form.currencyCode || 'PKR',
        exchangeRate: Number(this.form.exchangeRate ?? 1),
        paymentTerms: Number(this.form.paymentTerms) as PaymentTerms,
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Invoice created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Row actions / lifecycle ───────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<PurchaseInvoiceDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEdit(e.row); break;
      case 'match': this.runAction(this.service.threeWayMatch(e.row.id), '3-way match complete'); break;
      case 'approve': this.runAction(this.service.approve(e.row.id), 'Invoice approved'); break;
      case 'post': this.runAction(this.service.post(e.row.id), 'Invoice posted'); break;
      case 'releaseHold': this.runAction(this.service.releaseHold(e.row.id), 'Hold released'); break;
      case 'resolveDispute': this.runAction(this.service.resolveDispute(e.row.id), 'Dispute resolved'); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Invoice cancelled'); break;
      case 'hold': this.holdTargetId = e.row.id; this.holdReason = ''; this.holdSubmitted = false; this.showHoldModal = true; break;
      case 'dispute': this.disputeTargetId = e.row.id; this.disputeReason = ''; this.disputeSubmitted = false; this.showDisputeModal = true; break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<InvoiceService['post']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmHold(): void {
    this.holdSubmitted = true;
    if (!this.holdReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: HoldInvoiceDto = { holdReason: this.holdReason.trim() };
    this.service.hold(this.holdTargetId, dto).subscribe({
      next: () => { this.success = 'Invoice on hold'; this.showHoldModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to hold'; this.showHoldModal = false; this.cdr.detectChanges(); },
    });
  }
  confirmDispute(): void {
    this.disputeSubmitted = true;
    if (!this.disputeReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: DisputeInvoiceDto = { disputeReason: this.disputeReason.trim() };
    this.service.dispute(this.disputeTargetId, dto).subscribe({
      next: () => { this.success = 'Invoice disputed'; this.showDisputeModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to dispute'; this.showDisputeModal = false; this.cdr.detectChanges(); },
    });
  }
  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Invoice deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
