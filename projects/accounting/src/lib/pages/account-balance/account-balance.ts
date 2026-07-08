import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountBalanceDto, PaginationParams, PaginatedResponse } from '../../models';
import { AccountBalanceService } from '../../services/account-balance.service';

@Component({
  selector: 'lib-account-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-balance.html',
  styleUrl: './account-balance.css',
})
export class AccountBalanceComponent implements OnInit {
  balances: AccountBalanceDto[] = [];
  loading = false;
  error = '';

  filterMode: 'account' | 'period' | 'both' = 'account';
  accountId = '';
  periodId = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get displayBalances(): AccountBalanceDto[] {
    const rows = [...this.balances];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  constructor(
    private svc: AccountBalanceService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  search(): void {
    this.page = 1;
    this.fetchBalances();
  }

  goToPage(page: number): void {
    this.page = page;
    this.fetchBalances();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.fetchBalances();
  }

  private fetchBalances(): void {
    this.loading = true;
    this.error = '';
    this.balances = [];

    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize };

    if (this.filterMode === 'both' && this.accountId && this.periodId) {
      this.svc.getByAccountAndPeriod(this.accountId, this.periodId).subscribe({
        next: (res) => {
          this.balances = res.success ? (res.data ?? []) : [];
          if (!res.success) this.error = res.message ?? 'Failed to load balances';
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Network error loading balances';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else if (this.filterMode === 'period' && this.periodId) {
      this.svc.getByPeriod(this.periodId, pagination).subscribe({
        next: (res) => this.handlePaginatedResponse(res),
        error: () => this.handleError(),
      });
    } else if (this.filterMode === 'account' && this.accountId) {
      this.svc.getByAccount(this.accountId, pagination).subscribe({
        next: (res) => this.handlePaginatedResponse(res),
        error: () => this.handleError(),
      });
    } else {
      this.error = 'Please provide the required filter values';
      this.loading = false;
    }
  }

  private handlePaginatedResponse(res: PaginatedResponse<AccountBalanceDto>): void {
    this.balances = res.success ? (res.data ?? []) : [];
    this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
    this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
    this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
    if (!res.success) this.error = res.message ?? 'Failed to load balances';
    this.loading = false;
    this.cdr.detectChanges();
  }

  private handleError(): void {
    this.error = 'Network error loading balances';
    this.loading = false;
    this.cdr.detectChanges();
  }
}
