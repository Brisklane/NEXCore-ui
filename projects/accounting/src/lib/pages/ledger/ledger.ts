import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LedgerService } from '../../services/ledger.service';
import { FiscalCalendarService } from '../../services/fiscal-calendar.service';
import { GeoService, CurrencyDto } from '../../services/geo.service';
import { LedgerDto, CreateLedgerDto, UpdateLedgerDto } from '../../models/ledger.model';
import { FiscalCalendarDto } from '../../models/fiscal-calendar.model';
import { PaginationParams } from '../../models';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-ledger',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ledger.html',
  styleUrl: './ledger.css',
})
export class Ledger implements OnInit {
  ledgers: LedgerDto[] = [];
  fiscalCalendars: FiscalCalendarDto[] = [];
  currencies: CurrencyDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingLedger: LedgerDto | null = null;

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce: any;

  highlighter = new RowHighlighter();

  // Form fields
  formName = '';
  formCurrency = '';
  formCalendarId = '';
  formIsDefault = false;
  formDescription = '';
  formIsActive = true;

  constructor(
    private ledgerService: LedgerService,
    private fiscalCalendarService: FiscalCalendarService,
    private geoService: GeoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLedgers();
    this.loadFiscalCalendars();
    this.geoService.getCurrencies().subscribe({
      next: (data) => { this.currencies = data; this.cdr.detectChanges(); },
    });
  }

  loadLedgers() {
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection };
    this.ledgerService.getAll(pagination).subscribe({
      next: (res) => {
        this.ledgers = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load ledgers';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.loadLedgers();
  }

  applyFilters(): void {
    this.page = 1;
    this.loadLedgers();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  goToPage(page: number) {
    this.page = page;
    this.loadLedgers();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadLedgers();
  }

  loadFiscalCalendars() {
    this.fiscalCalendarService.getAll({ pageSize: 1000 }).subscribe({
      next: (res) => {
        this.fiscalCalendars = res.data ?? [];
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingLedger = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(ledger: LedgerDto) {
    this.editingLedger = ledger;
    this.formName = ledger.name ?? '';
    this.formCurrency = ledger.baseCurrencyCode ?? '';
    this.formCalendarId = ledger.fiscalCalendarId;
    this.formIsDefault = ledger.isDefault;
    this.formDescription = ledger.description ?? '';
    this.formIsActive = ledger.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formCurrency = 'PKR';
    this.formCalendarId = '';
    this.formIsDefault = false;
    this.formDescription = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingLedger = null;
    this.resetForm();
  }

  saveLedger() {
    if (this.editingLedger) {
      const dto: UpdateLedgerDto = {
        name: this.formName,
        baseCurrencyCode: this.formCurrency,
        fiscalCalendarId: this.formCalendarId,
        isDefault: this.formIsDefault,
        isActive: this.formIsActive,
        description: this.formDescription,
      };
      this.ledgerService.update(this.editingLedger.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadLedgers(); },
        error: () => { this.error = 'Failed to update ledger'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateLedgerDto = {
        name: this.formName,
        baseCurrencyCode: this.formCurrency,
        fiscalCalendarId: this.formCalendarId,
        isDefault: this.formIsDefault,
        description: this.formDescription,
      };
      this.ledgerService.create(dto).subscribe({
        next: (res) => { this.showForm = false; this.loadLedgers(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: () => { this.error = 'Failed to create ledger'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteLedger(ledger: LedgerDto) {
    if (confirm(`Delete ledger "${ledger.name}"?`)) {
      this.ledgerService.delete(ledger.id).subscribe({
        next: () => this.loadLedgers(),
        error: () => { this.error = 'Failed to delete ledger'; this.cdr.detectChanges(); },
      });
    }
  }

  getCalendarName(id: string): string {
    return this.fiscalCalendars.find((c) => c.id === id)?.name ?? '—';
  }
}
