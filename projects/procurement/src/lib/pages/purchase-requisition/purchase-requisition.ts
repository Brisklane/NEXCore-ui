import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import {
  EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField,
} from '@nexcore/core';
import { RequisitionService } from '../../services/requisition.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementCategoryService, ProcurementSettingsService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import {
  PurchaseRequisitionDto, CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionDto,
  CreatePurchaseRequisitionLineDto, RejectRequisitionDto,
} from '../../models/requisition.model';
import {
  RequisitionStatus, RequisitionPriority,
  REQUISITION_STATUS_LABELS, REQUISITION_PRIORITY_LABELS,
} from '../../models/procurement-enums';
import { VendorDto } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

@Component({
  selector: 'lib-purchase-requisition',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './purchase-requisition.html',
  styleUrl: './purchase-requisition.css',
})
export class PurchaseRequisitionPage implements OnInit {
  requisitions: PurchaseRequisitionDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  // Filters
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
  editing: PurchaseRequisitionDto | null = null;
  formTab: 'details' | 'lines' = 'details';
  submitted = false;
  saving = false;

  showRejectModal = false;
  rejectTargetId = '';
  rejectionReason = '';
  rejectSubmitted = false;

  showDeleteConfirm = false;
  deleteTarget: PurchaseRequisitionDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    title: '', description: '', requestedByName: '', departmentName: '',
    requiredByDate: '', priority: RequisitionPriority.Normal as number,
    suggestedVendorId: '', currencyCode: 'PKR', notes: '', internalNotes: '',
  };

  formLines: CreatePurchaseRequisitionLineDto[] = [];
  newLine: Partial<CreatePurchaseRequisitionLineDto> = { quantity: 1 };
  /** "code - name" label for the picker input (the API-driven item may not be in any local cache). */
  newLineItemLabel = '';

  // Option sets
  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  readonly priorityOptions = enumOptions(REQUISITION_PRIORITY_LABELS);
  vendorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];

  defaultCurrency = 'PKR';

  // Item picker
  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  readonly columns: TableColumn[] = [
    { key: 'requisitionNumber', label: 'Requisition #', width: '140px' },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority', type: 'badge', align: 'center',
      badgeClass: (v) => this.priorityBadge(v), format: (v) => REQUISITION_PRIORITY_LABELS[v as RequisitionPriority] ?? String(v) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => REQUISITION_STATUS_LABELS[v as RequisitionStatus] ?? String(v) },
    { key: 'isBudgetChecked', label: 'Budget', type: 'badge', align: 'center',
      badgeClass: (_v, row) => this.budgetBadge(row as PurchaseRequisitionDto),
      format: (_v, row) => this.budgetLabel(row as PurchaseRequisitionDto) },
    { key: 'requiredByDate', label: 'Required By', type: 'date' },
    { key: 'estimatedTotalAmount', label: 'Est. Total', type: 'currency', align: 'right' },
    { key: 'lines', label: 'Lines', align: 'center', format: (v) => String((v ?? []).length) },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️', visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Draft },
    { eventName: 'submit', label: 'Submit', icon: '📤', variant: 'primary', visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Draft },
    { eventName: 'reject', label: 'Reject', icon: '✕', variant: 'danger',
      visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Submitted || r.status === RequisitionStatus.UnderApproval },
    { eventName: 'convert', label: 'Convert to PO', icon: '🛒', variant: 'primary',
      visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Approved && !r.hasPurchaseOrder },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘',
      visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Draft || r.status === RequisitionStatus.Submitted },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (r: PurchaseRequisitionDto) => r.status === RequisitionStatus.Draft },
  ];

  constructor(
    private service: RequisitionService,
    private vendorService: VendorService,
    private categoryService: ProcurementCategoryService,
    private currencyService: CurrencyLookupService,
    private uomService: UomLookupService,
    private settingsService: ProcurementSettingsService,
    private router: Router,
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
    this.categoryService.getActive().subscribe({
      next: (r) => { this.categoryOptions = (r.data ?? []).map(c => ({ value: c.id, label: `${c.code} — ${c.name}` })); this.cdr.detectChanges(); },
    });
    this.uomService.getUnits().subscribe(u => {
      this.units = u;
      this.uomOptions = u.map(x => ({ value: x.id, label: x.code + ' — ' + x.name }));
      this.cdr.detectChanges();
    });
    this.settingsService.get().subscribe(r => {
      this.defaultCurrency = r.data?.defaultCurrencyCode || 'PKR';
      this.cdr.detectChanges();
    });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => { this.requisitions = r.data ?? []; this.totalCount = r.pagination?.totalCount ?? this.requisitions.length; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load requisitions'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  readonly statusFilterOptions = enumOptions(REQUISITION_STATUS_LABELS);

  statusBadge(s: RequisitionStatus): string {
    switch (s) {
      case RequisitionStatus.Draft: return 'badge-draft';
      case RequisitionStatus.Approved: case RequisitionStatus.Fulfilled: return 'badge-active';
      case RequisitionStatus.Rejected: return 'badge-blocked';
      case RequisitionStatus.Cancelled: return 'badge-cancelled';
      default: return 'badge-pending';
    }
  }
  priorityBadge(p: RequisitionPriority): string {
    switch (p) {
      case RequisitionPriority.Urgent: return 'badge-blocked';
      case RequisitionPriority.High: return 'badge-pending';
      default: return 'badge-no';
    }
  }

  budgetLabel(r: PurchaseRequisitionDto): string {
    if (!r.isBudgetChecked) return 'Not checked';
    return r.isBudgetAvailable ? 'Within budget' : 'Over budget';
  }
  budgetBadge(r: PurchaseRequisitionDto): string {
    if (!r.isBudgetChecked) return 'badge-no';
    return r.isBudgetAvailable ? 'badge-active' : 'badge-blocked';
  }

  unitName(id?: string): string { return this.units.find(u => u.id === id)?.name ?? ''; }

  // ── Item picker ───────────────────────────────────────────────────────────────
  onLineItemSelect(item: EntityPickerItem): void {
    this.newLine.itemId = item['id'];
    this.newLine.itemCode = item['code'] ?? '';
    const code = (item['code'] ?? '').toString().trim();
    const name = (item['name'] ?? '').toString().trim();
    this.newLineItemLabel = [code, name].filter(Boolean).join(' - ') || name || code;
    this.newLine.itemDescription = item['shortDescription'] || item['name'] || this.newLine.itemDescription;
    if (item['purchasePrice'] != null) this.newLine.estimatedUnitPrice = item['purchasePrice'];
    this.cdr.detectChanges();
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null;
    this.resetForm();
    this.formTab = 'details';
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(r: PurchaseRequisitionDto): void {
    this.editing = r;
    this.form = {
      title: r.title,
      description: r.description ?? '',
      requestedByName: r.requestedByName ?? '',
      departmentName: r.departmentName ?? '',
      requiredByDate: r.requiredByDate?.split('T')[0] ?? '',
      priority: r.priority,
      suggestedVendorId: r.suggestedVendorId ?? '',
      currencyCode: r.currencyCode,
      notes: r.notes ?? '',
      internalNotes: r.internalNotes ?? '',
    };
    this.formLines = r.lines.map(l => ({
      itemId: l.itemId, itemCode: l.itemCode, itemDescription: l.itemDescription, quantity: l.quantity,
      unitOfMeasureName: l.unitOfMeasureName, estimatedUnitPrice: l.estimatedUnitPrice,
      procurementCategoryId: l.procurementCategoryId, requiredByDate: l.requiredByDate?.split('T')[0],
      suggestedVendorId: l.suggestedVendorId, notes: l.notes,
    }));
    this.newLine = { quantity: 1 }; this.newLineItemLabel = '';
    this.formTab = 'details';
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  cancelForm(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      title: '', description: '', requestedByName: '', departmentName: '',
      requiredByDate: '', priority: RequisitionPriority.Normal,
      suggestedVendorId: '', currencyCode: this.defaultCurrency, notes: '', internalNotes: '',
    };
    this.formLines = [];
    this.newLine = { quantity: 1 }; this.newLineItemLabel = '';
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
      itemId: this.newLine.itemId || undefined,
      itemCode: this.newLine.itemCode?.trim() || undefined,
      itemDescription: this.newLine.itemDescription!.trim(),
      quantity: Number(this.newLine.quantity),
      unitOfMeasureId: this.newLine.unitOfMeasureId || undefined,
      unitOfMeasureName: this.unitName(this.newLine.unitOfMeasureId) || undefined,
      estimatedUnitPrice: this.newLine.estimatedUnitPrice != null ? Number(this.newLine.estimatedUnitPrice) : undefined,
      procurementCategoryId: this.newLine.procurementCategoryId || undefined,
      notes: this.newLine.notes?.trim() || undefined,
    });
    this.newLine = { quantity: 1 }; this.newLineItemLabel = '';
  }
  removeLine(i: number): void { this.formLines.splice(i, 1); }

  lineEstimated(line: Partial<CreatePurchaseRequisitionLineDto>): number {
    return (line.quantity ?? 0) * (line.estimatedUnitPrice ?? 0);
  }
  get formLinesTotal(): number { return this.formLines.reduce((s, l) => s + this.lineEstimated(l), 0); }
  categoryName(id?: string): string { return id ? (this.categoryOptions.find(o => o.value === id)?.label ?? '—') : '—'; }

  // ── Validation / save ───────────────────────────────────────────────────────────
  get errors() {
    return {
      title: requiredText(this.form.title, 'Title'),
      lines: this.formLines.length === 0 ? 'Add at least one line.' : '',
    };
  }
  get isValid(): boolean { return !this.errors.title && !this.errors.lines; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) {
      this.error = this.errors.lines || 'Please correct the highlighted fields.';
      if (this.errors.title) this.formTab = 'details';
      else if (this.errors.lines) this.formTab = 'lines';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true; this.error = '';

    if (this.editing) {
      const upd: UpdatePurchaseRequisitionDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        requiredByDate: this.form.requiredByDate || undefined,
        priority: Number(this.form.priority) as RequisitionPriority,
        suggestedVendorId: this.form.suggestedVendorId || undefined,
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.update(this.editing.id, upd).subscribe({
        next: () => { this.saving = false; this.success = 'Requisition updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePurchaseRequisitionDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        requestedByUserId: EMPTY_GUID,
        requestedByName: this.form.requestedByName.trim() || undefined,
        departmentName: this.form.departmentName.trim() || undefined,
        requiredByDate: this.form.requiredByDate || undefined,
        priority: Number(this.form.priority) as RequisitionPriority,
        suggestedVendorId: this.form.suggestedVendorId || undefined,
        currencyCode: this.form.currencyCode || 'PKR',
        notes: this.form.notes.trim() || undefined,
        internalNotes: this.form.internalNotes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Requisition created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Row actions / lifecycle ───────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<PurchaseRequisitionDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEdit(e.row); break;
      case 'submit': this.submitRequisition(e.row); break;
      case 'reject': this.openRejectModal(e.row); break;
      case 'convert': this.convertToOrder(e.row); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Requisition cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private convertToOrder(r: PurchaseRequisitionDto): void {
    this.error = ''; this.success = '';
    this.service.convertToOrder(r.id).subscribe({
      next: (res) => {
        this.success = `Purchase order ${res.data?.orderNumber ?? ''} created from ${r.requisitionNumber}`;
        // Land the buyer on the all-orders screen where the new draft PO appears.
        this.router.navigate(['/procurement/purchase-orders']);
      },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to convert to purchase order'; this.cdr.detectChanges(); },
    });
  }

  private runAction(obs: ReturnType<RequisitionService['submit']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  /** Submit approves in one step — there is no separate Approve action; once submitted the
   *  requisition is approved and ready to convert to a purchase order. */
  private submitRequisition(row: PurchaseRequisitionDto): void {
    this.service.submit(row.id).subscribe({
      next: () => {
        this.service.approve(row.id).subscribe({
          next: () => { this.success = 'Requisition submitted & approved'; this.load(); },
          error: (e) => { this.error = e?.error?.message ?? 'Submitted, but approval failed'; this.load(); },
        });
      },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to submit'; this.cdr.detectChanges(); },
    });
  }

  openRejectModal(r: PurchaseRequisitionDto): void {
    this.rejectTargetId = r.id; this.rejectionReason = ''; this.rejectSubmitted = false; this.showRejectModal = true;
  }
  confirmReject(): void {
    this.rejectSubmitted = true;
    if (!this.rejectionReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: RejectRequisitionDto = { rejectionReason: this.rejectionReason.trim() };
    this.service.reject(this.rejectTargetId, dto).subscribe({
      next: () => { this.success = 'Requisition rejected'; this.showRejectModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to reject'; this.showRejectModal = false; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Requisition deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
