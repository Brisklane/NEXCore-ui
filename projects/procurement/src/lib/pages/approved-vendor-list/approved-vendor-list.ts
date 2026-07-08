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
import { ApprovedVendorListService } from '../../services/vendor-sourcing.service';
import { VendorService } from '../../services/vendor.service';
import { ProcurementCategoryService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import {
  ApprovedVendorListDto, CreateApprovedVendorListDto, UpdateApprovedVendorListDto, BlockApprovedVendorDto,
} from '../../models/vendor-sourcing.model';
import { VendorDto } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, requiredText, nonNegativeNumber } from '../../models/procurement-constants';

@Component({
  selector: 'lib-approved-vendor-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './approved-vendor-list.html',
  styleUrl: './approved-vendor-list.css',
})
export class ApprovedVendorListPage implements OnInit {
  entries: ApprovedVendorListDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';
  vendorFilter = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  showForm = false;
  editing: ApprovedVendorListDto | null = null;
  submitted = false;
  saving = false;

  showBlockModal = false;
  blockTarget: ApprovedVendorListDto | null = null;
  blockReason = '';
  blockSubmitted = false;

  showDeleteConfirm = false;
  deleteTarget: ApprovedVendorListDto | null = null;

  highlighter = new RowHighlighter();

  scopeType: 'item' | 'category' = 'item';
  form = {
    vendorId: '', itemId: '' as string | undefined, itemCode: '', itemDescription: '', procurementCategoryId: '',
    validFrom: this.today(), validTo: '',
    isPreferred: false, isExclusive: false, requiresQualityInspection: false,
    defaultUnitPrice: null as number | null, currencyCode: 'PKR',
    leadTimeDays: 0 as number | null, minimumOrderQuantity: null as number | null, notes: '',
  };

  // Item entity-picker (Core /api/Item/basic — paginated + searchable)
  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' },
    { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'shortDescription', header: 'Description' },
  ];

  onItemSelect(item: EntityPickerItem): void {
    this.form.itemId = item['id'];
    this.form.itemCode = item['code'] ?? '';
    // Auto-fill description from the item's short description (fallback to name) if present.
    this.form.itemDescription = item['shortDescription'] || item['name'] || this.form.itemDescription;
    this.cdr.detectChanges();
  }

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  readonly scopeOptions: SelectOption[] = [
    { value: 'item', label: 'Specific Item' },
    { value: 'category', label: 'Procurement Category' },
  ];
  vendorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];

  readonly columns: TableColumn[] = [
    { key: 'vendorNumber', label: 'Vendor #', width: '110px' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'scope', label: 'Scope', format: (_v, row) => this.scopeLabel(row) },
    { key: 'validFrom', label: 'Valid From', type: 'date' },
    { key: 'validTo', label: 'Valid To', format: (v) => v ? new Date(v).toLocaleDateString() : 'Open' },
    { key: 'leadTimeDays', label: 'Lead (d)', align: 'center' },
    { key: 'isPreferred', label: 'Preferred', type: 'badge', align: 'center',
      badgeClass: (v) => (v ? 'badge-active' : 'badge-no'), format: (v) => (v ? '★ Preferred' : '—') },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (_v, row) => this.statusClass(row), format: (_v, row) => this.statusText(row) },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'block', label: 'Block', icon: '⛔', visible: (r: ApprovedVendorListDto) => !r.isBlocked },
    { eventName: 'unblock', label: 'Unblock', icon: '↻', visible: (r: ApprovedVendorListDto) => r.isBlocked },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  constructor(
    private service: ApprovedVendorListService,
    private vendorService: VendorService,
    private categoryService: ProcurementCategoryService,
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
    this.categoryService.getActive().subscribe({
      next: (r) => {
        this.categoryOptions = (r.data ?? []).map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }));
        this.cdr.detectChanges();
      },
    });
  }

  private today(): string { return new Date().toISOString().split('T')[0]; }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.search.trim() || undefined,
      sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => {
        this.entries = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? this.entries.length;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load approved vendor list'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // Vendor filter is applied client-side on the current page; search/sort/paging are server-side.
  get filteredEntries(): ApprovedVendorListDto[] {
    return this.vendorFilter
      ? this.entries.filter(e => e.vendorId === this.vendorFilter)
      : this.entries;
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300);
  }
  onVendorFilterChange(): void { this.cdr.detectChanges(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load();
  }

  scopeLabel(e: ApprovedVendorListDto): string {
    if (e.itemId || e.itemCode || e.itemDescription) {
      return `Item: ${e.itemCode ? e.itemCode + ' — ' : ''}${e.itemDescription ?? ''}`.trim();
    }
    if (e.procurementCategoryName) return `Category: ${e.procurementCategoryName}`;
    return '—';
  }

  statusText(e: ApprovedVendorListDto): string {
    if (e.isBlocked) return 'Blocked';
    if (!e.isActive) return 'Inactive';
    if (e.isExclusive) return 'Exclusive';
    return 'Active';
  }
  statusClass(e: ApprovedVendorListDto): string {
    if (e.isBlocked) return 'badge-blocked';
    if (!e.isActive) return 'badge-inactive';
    if (e.isExclusive) return 'badge-pending';
    return 'badge-active';
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null;
    this.scopeType = 'item';
    this.form = {
      vendorId: '', itemId: '', itemCode: '', itemDescription: '', procurementCategoryId: '',
      validFrom: this.today(), validTo: '',
      isPreferred: false, isExclusive: false, requiresQualityInspection: false,
      defaultUnitPrice: null, currencyCode: 'PKR', leadTimeDays: 0, minimumOrderQuantity: null, notes: '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(e: ApprovedVendorListDto): void {
    this.editing = e;
    this.scopeType = (e.procurementCategoryId && !e.itemId && !e.itemCode) ? 'category' : 'item';
    this.form = {
      vendorId: e.vendorId,
      itemId: e.itemId ?? '',
      itemCode: e.itemCode ?? '',
      itemDescription: e.itemDescription ?? '',
      procurementCategoryId: e.procurementCategoryId ?? '',
      validFrom: e.validFrom?.split('T')[0] ?? this.today(),
      validTo: e.validTo?.split('T')[0] ?? '',
      isPreferred: e.isPreferred,
      isExclusive: e.isExclusive,
      requiresQualityInspection: e.requiresQualityInspection,
      defaultUnitPrice: e.defaultUnitPrice ?? null,
      currencyCode: e.currencyCode ?? 'PKR',
      leadTimeDays: e.leadTimeDays,
      minimumOrderQuantity: e.minimumOrderQuantity ?? null,
      notes: e.notes ?? '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  cancelForm(): void { this.showForm = false; this.editing = null; }

  get errors() {
    const scopeErr = this.scopeType === 'item'
      ? requiredText(this.form.itemDescription, 'Item description')
      : (this.form.procurementCategoryId ? '' : 'Select a procurement category.');
    return {
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      scope: scopeErr,
      leadTimeDays: nonNegativeNumber(this.form.leadTimeDays, 'Lead time'),
      validTo: (this.form.validTo && this.form.validTo < this.form.validFrom) ? 'Valid To must be on or after Valid From.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.vendorId && !e.scope && !e.leadTimeDays && !e.validTo; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = 'Please correct the highlighted fields.'; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const isItem = this.scopeType === 'item';

    if (this.editing) {
      const dto: UpdateApprovedVendorListDto = {
        itemCode: isItem ? (this.form.itemCode.trim() || undefined) : undefined,
        itemDescription: isItem ? (this.form.itemDescription.trim() || undefined) : undefined,
        procurementCategoryId: isItem ? undefined : (this.form.procurementCategoryId || undefined),
        validFrom: this.form.validFrom || undefined,
        validTo: this.form.validTo || undefined,
        isPreferred: this.form.isPreferred,
        isExclusive: this.form.isExclusive,
        requiresQualityInspection: this.form.requiresQualityInspection,
        defaultUnitPrice: this.form.defaultUnitPrice ?? undefined,
        currencyCode: this.form.currencyCode || undefined,
        leadTimeDays: Number(this.form.leadTimeDays ?? 0),
        minimumOrderQuantity: this.form.minimumOrderQuantity ?? undefined,
        notes: this.form.notes.trim() || undefined,
      };
      this.service.update(this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Entry updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateApprovedVendorListDto = {
        vendorId: this.form.vendorId,
        itemId: isItem ? (this.form.itemId || undefined) : undefined,
        itemCode: isItem ? (this.form.itemCode.trim() || undefined) : undefined,
        itemDescription: isItem ? (this.form.itemDescription.trim() || undefined) : undefined,
        procurementCategoryId: isItem ? undefined : (this.form.procurementCategoryId || undefined),
        validFrom: this.form.validFrom || this.today(),
        validTo: this.form.validTo || undefined,
        isPreferred: this.form.isPreferred,
        isExclusive: this.form.isExclusive,
        requiresQualityInspection: this.form.requiresQualityInspection,
        defaultUnitPrice: this.form.defaultUnitPrice ?? undefined,
        currencyCode: this.form.currencyCode || undefined,
        leadTimeDays: Number(this.form.leadTimeDays ?? 0),
        minimumOrderQuantity: this.form.minimumOrderQuantity ?? undefined,
        notes: this.form.notes.trim() || undefined,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Entry created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  onRowAction(e: RowActionEvent<ApprovedVendorListDto>): void {
    switch (e.eventName) {
      case 'edit': this.openEdit(e.row); break;
      case 'block': this.blockTarget = e.row; this.blockReason = ''; this.blockSubmitted = false; this.showBlockModal = true; break;
      case 'unblock': this.unblock(e.row); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  confirmBlock(): void {
    this.blockSubmitted = true;
    if (!this.blockReason.trim() || !this.blockTarget) { this.cdr.detectChanges(); return; }
    const dto: BlockApprovedVendorDto = { blockReason: this.blockReason.trim() };
    this.service.block(this.blockTarget.id, dto).subscribe({
      next: () => { this.success = 'Vendor blocked for this scope'; this.showBlockModal = false; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to block'; this.showBlockModal = false; this.cdr.detectChanges(); },
    });
  }

  unblock(e: ApprovedVendorListDto): void {
    this.service.unblock(e.id).subscribe({
      next: () => { this.success = 'Vendor unblocked'; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Failed to unblock'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Entry deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
