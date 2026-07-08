import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiscalCalendarService } from '../../services/fiscal-calendar.service';
import { PaginationParams } from '../../models';
import {
  FiscalCalendarDto, CreateFiscalCalendarDto, UpdateFiscalCalendarDto,
  FiscalPeriodDto, CreateFiscalPeriodDto, UpdateFiscalPeriodDto,
} from '../../models/fiscal-calendar.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-fiscal-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fiscal-calendar.html',
  styleUrl: './fiscal-calendar.css',
})
export class FiscalCalendar implements OnInit {
  calendars: FiscalCalendarDto[] = [];
  highlighter = new RowHighlighter();
  loading = false;
  error = '';
  successMsg = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce: any;

  // Fiscal year form
  showCalendarForm = false;
  editingCalendar: FiscalCalendarDto | null = null;
  calFormName = '';
  calFormStartDate = '';
  calFormEndDate = '';
  calFormDescription = '';
  calTriedSubmit = false;

  // Detail
  selectedCalendar: FiscalCalendarDto | null = null;
  periods: FiscalPeriodDto[] = [];
  loadingPeriods = false;

  periodsPage = 1;
  periodsPageSize = 10;
  periodsTotalCount = 0;
  periodsTotalPages = 0;

  // Period form
  showPeriodForm = false;
  editingPeriod: FiscalPeriodDto | null = null;
  periodFormName = '';
  periodFormStartDate = '';
  periodFormEndDate = '';
  periodFormIsClosed = false;
  periodFormDescription = '';

  constructor(
    private fiscalCalendarService: FiscalCalendarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCalendars();
  }

  loadCalendars() {
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection };
    this.fiscalCalendarService.getAll(pagination).subscribe({
      next: (res) => {
        this.calendars = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load fiscal calendars';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadCalendars();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.loadCalendars();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  goToPage(page: number) {
    this.page = page;
    this.loadCalendars();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadCalendars();
  }

  // ── Fiscal year form & actions ──
  get calFormErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!this.calFormName || !this.calFormName.trim()) e['name'] = 'Name is required';
    if (!this.calFormStartDate) e['startDate'] = 'Start date is required';
    if (!this.calFormEndDate) e['endDate'] = 'End date is required';
    if (this.calFormStartDate && this.calFormEndDate && this.calFormEndDate <= this.calFormStartDate)
      e['endDate'] = 'End date must be after the start date';
    return e;
  }

  get isCalFormValid(): boolean {
    return Object.keys(this.calFormErrors).length === 0;
  }

  /** A year can be edited/deleted only when open (not closed) and free of transactions. */
  canModify(calendar: FiscalCalendarDto): boolean {
    return !calendar.isClosed && !calendar.hasTransactions;
  }

  openCreateCalendarForm() {
    this.editingCalendar = null;
    this.calFormName = '';
    this.calFormStartDate = '';
    this.calFormEndDate = '';
    this.calFormDescription = '';
    this.calTriedSubmit = false;
    this.error = '';
    this.showCalendarForm = true;
    this.selectedCalendar = null;
  }

  openEditCalendarForm(calendar: FiscalCalendarDto) {
    this.editingCalendar = calendar;
    this.calFormName = calendar.name ?? '';
    this.calFormStartDate = (calendar.startDate ?? '').split('T')[0];
    this.calFormEndDate = (calendar.endDate ?? '').split('T')[0];
    this.calFormDescription = calendar.description ?? '';
    this.calTriedSubmit = false;
    this.error = '';
    this.showCalendarForm = true;
    this.selectedCalendar = null;
  }

  cancelCalendarForm() {
    this.showCalendarForm = false;
    this.editingCalendar = null;
    this.calTriedSubmit = false;
  }

  saveCalendar() {
    this.calTriedSubmit = true;
    if (!this.isCalFormValid) {
      this.error = 'Please fix the highlighted fields before saving.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';

    if (this.editingCalendar) {
      const dto: UpdateFiscalCalendarDto = {
        name: this.calFormName,
        startDate: this.calFormStartDate,
        endDate: this.calFormEndDate,
        description: this.calFormDescription || null,
      };
      this.fiscalCalendarService.updateCalendar(this.editingCalendar.id, dto).subscribe({
        next: () => this.afterCalendarSaved('Fiscal year updated'),
        error: (e) => this.showApiError(e, 'Failed to update fiscal year'),
      });
    } else {
      const dto: CreateFiscalCalendarDto = {
        name: this.calFormName,
        startDate: this.calFormStartDate,
        endDate: this.calFormEndDate,
        description: this.calFormDescription || null,
      };
      this.fiscalCalendarService.createCalendar(dto).subscribe({
        next: (res) => { this.afterCalendarSaved('Fiscal year created'); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => this.showApiError(e, 'Failed to create fiscal year'),
      });
    }
  }

  private afterCalendarSaved(msg: string) {
    this.showCalendarForm = false;
    this.editingCalendar = null;
    this.successMsg = msg;
    this.cdr.detectChanges();
    this.loadCalendars();
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  private showApiError(err: unknown, fallback: string) {
    const msg = (err as { error?: { message?: string } })?.error?.message;
    this.error = msg || fallback;
    this.cdr.detectChanges();
    setTimeout(() => { this.error = ''; this.cdr.detectChanges(); }, 5000);
  }

  deleteCalendar(calendar: FiscalCalendarDto) {
    if (!confirm(`Delete fiscal year "${calendar.name}"? This cannot be undone.`)) return;
    this.fiscalCalendarService.deleteCalendar(calendar.id).subscribe({
      next: () => this.afterCalendarSaved('Fiscal year deleted'),
      error: (e) => this.showApiError(e, 'Failed to delete fiscal year'),
    });
  }

  closeCalendar(calendar: FiscalCalendarDto) {
    if (!confirm(`Close fiscal year "${calendar.name}"? It will become read-only.`)) return;
    this.fiscalCalendarService.closeCalendar(calendar.id).subscribe({
      next: () => this.afterCalendarSaved('Fiscal year closed'),
      error: (e) => this.showApiError(e, 'Failed to close fiscal year'),
    });
  }

  reopenCalendar(calendar: FiscalCalendarDto) {
    if (!confirm(`Reopen fiscal year "${calendar.name}"?`)) return;
    this.fiscalCalendarService.reopenCalendar(calendar.id).subscribe({
      next: () => this.afterCalendarSaved('Fiscal year reopened'),
      error: (e) => this.showApiError(e, 'Failed to reopen fiscal year'),
    });
  }

  // ── View / Periods ──
  viewCalendar(calendar: FiscalCalendarDto) {
    this.selectedCalendar = calendar;
    this.showPeriodForm = false;
    this.showCalendarForm = false;
    this.periodsPage = 1;
    this.loadPeriods();
  }

  closeDetail() {
    this.selectedCalendar = null;
    this.periods = [];
  }

  loadPeriods() {
    if (!this.selectedCalendar) return;
    this.loadingPeriods = true;
    const pagination: PaginationParams = { pageNumber: this.periodsPage, pageSize: this.periodsPageSize };
    this.fiscalCalendarService.getPeriods(this.selectedCalendar.id, pagination).subscribe({
      next: (res) => {
        this.periods = res.data ?? [];
        this.periodsTotalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.periodsPage = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.periodsPage;
        this.periodsTotalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.periodsTotalCount / this.periodsPageSize);
        this.loadingPeriods = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.periods = [];
        this.loadingPeriods = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPeriodsPage(page: number) {
    this.periodsPage = page;
    this.loadPeriods();
  }

  onPeriodsPageSizeChange() {
    this.periodsPage = 1;
    this.loadPeriods();
  }

  // ── Period CRUD (uses separate FiscalPeriod controller) ──
  openCreatePeriodForm() {
    this.editingPeriod = null;
    this.periodFormName = '';
    this.periodFormStartDate = '';
    this.periodFormEndDate = '';
    this.periodFormIsClosed = false;
    this.periodFormDescription = '';
    this.showPeriodForm = true;
  }

  openEditPeriodForm(period: FiscalPeriodDto) {
    this.editingPeriod = period;
    this.periodFormName = period.periodName ?? '';
    this.periodFormStartDate = period.startDate?.split('T')[0] ?? '';
    this.periodFormEndDate = period.endDate?.split('T')[0] ?? '';
    this.periodFormIsClosed = period.isClosed;
    this.periodFormDescription = period.description ?? '';
    this.showPeriodForm = true;
  }

  cancelPeriodForm() {
    this.showPeriodForm = false;
    this.editingPeriod = null;
  }

  savePeriod() {
    if (!this.selectedCalendar) return;
    if (this.editingPeriod) {
      const dto: UpdateFiscalPeriodDto = {
        periodName: this.periodFormName,
        startDate: this.periodFormStartDate,
        endDate: this.periodFormEndDate,
        isClosed: this.periodFormIsClosed,
        description: this.periodFormDescription || null,
      };
      this.fiscalCalendarService.updatePeriod(this.editingPeriod.id, dto).subscribe({
        next: () => {
          this.showPeriodForm = false;
          this.successMsg = 'Period updated';
          this.cdr.detectChanges();
          this.loadPeriods();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to update period'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateFiscalPeriodDto = {
        fiscalCalendarId: this.selectedCalendar.id,
        periodName: this.periodFormName,
        startDate: this.periodFormStartDate,
        endDate: this.periodFormEndDate,
        description: this.periodFormDescription || null,
      };
      this.fiscalCalendarService.createPeriod(dto).subscribe({
        next: () => {
          this.showPeriodForm = false;
          this.successMsg = 'Period created';
          this.cdr.detectChanges();
          this.loadPeriods();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to create period'; this.cdr.detectChanges(); },
      });
    }
  }

  deletePeriod(period: FiscalPeriodDto) {
    if (confirm(`Delete period "${period.periodName}"?`)) {
      this.fiscalCalendarService.deletePeriod(period.id).subscribe({
        next: () => {
          this.successMsg = 'Period deleted';
          this.cdr.detectChanges();
          this.loadPeriods();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to delete period'; this.cdr.detectChanges(); },
      });
    }
  }

  closePeriod(period: FiscalPeriodDto) {
    if (confirm(`Close period "${period.periodName}"? This cannot be undone.`)) {
      this.fiscalCalendarService.closePeriod(period.id).subscribe({
        next: () => {
          this.successMsg = 'Period closed';
          this.cdr.detectChanges();
          this.loadPeriods();
          setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
        },
        error: () => { this.error = 'Failed to close period'; this.cdr.detectChanges(); },
      });
    }
  }
}
