import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import {
  EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField,
} from '@nexcore/core';
import { RfqService } from '../../services/rfq.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementCategoryService, ProcurementSettingsService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import {
  RequestForQuotationDto, CreateRFQDto, UpdateRFQDto, CreateRFQLineDto,
} from '../../models/rfq.model';
import { RFQStatus, RFQ_STATUS_LABELS } from '../../models/procurement-enums';
import { VendorDto } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

@Component({
  selector: 'lib-request-for-quotation',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './request-for-quotation.html',
  styleUrl: './request-for-quotation.css',
})
export class RequestForQuotationPage implements OnInit {
  rfqs: RequestForQuotationDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';
  statusFilter: number | '' = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  showForm = false;
  editing: RequestForQuotationDto | null = null;
  formTab: 'details' | 'lines' | 'vendors' = 'details';
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: RequestForQuotationDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    title: '', description: '', submissionDeadline: '', quotationValidityDate: '',
    currencyCode: 'PKR', requiredDeliveryDate: '', termsAndConditions: '', evaluationCriteria: '', notes: '',
  };
  formLines: CreateRFQLineDto[] = [];
  formVendorIds: string[] = [];
  newLine: Partial<CreateRFQLineDto> = { quantity: 1 };
  newVendorId = '';

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];
  defaultCurrency = 'PKR';
  readonly statusFilterOptions = enumOptions(RFQ_STATUS_LABELS);

  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  readonly columns: TableColumn[] = [
    { key: 'rfqNumber', label: 'RFQ #', width: '140px' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => RFQ_STATUS_LABELS[v as RFQStatus] ?? String(v) },
    { key: 'submissionDeadline', label: 'Deadline', type: 'date' },
    { key: 'lines', label: 'Lines', align: 'center', format: (v) => String((v ?? []).length) },
    { key: 'invitedVendors', label: 'Invited', align: 'center', format: (v) => String((v ?? []).length) },
    { key: 'vendorQuotations', label: 'Quotes', align: 'center', format: (v) => String((v ?? []).length) },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️', visible: (r: RequestForQuotationDto) => r.status === RFQStatus.Draft },
    { eventName: 'send', label: 'Send to Vendors', icon: '📤', variant: 'primary', visible: (r: RequestForQuotationDto) => r.status === RFQStatus.Draft },
    { eventName: 'close', label: 'Close', icon: '🔒',
      visible: (r: RequestForQuotationDto) => r.status === RFQStatus.PartiallyReceived || r.status === RFQStatus.FullyReceived },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘',
      visible: (r: RequestForQuotationDto) => r.status === RFQStatus.Draft || r.status === RFQStatus.Sent },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (r: RequestForQuotationDto) => r.status === RFQStatus.Draft },
  ];

  constructor(
    private service: RfqService,
    private vendorService: VendorService,
    private categoryService: ProcurementCategoryService,
    private currencyService: CurrencyLookupService,
    private uomService: UomLookupService,
    private settingsService: ProcurementSettingsService,
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
    this.settingsService.get().subscribe(r => { this.defaultCurrency = r.data?.defaultCurrencyCode || 'PKR'; this.cdr.detectChanges(); });
  }

  unitName(id?: string): string { return this.units.find(u => u.id === id)?.name ?? ''; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => {
        this.rfqs = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.rfqs.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load RFQs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  statusBadge(s: RFQStatus): string {
    switch (s) {
      case RFQStatus.Draft: return 'badge-draft';
      case RFQStatus.Sent: return 'badge-pending';
      case RFQStatus.Awarded: case RFQStatus.FullyReceived: return 'badge-active';
      case RFQStatus.Cancelled: return 'badge-cancelled';
      default: return 'badge-pending';
    }
  }

  vendorName(id: string): string { return this.vendors.find(v => v.id === id)?.name ?? id; }
  categoryName(id?: string): string { return id ? (this.categoryOptions.find(o => o.value === id)?.label ?? '—') : '—'; }

  // ── Item picker ───────────────────────────────────────────────────────────────
  onLineItemSelect(item: EntityPickerItem): void {
    this.newLine.itemId = item['id'];
    this.newLine.itemCode = item['code'] ?? '';
    this.newLine.itemDescription = item['shortDescription'] || item['name'] || this.newLine.itemDescription;
    if (item['purchasePrice'] != null) this.newLine.estimatedUnitPrice = item['purchasePrice'];
    this.cdr.detectChanges();
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null; this.resetForm(); this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
  }

  openEdit(r: RequestForQuotationDto): void {
    // List rows may omit nested lines/vendors — fetch the full record.
    this.service.getById(r.id).subscribe({
      next: (res) => { if (res.data) this.populateEdit(res.data); },
      error: () => this.populateEdit(r),
    });
    this.populateEdit(r);
  }

  private populateEdit(r: RequestForQuotationDto): void {
    this.editing = r;
    this.form = {
      title: r.title,
      description: r.description ?? '',
      submissionDeadline: r.submissionDeadline?.split('T')[0] ?? '',
      quotationValidityDate: r.quotationValidityDate?.split('T')[0] ?? '',
      currencyCode: r.currencyCode,
      requiredDeliveryDate: r.requiredDeliveryDate?.split('T')[0] ?? '',
      termsAndConditions: r.termsAndConditions ?? '',
      evaluationCriteria: r.evaluationCriteria ?? '',
      notes: r.notes ?? '',
    };
    this.formLines = r.lines.map(l => ({
      itemId: l.itemId, itemCode: l.itemCode, itemDescription: l.itemDescription, quantity: l.quantity,
      unitOfMeasureName: l.unitOfMeasureName, estimatedUnitPrice: l.estimatedUnitPrice,
      procurementCategoryId: l.procurementCategoryId, requiredDeliveryDate: l.requiredDeliveryDate?.split('T')[0],
      specifications: l.specifications, notes: l.notes,
    }));
    this.formVendorIds = r.invitedVendors.map(v => v.vendorId);
    this.newLine = { quantity: 1 };
    this.newVendorId = '';
    this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
    this.cdr.detectChanges();
  }

  cancelForm(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      title: '', description: '', submissionDeadline: '', quotationValidityDate: '',
      currencyCode: this.defaultCurrency, requiredDeliveryDate: '', termsAndConditions: '', evaluationCriteria: '', notes: '',
    };
    this.formLines = []; this.formVendorIds = []; this.newLine = { quantity: 1 }; this.newVendorId = '';
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
      specifications: this.newLine.specifications?.trim() || undefined,
      notes: this.newLine.notes?.trim() || undefined,
    });
    this.newLine = { quantity: 1, unitOfMeasureId: undefined };
  }
  removeLine(i: number): void { this.formLines.splice(i, 1); }

  lineEstTotal(l: CreateRFQLineDto): number { return (l.quantity ?? 0) * (l.estimatedUnitPrice ?? 0); }
  get formLinesTotal(): number { return this.formLines.reduce((sum, l) => sum + this.lineEstTotal(l), 0); }

  // ── Invited vendors ─────────────────────────────────────────────────────────────
  addVendor(): void {
    if (!this.newVendorId || this.formVendorIds.includes(this.newVendorId)) return;
    this.formVendorIds.push(this.newVendorId);
    this.newVendorId = '';
  }
  removeVendor(i: number): void { this.formVendorIds.splice(i, 1); }

  // ── Validation / save ───────────────────────────────────────────────────────────
  get errors() {
    return {
      title: requiredText(this.form.title, 'Title'),
      submissionDeadline: this.form.submissionDeadline ? '' : 'Submission deadline is required.',
      lines: this.formLines.length === 0 ? 'Add at least one line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.title && !e.submissionDeadline && !e.lines; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) {
      this.error = this.errors.lines || 'Please correct the highlighted fields.';
      if (this.errors.title || this.errors.submissionDeadline) this.formTab = 'details';
      else if (this.errors.lines) this.formTab = 'lines';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true; this.error = '';

    if (this.editing) {
      const dto: UpdateRFQDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        submissionDeadline: this.form.submissionDeadline,
        quotationValidityDate: this.form.quotationValidityDate || undefined,
        requiredDeliveryDate: this.form.requiredDeliveryDate || undefined,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        evaluationCriteria: this.form.evaluationCriteria.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
      };
      this.service.update(this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'RFQ updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateRFQDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        submissionDeadline: this.form.submissionDeadline,
        quotationValidityDate: this.form.quotationValidityDate || undefined,
        currencyCode: this.form.currencyCode || 'PKR',
        requiredDeliveryDate: this.form.requiredDeliveryDate || undefined,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        evaluationCriteria: this.form.evaluationCriteria.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
        lines: this.formLines,
        vendorIds: this.formVendorIds,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'RFQ created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<RequestForQuotationDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEdit(e.row); break;
      case 'send': this.runAction(this.service.send(e.row.id), 'RFQ sent to vendors'); break;
      case 'close': this.runAction(this.service.close(e.row.id), 'RFQ closed'); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'RFQ cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<RfqService['send']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'RFQ deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
