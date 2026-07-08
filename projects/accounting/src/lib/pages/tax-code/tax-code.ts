import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxCodeDto } from '../../models';
import { PaginationParams } from '../../models';
import { TaxCodeService } from '../../services/tax-code.service';

@Component({
  selector: 'lib-tax-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-code.html',
  styleUrl: './tax-code.css',
})
export class TaxCodeComponent implements OnInit {
  taxCodes: TaxCodeDto[] = [];
  loading = false;
  error = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  sortBy = 'code';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce: any;

  constructor(
    private svc: TaxCodeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadTaxCodes();
  }

  loadTaxCodes(): void {
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection };
    this.svc.getAll(pagination).subscribe({
      next: (res) => {
        this.taxCodes = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (!res.success) this.error = res.message ?? 'Failed to load tax codes';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Network error loading tax codes';
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
    this.loadTaxCodes();
  }

  applyFilters(): void {
    this.page = 1;
    this.loadTaxCodes();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  goToPage(page: number) {
    this.page = page;
    this.loadTaxCodes();
  }

  onPageSizeChange() {
    this.page = 1;
    this.loadTaxCodes();
  }
}
