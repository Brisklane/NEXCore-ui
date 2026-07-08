import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { VendorDebitNoteService } from '../../services/debit-note.service';
import {
  VendorDebitNoteDto, CreateVendorDebitNoteDto, DebitNoteStatus, DEBIT_NOTE_STATUS_LABELS,
} from '../../models/debit-note.model';
import { PurchaseReturnDto } from '../../models/purchase-return.model';
import { enumOptions } from '../../models/procurement-constants';

@Component({
  selector: 'lib-vendor-debit-notes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './vendor-debit-notes.html',
  styleUrl: './vendor-debit-notes.css',
})
export class VendorDebitNotesPage implements OnInit {
  notes: VendorDebitNoteDto[] = [];
  eligibleReturns: PurchaseReturnDto[] = [];
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

  showDeleteConfirm = false;
  deleteTarget: VendorDebitNoteDto | null = null;

  form = { purchaseReturnId: '', debitNoteDate: new Date().toISOString().split('T')[0], notes: '' };

  returnOptions: SelectOption[] = [];
  readonly statusFilterOptions = enumOptions(DEBIT_NOTE_STATUS_LABELS);

  highlighter = new RowHighlighter();

  readonly columns: TableColumn[] = [
    { key: 'debitNoteNumber', label: 'Debit Note #', width: '150px' },
    { key: 'purchaseReturnNumber', label: 'Return #', format: (v) => v ?? '—' },
    { key: 'vendorName', label: 'Vendor', format: (v) => v ?? '—' },
    { key: 'debitNoteDate', label: 'Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => DEBIT_NOTE_STATUS_LABELS[v as DebitNoteStatus] ?? String(v) },
    { key: 'totalAmount', label: 'Total', type: 'currency', align: 'right' },
    { key: 'settledAmount', label: 'Settled', type: 'currency', align: 'right' },
    { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'send', label: 'Send', icon: '📤', variant: 'primary', visible: (n: VendorDebitNoteDto) => n.status === DebitNoteStatus.Draft },
    { eventName: 'acknowledge', label: 'Acknowledge', icon: '☑️', visible: (n: VendorDebitNoteDto) => n.status === DebitNoteStatus.Sent },
    { eventName: 'settle', label: 'Settle', icon: '💲', variant: 'primary',
      visible: (n: VendorDebitNoteDto) => n.status === DebitNoteStatus.Sent || n.status === DebitNoteStatus.Acknowledged || n.status === DebitNoteStatus.PartiallySettled },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', variant: 'danger',
      visible: (n: VendorDebitNoteDto) => n.status !== DebitNoteStatus.FullySettled && n.status !== DebitNoteStatus.Cancelled },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (n: VendorDebitNoteDto) => n.status === DebitNoteStatus.Draft || n.status === DebitNoteStatus.Cancelled },
  ];

  constructor(private service: VendorDebitNoteService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter),
      sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => { this.notes = r.data ?? []; this.totalCount = r.pagination?.totalCount ?? this.notes.length; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load debit notes'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  statusBadge(s: DebitNoteStatus): string {
    switch (s) {
      case DebitNoteStatus.FullySettled: return 'badge-active';
      case DebitNoteStatus.Cancelled: return 'badge-blocked';
      case DebitNoteStatus.Sent: case DebitNoteStatus.Acknowledged: case DebitNoteStatus.PartiallySettled: return 'badge-pending';
      default: return 'badge-draft';
    }
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.form = { purchaseReturnId: '', debitNoteDate: new Date().toISOString().split('T')[0], notes: '' };
    this.submitted = false; this.showForm = true; this.error = ''; this.success = '';
    this.service.getEligibleReturns().subscribe({
      next: (r) => {
        this.eligibleReturns = r.data ?? [];
        this.returnOptions = this.eligibleReturns.map(x => ({
          value: x.id, label: `${x.returnNumber} — ${x.vendorName ?? ''} (${x.totalReturnAmount.toFixed(2)} ${x.currencyCode})`,
        }));
        this.cdr.detectChanges();
      },
    });
  }

  cancelForm(): void { this.showForm = false; }

  get selectedReturn(): PurchaseReturnDto | undefined {
    return this.eligibleReturns.find(r => r.id === this.form.purchaseReturnId);
  }

  get errors() {
    return { purchaseReturnId: this.form.purchaseReturnId ? '' : 'Select a posted return to credit.' };
  }
  get isValid(): boolean { return !this.errors.purchaseReturnId; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.purchaseReturnId; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: CreateVendorDebitNoteDto = {
      purchaseReturnId: this.form.purchaseReturnId,
      debitNoteDate: this.form.debitNoteDate,
      notes: this.form.notes.trim() || undefined,
    };
    this.service.create(dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Debit note created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create debit note'; this.cdr.detectChanges(); },
    });
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<VendorDebitNoteDto>): void {
    switch (e.eventName) {
      case 'send': this.runAction(this.service.send(e.row.id), 'Debit note sent'); break;
      case 'acknowledge': this.runAction(this.service.acknowledge(e.row.id), 'Debit note acknowledged'); break;
      case 'settle': this.runAction(this.service.settle(e.row.id), 'Debit note settled'); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Debit note cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  private runAction(obs: ReturnType<VendorDebitNoteService['send']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Debit note deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
