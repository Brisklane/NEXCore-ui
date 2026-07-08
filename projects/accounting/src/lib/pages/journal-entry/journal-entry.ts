import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalEntryService } from '../../services/journal-entry.service';
import { LedgerService } from '../../services/ledger.service';
import { LedgerAccountService } from '../../services/ledger-account.service';
import { GeoService, CurrencyDto } from '../../services/geo.service';
import {
  JournalEntryDto,
  CreateJournalEntryDto,
  CreateJournalLineDto,
  UpdateJournalEntryDto,
  JournalEntryStatusLabels,
} from '../../models/journal-entry.model';
import { LedgerDto } from '../../models/ledger.model';
import { LedgerAccountDto } from '../../models/ledger-account.model';
import { PaginationParams } from '../../models';
import { RowHighlighter } from '@nexcore/shared';

interface JournalLineForm {
  ledgerAccountId: string;
  debitAmount: number;
  creditAmount: number;
  currencyCode: string;
  description: string;
}

@Component({
  selector: 'lib-journal-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-entry.html',
  styleUrl: './journal-entry.css',
})
export class JournalEntry implements OnInit {
  entries: JournalEntryDto[] = [];
  ledgers: LedgerDto[] = [];
  ledgerAccounts: LedgerAccountDto[] = [];
  currencies: CurrencyDto[] = [];
  selectedLedgerId = '';
  loading = false;
  error = '';
  successMsg = '';
  showForm = false;
  statusLabels = JournalEntryStatusLabels;

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce: any;

  highlighter = new RowHighlighter();

  // Form
  formLedgerId = '';
  formDocumentType = '';
  formPostingDate = '';
  formDocumentDate = '';
  formDescription = '';
  formCurrencyCode = '';
  formReferenceNumber = '';
  formLines: JournalLineForm[] = [];

  // Validation / edit
  triedSubmit = false;
  editingEntryId: string | null = null;
  get isEditMode(): boolean { return !!this.editingEntryId; }

  // Detail
  selectedEntry: JournalEntryDto | null = null;

  constructor(
    private journalService: JournalEntryService,
    private ledgerService: LedgerService,
    private ledgerAccountService: LedgerAccountService,
    private geoService: GeoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.ledgerService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        this.ledgers = res.data ?? [];
        if (this.ledgers.length > 0) {
          this.selectedLedgerId = this.ledgers[0].id;
          this.loadEntries();
        }
        this.cdr.detectChanges();
      },
    });
    this.geoService.getCurrencies().subscribe({
      next: (data) => { this.currencies = data; this.cdr.detectChanges(); },
    });
  }

  loadEntries() {
    if (!this.selectedLedgerId) return;
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = {
      pageNumber: this.page,
      pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
    this.journalService.getByLedger(this.selectedLedgerId, pagination).subscribe({
      next: (res) => {
        this.entries = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load journal entries';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onLedgerChange() {
    this.page = 1;
    this.loadEntries();
  }

  applyFilters(): void {
    this.page = 1;
    this.loadEntries();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.loadEntries();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  goToPage(page: number) {
    this.page = page;
    this.loadEntries();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadEntries();
  }

  openCreateForm() {
    this.showForm = true;
    this.selectedEntry = null;
    this.editingEntryId = null;
    this.triedSubmit = false;
    this.error = '';
    this.formLedgerId = this.selectedLedgerId;
    this.formDocumentType = 'General';
    this.formPostingDate = new Date().toISOString().split('T')[0];
    this.formDocumentDate = new Date().toISOString().split('T')[0];
    this.formDescription = '';
    this.formCurrencyCode = 'PKR';
    this.formReferenceNumber = '';
    this.formLines = [this.newLine()];
    this.loadLedgerAccounts(this.formLedgerId);
  }

  openEditForm(entry: JournalEntryDto) {
    this.showForm = true;
    this.selectedEntry = null;
    this.editingEntryId = entry.id;
    this.triedSubmit = false;
    this.error = '';
    this.formLedgerId = this.selectedLedgerId;
    this.formDocumentType = entry.documentType ?? 'General';
    this.formPostingDate = (entry.postingDate ?? '').split('T')[0];
    this.formDocumentDate = (entry.documentDate ?? '').split('T')[0];
    this.formDescription = entry.description ?? '';
    this.formCurrencyCode = entry.currencyCode ?? '';
    this.formReferenceNumber = entry.referenceNumber ?? '';
    this.formLines = [this.newLine()];
    this.loadLedgerAccounts(this.formLedgerId);

    // Fetch the full entry (the list response doesn't carry lines)
    this.journalService.getById(entry.id).subscribe({
      next: (res) => {
        const lines = res.data?.lines ?? [];
        this.formLines = lines.length
          ? lines.map((l) => ({
              ledgerAccountId: l.ledgerAccountId,
              debitAmount: l.debitAmount,
              creditAmount: l.creditAmount,
              currencyCode: this.formCurrencyCode || 'PKR',
              description: l.description ?? '',
            }))
          : [this.newLine()];
        this.cdr.detectChanges();
      },
      error: () => { this.cdr.detectChanges(); },
    });
  }

  deleteEntry(entry: JournalEntryDto) {
    if (!confirm(`Delete journal entry "${entry.journalNumber}"? This cannot be undone.`)) return;
    this.journalService.delete(entry.id).subscribe({
      next: () => {
        this.successMsg = 'Journal entry deleted';
        this.cdr.detectChanges();
        this.loadEntries();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.error = 'Failed to delete journal entry'; this.cdr.detectChanges(); },
    });
  }

  newLine(): JournalLineForm {
    return { ledgerAccountId: '', debitAmount: 0, creditAmount: 0, currencyCode: 'PKR', description: '' };
  }

  addLine() { this.formLines.push(this.newLine()); }
  removeLine(i: number) { this.formLines.splice(i, 1); }

  loadLedgerAccounts(ledgerId: string) {
    this.ledgerAccountService.getByLedger(ledgerId, { pageSize: 1000 }).subscribe({
      next: (res) => {
        this.ledgerAccounts = res.data ?? [];
        this.cdr.detectChanges();
      },
    });
  }

  onFormLedgerChange() { this.loadLedgerAccounts(this.formLedgerId); }

  get totalDebit(): number { return this.formLines.reduce((s, l) => s + (l.debitAmount || 0), 0); }
  get totalCredit(): number { return this.formLines.reduce((s, l) => s + (l.creditAmount || 0), 0); }
  get isBalanced(): boolean { return Math.abs(this.totalDebit - this.totalCredit) < 0.01; }

  // ---- Validation ----
  get fieldErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    // In edit mode only Description, Posting Date and Reference are editable.
    if (!this.formDescription || !this.formDescription.trim()) e['description'] = 'Description is required';
    if (!this.formPostingDate) e['postingDate'] = 'Posting date is required';
    if (this.isEditMode) return e;
    if (!this.formLedgerId) e['ledger'] = 'Ledger is required';
    if (!this.formDocumentType) e['documentType'] = 'Document type is required';
    if (!this.formDocumentDate) e['documentDate'] = 'Document date is required';
    if (!this.formCurrencyCode) e['currency'] = 'Currency is required';
    return e;
  }

  lineError(line: JournalLineForm): string | null {
    if (!line.ledgerAccountId) return 'Select an account';
    const debit = line.debitAmount || 0;
    const credit = line.creditAmount || 0;
    if (debit <= 0 && credit <= 0) return 'Enter a debit or credit amount';
    return null;
  }

  get linesValid(): boolean {
    return this.formLines.length > 0 && this.formLines.every((l) => !this.lineError(l));
  }

  get isFormValid(): boolean {
    return Object.keys(this.fieldErrors).length === 0 && this.linesValid && this.isBalanced;
  }

  cancelForm() { this.showForm = false; this.triedSubmit = false; this.editingEntryId = null; }

  saveEntry() {
    this.triedSubmit = true;
    if (!this.isFormValid) {
      this.error = 'Please fix the highlighted fields before saving the entry.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.isEditMode) {
      const updateDto: UpdateJournalEntryDto = {
        description: this.formDescription,
        referenceNumber: this.formReferenceNumber || null,
        postingDate: this.formPostingDate,
        lines: this.formLines.map((l, i) => ({
          ledgerAccountId: l.ledgerAccountId,
          debitAmount: l.debitAmount,
          creditAmount: l.creditAmount,
          currencyCode: l.currencyCode,
          description: l.description,
          lineNumber: i + 1,
        })),
      };
      this.journalService.update(this.editingEntryId!, updateDto).subscribe({
        next: () => {
          this.showForm = false;
          this.editingEntryId = null;
          this.successMsg = 'Journal entry updated successfully';
          this.cdr.detectChanges();
          this.loadEntries();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to update journal entry'; this.cdr.detectChanges(); },
      });
      return;
    }

    const lines: CreateJournalLineDto[] = this.formLines.map((l, i) => ({
      ledgerAccountId: l.ledgerAccountId,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
      currencyCode: l.currencyCode,
      description: l.description,
      lineNumber: i + 1,
    }));
    const dto: CreateJournalEntryDto = {
      ledgerId: this.formLedgerId,
      documentType: this.formDocumentType,
      postingDate: this.formPostingDate,
      documentDate: this.formDocumentDate,
      description: this.formDescription,
      currencyCode: this.formCurrencyCode,
      referenceNumber: this.formReferenceNumber || null,
      lines,
    };
    this.journalService.create(dto).subscribe({
      next: (res) => {
        this.showForm = false;
        this.successMsg = 'Journal entry created successfully';
        this.cdr.detectChanges();
        this.loadEntries();
        this.highlighter.flash(res.data?.id, this.cdr);
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.error = 'Failed to create journal entry'; this.cdr.detectChanges(); },
    });
  }

  viewEntry(entry: JournalEntryDto) { this.selectedEntry = entry; this.showForm = false; }
  closeDetail() { this.selectedEntry = null; }

  submitEntry(entry: JournalEntryDto) {
    this.journalService.submit(entry.id).subscribe({
      next: () => {
        this.successMsg = 'Entry submitted';
        this.selectedEntry = null;
        this.cdr.detectChanges();
        this.loadEntries();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.error = 'Failed to submit'; this.cdr.detectChanges(); },
    });
  }

  postEntry(entry: JournalEntryDto) {
    this.journalService.post(entry.id).subscribe({
      next: () => {
        this.successMsg = 'Entry posted';
        this.selectedEntry = null;
        this.cdr.detectChanges();
        this.loadEntries();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.error = 'Failed to post'; this.cdr.detectChanges(); },
    });
  }

  reverseEntry(entry: JournalEntryDto) {
    if (confirm('Are you sure you want to reverse this entry?')) {
      this.journalService.reverse(entry.id).subscribe({
        next: () => {
          this.successMsg = 'Entry reversed';
          this.selectedEntry = null;
          this.cdr.detectChanges();
          this.loadEntries();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to reverse'; this.cdr.detectChanges(); },
      });
    }
  }

  getStatusClass(status: string | null): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'draft') return 'badge-draft';
    if (s === 'submitted' || s === 'pending approval') return 'badge-submitted';
    if (s === 'posted' || s === 'approved') return 'badge-posted';
    if (s === 'reversed' || s === 'rejected' || s === 'cancelled' || s === 'voided') return 'badge-reversed';
    return '';
  }

  getAccountName(id: string): string {
    return this.ledgerAccounts.find((a) => a.id === id)?.accountName ?? id;
  }
}
