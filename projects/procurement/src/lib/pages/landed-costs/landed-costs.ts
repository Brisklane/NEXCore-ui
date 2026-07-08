import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { LandedCostService } from '../../services/landed-cost.service';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { VendorService } from '../../services/vendor.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { ProcurementSettingsService } from '../../services/master-data.service';
import {
  LandedCostDto, CreateLandedCostDto, CreateLandedCostLineDto,
  LandedCostStatus, LandedCostType, LandedCostAllocationMethod,
  LANDED_COST_STATUS_LABELS, LANDED_COST_TYPE_LABELS, ALLOCATION_METHOD_LABELS,
} from '../../models/landed-cost.model';
import { GoodsReceiptStatus } from '../../models/procurement-enums';
import { CURRENCY_OPTIONS, enumOptions, requiredText } from '../../models/procurement-constants';

interface CostLineRow extends CreateLandedCostLineDto {}

@Component({
  selector: 'lib-landed-costs',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './landed-costs.html',
  styleUrl: './landed-costs.css',
})
export class LandedCostsPage implements OnInit {
  costs: LandedCostDto[] = [];
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
  submitted = false;
  saving = false;

  viewing: LandedCostDto | null = null;
  showDeleteConfirm = false;
  deleteTarget: LandedCostDto | null = null;

  highlighter = new RowHighlighter();

  defaultCurrency = 'PKR';

  form = {
    description: '', vendorId: '', documentDate: new Date().toISOString().split('T')[0],
    currencyCode: 'PKR', exchangeRate: 1, notes: '',
  };
  grnIds: string[] = [];
  newGrnId = '';
  costLines: CostLineRow[] = [];
  newLine: Partial<CreateLandedCostLineDto> = { costType: LandedCostType.Freight, amount: 0, allocationMethod: LandedCostAllocationMethod.ByValue, taxPercent: 0 };

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  grnOptions: SelectOption[] = [];
  private grnLabels: Record<string, string> = {};
  readonly costTypeOptions = enumOptions(LANDED_COST_TYPE_LABELS);
  // Backend only implements ByQuantity, ByValue and Equal; ByWeight/ByVolume silently
  // misallocate, so they are excluded from the selectable methods.
  readonly methodOptions = enumOptions(ALLOCATION_METHOD_LABELS).filter(o =>
    o.value !== LandedCostAllocationMethod.ByWeight && o.value !== LandedCostAllocationMethod.ByVolume);
  readonly statusFilterOptions = enumOptions(LANDED_COST_STATUS_LABELS);

  readonly columns: TableColumn[] = [
    { key: 'landedCostNumber', label: 'Landed Cost #', width: '170px' },
    { key: 'description', label: 'Description', format: (v) => v ?? '—' },
    { key: 'vendorName', label: 'Cost Vendor', format: (v) => v ?? '—' },
    { key: 'documentDate', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => LANDED_COST_STATUS_LABELS[v as LandedCostStatus] ?? String(v) },
    { key: 'totalLandedCostAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'goodsReceipts', label: 'GRNs', align: 'center', format: (v) => String((v ?? []).length) },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'view', label: 'View Allocation', icon: '📊' },
    { eventName: 'post', label: 'Post & Allocate', icon: '✓', variant: 'primary', visible: (l: LandedCostDto) => l.status === LandedCostStatus.Draft },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', visible: (l: LandedCostDto) => l.status === LandedCostStatus.Draft },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (l: LandedCostDto) => l.status !== LandedCostStatus.Posted },
  ];

  constructor(
    private service: LandedCostService,
    private grnService: GoodsReceiptService,
    private vendorService: VendorService,
    private currencyService: CurrencyLookupService,
    private settingsService: ProcurementSettingsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.settingsService.get().subscribe(r => { this.defaultCurrency = r.data?.defaultCurrencyCode || 'PKR'; this.cdr.detectChanges(); });
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => { this.vendorOptions = (r.data ?? []).map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` })); this.cdr.detectChanges(); },
    });
    this.grnService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        const posted = (r.data ?? []).filter(g => g.status === GoodsReceiptStatus.Posted);
        this.grnOptions = posted.map(g => ({ value: g.id, label: `${g.receiptNumber} — ${g.vendorName ?? ''}` }));
        posted.forEach(g => this.grnLabels[g.id] = `${g.receiptNumber}`);
        this.cdr.detectChanges();
      },
    });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => { this.costs = r.data ?? []; this.totalCount = r.pagination?.totalCount ?? this.costs.length; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load landed costs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  statusBadge(s: LandedCostStatus): string {
    switch (s) {
      case LandedCostStatus.Posted: return 'badge-active';
      case LandedCostStatus.Cancelled: return 'badge-blocked';
      default: return 'badge-draft';
    }
  }
  grnLabel(id: string): string { return this.grnLabels[id] ?? id; }
  typeLabel(t: LandedCostType): string { return LANDED_COST_TYPE_LABELS[t] ?? String(t); }
  methodLabel(m: LandedCostAllocationMethod): string { return ALLOCATION_METHOD_LABELS[m] ?? String(m); }
  costLineDesc(id: string): string { return this.viewing?.costLines.find(c => c.id === id)?.description ?? '—'; }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.form = { description: '', vendorId: '', documentDate: new Date().toISOString().split('T')[0], currencyCode: this.defaultCurrency, exchangeRate: 1, notes: '' };
    this.grnIds = []; this.newGrnId = '';
    this.costLines = [];
    this.newLine = { costType: LandedCostType.Freight, amount: 0, allocationMethod: LandedCostAllocationMethod.ByValue, taxPercent: 0 };
    this.submitted = false; this.showForm = true; this.error = ''; this.success = '';
  }
  cancelForm(): void { this.showForm = false; }

  addGrn(): void {
    if (!this.newGrnId || this.grnIds.includes(this.newGrnId)) return;
    this.grnIds.push(this.newGrnId); this.newGrnId = '';
  }
  removeGrn(i: number): void { this.grnIds.splice(i, 1); }

  get newLineError(): string {
    if (!this.newLine.description?.trim()) return 'Cost description is required.';
    if ((this.newLine.amount ?? 0) <= 0) return 'Amount must be greater than zero.';
    return '';
  }
  addCostLine(): void {
    if (this.newLineError) { this.error = this.newLineError; return; }
    this.error = '';
    this.costLines.push({
      costType: Number(this.newLine.costType) as LandedCostType,
      description: this.newLine.description!.trim(),
      amount: Number(this.newLine.amount),
      allocationMethod: Number(this.newLine.allocationMethod) as LandedCostAllocationMethod,
      taxPercent: this.newLine.taxPercent != null ? Number(this.newLine.taxPercent) : 0,
    });
    this.newLine = { costType: LandedCostType.Freight, amount: 0, allocationMethod: LandedCostAllocationMethod.ByValue, taxPercent: 0 };
  }
  removeCostLine(i: number): void { this.costLines.splice(i, 1); }

  lineTotal(l: CostLineRow): number { return Number(l.amount ?? 0) * (1 + Number(l.taxPercent ?? 0) / 100); }
  get costTotal(): number { return this.costLines.reduce((s, l) => s + this.lineTotal(l), 0); }

  get errors() {
    return {
      grns: this.grnIds.length === 0 ? 'Link at least one goods receipt.' : '',
      lines: this.costLines.length === 0 ? 'Add at least one cost line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.grns && !e.lines; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.grns || this.errors.lines; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: CreateLandedCostDto = {
      description: this.form.description.trim() || undefined,
      vendorId: this.form.vendorId || undefined,
      documentDate: this.form.documentDate,
      currencyCode: this.form.currencyCode || this.defaultCurrency,
      exchangeRate: Number(this.form.exchangeRate ?? 1),
      notes: this.form.notes.trim() || undefined,
      goodsReceiptIds: this.grnIds,
      costLines: this.costLines,
    };
    this.service.create(dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Landed cost created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create landed cost'; this.cdr.detectChanges(); },
    });
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<LandedCostDto>): void {
    switch (e.eventName) {
      case 'view': this.openView(e.row); break;
      case 'post': this.runAction(this.service.post(e.row.id), 'Landed cost posted and allocated'); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Landed cost cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  openView(l: LandedCostDto): void {
    this.service.getById(l.id).subscribe({
      next: (res) => { this.viewing = res.data ?? l; this.cdr.detectChanges(); },
      error: () => { this.viewing = l; this.cdr.detectChanges(); },
    });
  }
  closeView(): void { this.viewing = null; }

  private runAction(obs: ReturnType<LandedCostService['post']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Landed cost deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
