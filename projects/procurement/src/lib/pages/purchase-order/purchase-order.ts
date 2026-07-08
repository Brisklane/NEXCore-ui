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
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementCategoryService, ProcurementSettingsService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import {
  PurchaseOrderDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto,
  CancelPurchaseOrderDto, CreatePurchaseOrderLineDto,
  PurchaseOrderStatus, Incoterm, PO_STATUS_LABELS, INCOTERM_LABELS,
} from '../../models/purchase-order.model';
import { VendorDto, PaymentTerms, PAYMENT_TERMS_LABELS } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

type PoView = 'all' | 'pendingReceipt' | 'toInvoice';

@Component({
  selector: 'lib-purchase-order',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.css',
})
export class PurchaseOrder implements OnInit {
  orders: PurchaseOrderDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  view: PoView = 'all';
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
  editingOrder: PurchaseOrderDto | null = null;
  formTab: 'details' | 'lines' | 'notes' = 'details';
  submitted = false;
  saving = false;

  showCancelModal = false;
  cancelTargetId = '';
  cancellationReason = '';
  cancelSubmitted = false;

  showDeleteConfirm = false;
  deleteTarget: PurchaseOrderDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    vendorId: '', vendorReference: '', orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '', currencyCode: 'PKR', exchangeRate: 1 as number | null,
    paymentTerms: PaymentTerms.Net30 as number, incoterm: '' as number | '', incotermLocation: '',
    shippingAmount: 0 as number | null,
    deliveryStreet: '', deliveryCity: '', deliveryState: '', deliveryPostalCode: '', deliveryCountry: '',
    termsAndConditions: '', notes: '', internalNotes: '',
  };
  formLines: CreatePurchaseOrderLineDto[] = [];
  newLine: Partial<CreatePurchaseOrderLineDto> = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 };

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];
  defaultCurrency = 'PKR';
  readonly paymentTermOptions = enumOptions(PAYMENT_TERMS_LABELS);
  readonly incotermOptions = enumOptions(INCOTERM_LABELS);
  readonly statusFilterOptions = enumOptions(PO_STATUS_LABELS);

  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  readonly columns: TableColumn[] = [
    { key: 'orderNumber', label: 'Order #', width: '140px' },
    { key: 'vendorName', label: 'Vendor', format: (v, row) => v ?? this.vendorName(row.vendorId) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => PO_STATUS_LABELS[v as PurchaseOrderStatus] ?? String(v) },
    { key: 'orderDate', label: 'Order Date', type: 'date' },
    { key: 'expectedDeliveryDate', label: 'Expected', type: 'date' },
    { key: 'totalAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️', visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.Draft },
    { eventName: 'confirm', label: 'Confirm', icon: '✓', variant: 'primary', visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.Draft },
    { eventName: 'acknowledge', label: 'Acknowledge', icon: '☑️', visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.SentToVendor },
    { eventName: 'close', label: 'Close', icon: '🔒',
      visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.FullyReceived || o.status === PurchaseOrderStatus.FullyInvoiced },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', variant: 'danger',
      visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.Confirmed || o.status === PurchaseOrderStatus.SentToVendor },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (o: PurchaseOrderDto) => o.status === PurchaseOrderStatus.Draft },
  ];

  constructor(
    private service: PurchaseOrderService,
    private vendorService: VendorService,
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
      next: (res) => {
        this.vendors = res.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
    this.categoryService.getActive().subscribe({
      next: (r) => { this.categoryOptions = (r.data ?? []).map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })); this.cdr.detectChanges(); },
    });
    // React to the route (All Orders / Pending Receipt / To Invoice reuse this component).
    this.route.data.subscribe(d => { this.view = (d['view'] as PoView) ?? 'all'; this.page = 1; this.load(); });
  }

  get title(): string {
    return this.view === 'pendingReceipt' ? 'Purchase Orders — Pending Receipt'
      : this.view === 'toInvoice' ? 'Purchase Orders — To Invoice'
      : 'Purchase Orders';
  }
  get subtitle(): string {
    return this.view === 'pendingReceipt' ? 'Confirmed orders awaiting goods receipt'
      : this.view === 'toInvoice' ? 'Received orders awaiting vendor invoicing'
      : 'Create and manage purchase orders';
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
    const obs = this.view === 'pendingReceipt' ? this.service.getPendingReceipt(pagination)
      : this.view === 'toInvoice' ? this.service.getToInvoice(pagination)
      : this.service.getAll(pagination);
    obs.subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? this.orders.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load purchase orders'; this.loading = false; this.cdr.detectChanges(); },
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

  /** When creating, default the currency and payment terms from the selected vendor. */
  onVendorChange(vendorId: string): void {
    if (this.editingOrder) return;
    const vendor = this.vendors.find(v => v.id === vendorId);
    if (vendor) {
      this.form.currencyCode = vendor.currencyCode;
      this.form.paymentTerms = vendor.paymentTerms;
    }
    this.cdr.detectChanges();
  }

  statusBadge(s: PurchaseOrderStatus): string {
    switch (s) {
      case PurchaseOrderStatus.Draft: return 'badge-draft';
      case PurchaseOrderStatus.Cancelled: return 'badge-blocked';
      case PurchaseOrderStatus.Closed: return 'badge-inactive';
      case PurchaseOrderStatus.FullyReceived: case PurchaseOrderStatus.FullyInvoiced: return 'badge-active';
      default: return 'badge-pending';
    }
  }

  // ── Item picker ───────────────────────────────────────────────────────────────
  onLineItemSelect(item: EntityPickerItem): void {
    this.newLine.itemId = item['id'];
    this.newLine.itemCode = item['code'] ?? '';
    this.newLine.itemDescription = item['shortDescription'] || item['name'] || this.newLine.itemDescription;
    if (item['purchasePrice'] != null) this.newLine.unitPrice = item['purchasePrice'];
    const uomId = item['unitOfMeasureId'] ?? item['baseUnitId'];
    if (uomId != null) this.newLine.unitOfMeasureId = uomId;
    this.cdr.detectChanges();
  }

  // ── Line math ──────────────────────────────────────────────────────────────────
  lineTotal(line: Partial<CreatePurchaseOrderLineDto>): number {
    const sub = (line.quantity ?? 0) * (line.unitPrice ?? 0) * (1 - (line.discountPercent ?? 0) / 100);
    return sub * (1 + (line.taxPercent ?? 0) / 100);
  }
  get formLinesTotal(): number { return this.formLines.reduce((s, l) => s + this.lineTotal(l), 0); }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.editingOrder = null; this.resetForm(); this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
  }

  openEditForm(order: PurchaseOrderDto): void {
    this.service.getById(order.id).subscribe({
      next: (res) => { if (res.data) this.populateForm(res.data); },
      error: () => this.populateForm(order),
    });
    this.populateForm(order);
  }

  private populateForm(order: PurchaseOrderDto): void {
    this.editingOrder = order;
    this.form = {
      vendorId: order.vendorId,
      vendorReference: order.vendorReference ?? '',
      orderDate: order.orderDate?.split('T')[0] ?? '',
      expectedDeliveryDate: order.expectedDeliveryDate?.split('T')[0] ?? '',
      currencyCode: order.currencyCode,
      exchangeRate: order.exchangeRate,
      paymentTerms: order.paymentTerms,
      incoterm: order.incoterm ?? '',
      incotermLocation: order.incotermLocation ?? '',
      shippingAmount: order.shippingAmount,
      deliveryStreet: order.deliveryStreet ?? '', deliveryCity: order.deliveryCity ?? '',
      deliveryState: order.deliveryState ?? '', deliveryPostalCode: order.deliveryPostalCode ?? '',
      deliveryCountry: order.deliveryCountry ?? '',
      termsAndConditions: order.termsAndConditions ?? '', notes: order.notes ?? '', internalNotes: order.internalNotes ?? '',
    };
    this.formLines = order.lines.map(l => ({
      itemId: l.itemId, itemCode: l.itemCode, itemDescription: l.itemDescription, quantity: l.quantity,
      unitOfMeasureId: l.unitOfMeasureId, unitOfMeasureName: l.unitOfMeasureName, unitPrice: l.unitPrice,
      discountPercent: l.discountPercent, taxPercent: l.taxPercent, procurementCategoryId: l.procurementCategoryId,
      expectedDeliveryDate: l.expectedDeliveryDate?.split('T')[0], notes: l.notes,
    }));
    this.newLine = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
    this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
    this.cdr.detectChanges();
  }

  cancelForm(): void { this.showForm = false; this.editingOrder = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      vendorId: '', vendorReference: '', orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '', currencyCode: this.defaultCurrency, exchangeRate: 1,
      paymentTerms: PaymentTerms.Net30, incoterm: '', incotermLocation: '', shippingAmount: 0,
      deliveryStreet: '', deliveryCity: '', deliveryState: '', deliveryPostalCode: '', deliveryCountry: '',
      termsAndConditions: '', notes: '', internalNotes: '',
    };
    this.formLines = [];
    this.newLine = { quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 };
  }

  // ── Lines ──────────────────────────────────────────────────────────────────────
  get newLineError(): string {
    if (!this.newLine.itemDescription?.trim()) return 'Select an item or enter a description.';
    if ((this.newLine.quantity ?? 0) <= 0) return 'Quantity must be greater than zero.';
    if ((this.newLine.unitPrice ?? 0) < 0) return 'Unit price cannot be negative.';
    return '';
  }
  addLine(): void {
    if (this.newLineError) { this.error = this.newLineError; return; }
    this.error = '';
    this.formLines.push({
      itemId: this.newLine.itemId || undefined,
      itemCode: this.newLine.itemCode?.trim() || undefined,
      itemDescription: this.newLine.itemDescription!.trim(),
      quantity: Number(this.newLine.quantity),
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
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      orderDate: requiredText(this.form.orderDate, 'Order date'),
      lines: this.formLines.length === 0 ? 'Add at least one order line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.vendorId && !e.orderDate && !e.lines; }

  saveOrder(): void {
    this.submitted = true;
    if (!this.isValid) {
      this.error = this.errors.lines || 'Please correct the highlighted fields.';
      if (this.errors.vendorId || this.errors.orderDate) this.formTab = 'details';
      else if (this.errors.lines) this.formTab = 'lines';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true; this.error = '';

    if (this.editingOrder) {
      const update: UpdatePurchaseOrderDto = {
        vendorReference: this.form.vendorReference.trim() || undefined,
        expectedDeliveryDate: this.form.expectedDeliveryDate || undefined,
        deliveryStreet: this.form.deliveryStreet.trim() || undefined,
        deliveryCity: this.form.deliveryCity.trim() || undefined,
        deliveryState: this.form.deliveryState.trim() || undefined,
        deliveryPostalCode: this.form.deliveryPostalCode.trim() || undefined,
        deliveryCountry: this.form.deliveryCountry.trim() || undefined,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.update(this.editingOrder.id, update).subscribe({
        next: () => { this.saving = false; this.success = 'Purchase order updated'; this.showForm = false; this.load(); },
        error: (err) => { this.saving = false; this.error = err?.error?.message ?? 'Failed to update purchase order'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePurchaseOrderDto = {
        vendorId: this.form.vendorId,
        vendorReference: this.form.vendorReference.trim() || undefined,
        orderDate: this.form.orderDate,
        expectedDeliveryDate: this.form.expectedDeliveryDate || undefined,
        currencyCode: this.form.currencyCode || 'PKR',
        exchangeRate: Number(this.form.exchangeRate ?? 1),
        paymentTerms: Number(this.form.paymentTerms) as PaymentTerms,
        incoterm: this.form.incoterm === '' ? undefined : Number(this.form.incoterm) as Incoterm,
        incotermLocation: this.form.incotermLocation.trim() || undefined,
        shippingAmount: Number(this.form.shippingAmount ?? 0),
        deliveryStreet: this.form.deliveryStreet.trim() || undefined,
        deliveryCity: this.form.deliveryCity.trim() || undefined,
        deliveryState: this.form.deliveryState.trim() || undefined,
        deliveryPostalCode: this.form.deliveryPostalCode.trim() || undefined,
        deliveryCountry: this.form.deliveryCountry.trim() || undefined,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Purchase order created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (err) => { this.saving = false; this.error = err?.error?.message ?? 'Failed to create purchase order'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Row actions / lifecycle ───────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<PurchaseOrderDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEditForm(e.row); break;
      case 'confirm': this.confirmOrder(e.row); break;
      case 'acknowledge': this.runAction(this.service.acknowledge(e.row.id), 'Order acknowledged'); break;
      case 'close': this.runAction(this.service.close(e.row.id), 'Order closed'); break;
      case 'cancel': this.openCancelModal(e.row); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  /** Confirm sends the order to the vendor in one step — there is no separate Send action. */
  private confirmOrder(row: PurchaseOrderDto): void {
    this.service.confirm(row.id).subscribe({
      next: () => {
        this.service.sendToVendor(row.id).subscribe({
          next: () => { this.success = 'Order confirmed & sent to vendor'; this.load(); },
          error: (e) => { this.error = e?.error?.message ?? 'Confirmed, but sending to vendor failed'; this.load(); },
        });
      },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to confirm order'; this.cdr.detectChanges(); },
    });
  }

  private runAction(obs: ReturnType<PurchaseOrderService['confirm']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  openCancelModal(order: PurchaseOrderDto): void {
    this.cancelTargetId = order.id; this.cancellationReason = ''; this.cancelSubmitted = false; this.showCancelModal = true;
  }
  confirmCancel(): void {
    this.cancelSubmitted = true;
    if (!this.cancellationReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: CancelPurchaseOrderDto = { cancellationReason: this.cancellationReason.trim() };
    this.service.cancel(this.cancelTargetId, dto).subscribe({
      next: () => { this.success = 'Order cancelled'; this.showCancelModal = false; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to cancel order'; this.showCancelModal = false; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Order deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to delete order'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
