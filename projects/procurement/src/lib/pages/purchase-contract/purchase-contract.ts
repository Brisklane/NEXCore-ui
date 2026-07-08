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
import { ContractService } from '../../services/contract.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementCategoryService, ProcurementSettingsService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import {
  PurchaseContractDto, CreatePurchaseContractDto, UpdatePurchaseContractDto,
  CreatePurchaseContractLineDto, TerminateContractDto,
} from '../../models/contract.model';
import {
  PurchaseContractStatus, PurchaseContractType, CONTRACT_STATUS_LABELS, CONTRACT_TYPE_LABELS,
} from '../../models/procurement-enums';
import { VendorDto, PaymentTerms, PAYMENT_TERMS_LABELS } from '../../models/vendor.model';
import { Incoterm, INCOTERM_LABELS } from '../../models/purchase-order.model';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

@Component({
  selector: 'lib-purchase-contract',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './purchase-contract.html',
  styleUrl: './purchase-contract.css',
})
export class PurchaseContractPage implements OnInit {
  contracts: PurchaseContractDto[] = [];
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
  editing: PurchaseContractDto | null = null;
  formTab: 'details' | 'lines' | 'terms' = 'details';
  submitted = false;
  saving = false;

  showTerminateModal = false;
  terminateTargetId = '';
  terminationReason = '';
  terminateSubmitted = false;

  showDeleteConfirm = false;
  deleteTarget: PurchaseContractDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    title: '', description: '', vendorId: '',
    contractType: PurchaseContractType.FrameworkAgreement as number,
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    autoRenew: false, renewalNoticeDays: 30 as number | null, renewalDurationMonths: null as number | null,
    currencyCode: 'PKR', maximumContractValue: null as number | null,
    paymentTerms: PaymentTerms.Net30 as number, incoterm: '' as number | '',
    termsAndConditions: '', notes: '',
  };
  formLines: CreatePurchaseContractLineDto[] = [];
  newLine: Partial<CreatePurchaseContractLineDto> = { unitPrice: 0 };

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];
  defaultCurrency = 'PKR';
  readonly contractTypeOptions = enumOptions(CONTRACT_TYPE_LABELS);
  readonly paymentTermOptions = enumOptions(PAYMENT_TERMS_LABELS);
  readonly incotermOptions = enumOptions(INCOTERM_LABELS);
  readonly statusFilterOptions = enumOptions(CONTRACT_STATUS_LABELS);

  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' }, { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' }, { key: 'shortDescription', header: 'Description' },
  ];

  readonly columns: TableColumn[] = [
    { key: 'contractNumber', label: 'Contract #', width: '140px' },
    { key: 'title', label: 'Title' },
    { key: 'vendorName', label: 'Vendor', format: (v, row) => v ?? this.vendorName(row.vendorId) },
    { key: 'contractType', label: 'Type', format: (v) => CONTRACT_TYPE_LABELS[v as PurchaseContractType] ?? String(v) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => CONTRACT_STATUS_LABELS[v as PurchaseContractStatus] ?? String(v) },
    { key: 'startDate', label: 'Start', type: 'date' },
    { key: 'endDate', label: 'End', type: 'date' },
    { key: 'maximumContractValue', label: 'Max Value', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️',
      visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Draft || c.status === PurchaseContractStatus.UnderReview },
    { eventName: 'activate', label: 'Activate', icon: '✓', variant: 'primary',
      visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Draft || c.status === PurchaseContractStatus.UnderReview || c.status === PurchaseContractStatus.Suspended },
    { eventName: 'suspend', label: 'Suspend', icon: '⏸️', visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Active },
    { eventName: 'renew', label: 'Renew', icon: '↻',
      visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Active || c.status === PurchaseContractStatus.Expired },
    { eventName: 'terminate', label: 'Terminate', icon: '⊘', variant: 'danger',
      visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Active || c.status === PurchaseContractStatus.Suspended },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (c: PurchaseContractDto) => c.status === PurchaseContractStatus.Draft },
  ];

  constructor(
    private service: ContractService,
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
      next: (r) => {
        this.contracts = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.contracts.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load contracts'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

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
  categoryName(id?: string): string { return id ? (this.categoryOptions.find(o => o.value === id)?.label ?? '—') : '—'; }
  unitName(id?: string): string { return this.units.find(u => u.id === id)?.name ?? ''; }

  /** Committed value of a single line: committedQty × unitPrice × (1 − discount%). */
  lineValue(l: CreatePurchaseContractLineDto): number {
    const qty = l.committedQuantity ?? 0;
    return qty * (l.unitPrice ?? 0) * (1 - (l.discountPercent ?? 0) / 100);
  }
  /** Sum of committed line values across all lines. */
  get committedTotal(): number { return this.formLines.reduce((sum, l) => sum + this.lineValue(l), 0); }
  /** True when the committed total exceeds the configured maximum contract value. */
  get committedExceedsMax(): boolean {
    const max = this.form.maximumContractValue;
    return max != null && this.committedTotal > max;
  }

  statusBadge(s: PurchaseContractStatus): string {
    switch (s) {
      case PurchaseContractStatus.Active: return 'badge-active';
      case PurchaseContractStatus.Terminated: return 'badge-blocked';
      case PurchaseContractStatus.Expired: return 'badge-inactive';
      case PurchaseContractStatus.Suspended: return 'badge-pending';
      default: return 'badge-draft';
    }
  }

  // ── Item picker ───────────────────────────────────────────────────────────────
  onLineItemSelect(item: EntityPickerItem): void {
    this.newLine.itemId = item['id'];
    this.newLine.itemCode = item['code'] ?? '';
    this.newLine.itemDescription = item['shortDescription'] || item['name'] || this.newLine.itemDescription;
    if (item['purchasePrice'] != null) this.newLine.unitPrice = item['purchasePrice'];
    this.cdr.detectChanges();
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null; this.resetForm(); this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
  }

  openEdit(c: PurchaseContractDto): void {
    this.service.getById(c.id).subscribe({
      next: (res) => this.populateEdit(res.data ?? c),
      error: () => this.populateEdit(c),
    });
  }

  private populateEdit(c: PurchaseContractDto): void {
    this.editing = c;
    this.form = {
      title: c.title, description: c.description ?? '', vendorId: c.vendorId,
      contractType: c.contractType,
      startDate: c.startDate?.split('T')[0] ?? '', endDate: c.endDate?.split('T')[0] ?? '',
      autoRenew: c.autoRenew, renewalNoticeDays: c.renewalNoticeDays, renewalDurationMonths: c.renewalDurationMonths ?? null,
      currencyCode: c.currencyCode, maximumContractValue: c.maximumContractValue ?? null,
      paymentTerms: c.paymentTerms, incoterm: c.incoterm ?? '',
      termsAndConditions: c.termsAndConditions ?? '', notes: c.notes ?? '',
    };
    this.formLines = c.lines.map(l => ({
      itemId: l.itemId, itemCode: l.itemCode, itemDescription: l.itemDescription, unitPrice: l.unitPrice,
      discountPercent: l.discountPercent, minimumQuantity: l.minimumQuantity, maximumQuantity: l.maximumQuantity,
      committedQuantity: l.committedQuantity, unitOfMeasureId: l.unitOfMeasureId, unitOfMeasureName: l.unitOfMeasureName,
      procurementCategoryId: l.procurementCategoryId, validFrom: l.validFrom?.split('T')[0], validTo: l.validTo?.split('T')[0], notes: l.notes,
    }));
    this.newLine = { unitPrice: 0 };
    this.formTab = 'details'; this.submitted = false;
    this.showForm = true; this.error = ''; this.success = '';
    this.cdr.detectChanges();
  }

  cancelForm(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      title: '', description: '', vendorId: '',
      contractType: PurchaseContractType.FrameworkAgreement,
      startDate: new Date().toISOString().split('T')[0], endDate: '',
      autoRenew: false, renewalNoticeDays: 30, renewalDurationMonths: null,
      currencyCode: this.defaultCurrency, maximumContractValue: null,
      paymentTerms: PaymentTerms.Net30, incoterm: '',
      termsAndConditions: '', notes: '',
    };
    this.formLines = []; this.newLine = { unitPrice: 0 };
  }

  // ── Lines ──────────────────────────────────────────────────────────────────────
  get newLineError(): string {
    if (!this.newLine.itemDescription?.trim()) return 'Select an item or enter a description.';
    if ((this.newLine.unitPrice ?? 0) <= 0) return 'Unit price must be greater than zero.';
    return '';
  }
  addLine(): void {
    if (this.newLineError) { this.error = this.newLineError; return; }
    this.error = '';
    this.formLines.push({
      itemId: this.newLine.itemId || undefined,
      itemCode: this.newLine.itemCode?.trim() || undefined,
      itemDescription: this.newLine.itemDescription!.trim(),
      unitPrice: Number(this.newLine.unitPrice),
      discountPercent: this.newLine.discountPercent != null ? Number(this.newLine.discountPercent) : undefined,
      minimumQuantity: this.newLine.minimumQuantity != null ? Number(this.newLine.minimumQuantity) : undefined,
      maximumQuantity: this.newLine.maximumQuantity != null ? Number(this.newLine.maximumQuantity) : undefined,
      committedQuantity: this.newLine.committedQuantity != null ? Number(this.newLine.committedQuantity) : undefined,
      unitOfMeasureId: this.newLine.unitOfMeasureId || undefined,
      unitOfMeasureName: this.unitName(this.newLine.unitOfMeasureId) || undefined,
      procurementCategoryId: this.newLine.procurementCategoryId || undefined,
      notes: this.newLine.notes?.trim() || undefined,
    });
    this.newLine = { unitPrice: 0 };
  }
  removeLine(i: number): void { this.formLines.splice(i, 1); }

  // ── Validation / save ───────────────────────────────────────────────────────────
  get errors() {
    return {
      title: requiredText(this.form.title, 'Title'),
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      startDate: this.form.startDate ? '' : 'Start date is required.',
      endDate: !this.form.endDate ? 'End date is required.'
        : (this.form.startDate && this.form.endDate < this.form.startDate ? 'End date must be after start date.' : ''),
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.title && !e.vendorId && !e.startDate && !e.endDate; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = 'Please correct the highlighted fields.'; this.formTab = 'details'; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';

    if (this.editing) {
      const upd: UpdatePurchaseContractDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        endDate: this.form.endDate,
        maximumContractValue: this.form.maximumContractValue ?? undefined,
        autoRenew: this.form.autoRenew,
        renewalNoticeDays: this.form.renewalNoticeDays != null ? Number(this.form.renewalNoticeDays) : undefined,
        renewalDurationMonths: this.form.renewalDurationMonths ?? undefined,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.update(this.editing.id, upd).subscribe({
        next: () => { this.saving = false; this.success = 'Contract updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePurchaseContractDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim() || undefined,
        vendorId: this.form.vendorId,
        contractType: Number(this.form.contractType) as PurchaseContractType,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        autoRenew: this.form.autoRenew,
        renewalNoticeDays: this.form.renewalNoticeDays != null ? Number(this.form.renewalNoticeDays) : undefined,
        renewalDurationMonths: this.form.renewalDurationMonths ?? undefined,
        currencyCode: this.form.currencyCode || this.defaultCurrency,
        maximumContractValue: this.form.maximumContractValue ?? undefined,
        paymentTerms: Number(this.form.paymentTerms) as PaymentTerms,
        incoterm: this.form.incoterm === '' ? undefined : Number(this.form.incoterm) as Incoterm,
        termsAndConditions: this.form.termsAndConditions.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
        lines: this.formLines,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Contract created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Row actions / lifecycle ───────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<PurchaseContractDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEdit(e.row); break;
      case 'activate': this.runAction(this.service.activate(e.row.id), 'Contract activated'); break;
      case 'suspend': this.runAction(this.service.suspend(e.row.id), 'Contract suspended'); break;
      case 'renew': this.runAction(this.service.renew(e.row.id), 'Contract renewed'); break;
      case 'terminate': this.openTerminateModal(e.row); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<ContractService['activate']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  openTerminateModal(c: PurchaseContractDto): void {
    this.terminateTargetId = c.id; this.terminationReason = ''; this.terminateSubmitted = false; this.showTerminateModal = true;
  }
  confirmTerminate(): void {
    this.terminateSubmitted = true;
    if (!this.terminationReason.trim()) { this.cdr.detectChanges(); return; }
    const dto: TerminateContractDto = { terminationReason: this.terminationReason.trim() };
    this.service.terminate(this.terminateTargetId, dto).subscribe({
      next: () => { this.success = 'Contract terminated'; this.showTerminateModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to terminate'; this.showTerminateModal = false; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Contract deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
