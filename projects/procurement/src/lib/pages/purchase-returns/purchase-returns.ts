import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { PurchaseReturnService } from '../../services/purchase-return.service';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import {
  PurchaseReturnDto, CreatePurchaseReturnDto, CreatePurchaseReturnLineDto,
  PurchaseReturnStatus, PurchaseReturnReason, PURCHASE_RETURN_STATUS_LABELS, RETURN_REASON_LABELS,
} from '../../models/purchase-return.model';
import { GoodsReceiptDto } from '../../models/goods-receipt.model';
import { GoodsReceiptStatus } from '../../models/procurement-enums';
import { enumOptions } from '../../models/procurement-constants';

interface ReturnLineRow extends CreatePurchaseReturnLineDto {
  itemCode?: string;
  itemDescription: string;
  quantityReceived: number;
}

@Component({
  selector: 'lib-purchase-returns',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './purchase-returns.html',
  styleUrl: './purchase-returns.css',
})
export class PurchaseReturnsPage implements OnInit {
  returns: PurchaseReturnDto[] = [];
  receipts: GoodsReceiptDto[] = [];
  selectedGrn: GoodsReceiptDto | null = null;
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

  showDeleteConfirm = false;
  deleteTarget: PurchaseReturnDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    goodsReceiptId: '', returnDate: new Date().toISOString().split('T')[0],
    returnReason: PurchaseReturnReason.QualityDefect as number,
    vendorReturnAuthorisationNumber: '', description: '', notes: '',
  };
  formLines: ReturnLineRow[] = [];

  grnOptions: SelectOption[] = [];
  readonly reasonOptions = enumOptions(RETURN_REASON_LABELS);
  readonly statusFilterOptions = enumOptions(PURCHASE_RETURN_STATUS_LABELS);

  readonly columns: TableColumn[] = [
    { key: 'returnNumber', label: 'Return #', width: '140px' },
    { key: 'goodsReceiptNumber', label: 'GRN #', format: (v) => v ?? '—' },
    { key: 'vendorName', label: 'Vendor', format: (v) => v ?? '—' },
    { key: 'returnDate', label: 'Return Date', type: 'date' },
    { key: 'returnReason', label: 'Reason', format: (v) => RETURN_REASON_LABELS[v as PurchaseReturnReason] ?? String(v) },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => PURCHASE_RETURN_STATUS_LABELS[v as PurchaseReturnStatus] ?? String(v) },
    { key: 'totalReturnAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'debitNoteNumber', label: 'Debit Note', format: (v) => v ?? '—' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'approve', label: 'Approve', icon: '✓', variant: 'primary', visible: (r: PurchaseReturnDto) => r.status === PurchaseReturnStatus.Draft },
    { eventName: 'post', label: 'Post', icon: '📌', variant: 'primary', visible: (r: PurchaseReturnDto) => r.status === PurchaseReturnStatus.Approved },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', visible: (r: PurchaseReturnDto) => r.status === PurchaseReturnStatus.Draft || r.status === PurchaseReturnStatus.Approved },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (r: PurchaseReturnDto) => r.status === PurchaseReturnStatus.Draft || r.status === PurchaseReturnStatus.Cancelled },
  ];

  constructor(
    private service: PurchaseReturnService,
    private grnService: GoodsReceiptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.grnService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.receipts = (r.data ?? []).filter(g => g.status === GoodsReceiptStatus.Posted);
        this.grnOptions = this.receipts.map(g => ({ value: g.id, label: `${g.receiptNumber} — ${g.vendorName ?? ''}` }));
        this.cdr.detectChanges();
      },
    });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter), sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => { this.returns = r.data ?? []; this.totalCount = r.pagination?.totalCount ?? this.returns.length; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load returns'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  statusBadge(s: PurchaseReturnStatus): string {
    switch (s) {
      case PurchaseReturnStatus.Posted: return 'badge-active';
      case PurchaseReturnStatus.Cancelled: return 'badge-blocked';
      case PurchaseReturnStatus.Approved: return 'badge-pending';
      default: return 'badge-draft';
    }
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void { this.resetForm(); this.submitted = false; this.showForm = true; this.error = ''; this.success = ''; }

  onGrnChange(): void {
    this.formLines = []; this.selectedGrn = null;
    if (!this.form.goodsReceiptId) return;
    this.grnService.getById(this.form.goodsReceiptId).subscribe({
      next: (res) => {
        this.selectedGrn = res.data ?? null;
        this.formLines = (this.selectedGrn?.lines ?? []).map(l => ({
          goodsReceiptLineId: l.id,
          itemCode: l.itemCode,
          itemDescription: l.itemDescription,
          quantityReceived: l.quantityReceived,
          quantityReturned: 0,
          returnReason: this.form.returnReason as PurchaseReturnReason,
          qualityIssueDescription: undefined,
          lotNumber: l.lotNumber,
          notes: undefined,
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load GRN lines'; this.cdr.detectChanges(); },
    });
  }

  cancelForm(): void { this.showForm = false; this.resetForm(); }

  resetForm(): void {
    this.form = {
      goodsReceiptId: '', returnDate: new Date().toISOString().split('T')[0],
      returnReason: PurchaseReturnReason.QualityDefect,
      vendorReturnAuthorisationNumber: '', description: '', notes: '',
    };
    this.formLines = []; this.selectedGrn = null;
  }

  get errors() {
    const anyReturned = this.formLines.some(l => Number(l.quantityReturned ?? 0) > 0);
    const overReturned = this.formLines.some(l => Number(l.quantityReturned ?? 0) > l.quantityReceived);
    return {
      grn: this.form.goodsReceiptId ? '' : 'Select a posted goods receipt.',
      lines: this.formLines.length === 0 ? 'The selected GRN has no lines.'
        : !anyReturned ? 'Enter a return quantity on at least one line.'
        : overReturned ? 'Return quantity cannot exceed the received quantity.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.grn && !e.lines; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.grn || this.errors.lines; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: CreatePurchaseReturnDto = {
      goodsReceiptId: this.form.goodsReceiptId,
      returnDate: this.form.returnDate,
      returnReason: Number(this.form.returnReason) as PurchaseReturnReason,
      vendorReturnAuthorisationNumber: this.form.vendorReturnAuthorisationNumber.trim() || undefined,
      description: this.form.description.trim() || undefined,
      notes: this.form.notes.trim() || undefined,
      lines: this.formLines
        .filter(l => Number(l.quantityReturned ?? 0) > 0)
        .map(l => ({
          goodsReceiptLineId: l.goodsReceiptLineId,
          quantityReturned: Number(l.quantityReturned),
          returnReason: Number(l.returnReason) as PurchaseReturnReason,
          qualityIssueDescription: l.qualityIssueDescription?.trim() || undefined,
          lotNumber: l.lotNumber?.trim() || undefined,
          notes: l.notes?.trim() || undefined,
        })),
    };
    this.service.create(dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Purchase return created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create return'; this.cdr.detectChanges(); },
    });
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<PurchaseReturnDto>): void {
    switch (e.eventName) {
      case 'approve': this.runAction(this.service.approve(e.row.id), 'Return approved'); break;
      case 'post': this.runAction(this.service.post(e.row.id), 'Return posted'); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Return cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<PurchaseReturnService['approve']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Return deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
