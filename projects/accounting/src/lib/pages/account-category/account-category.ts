import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountCategoryService } from '../../services/account-category.service';
import { AccountCategoryDto } from '../../models';

@Component({
  selector: 'lib-account-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-category.html',
  styleUrl: './account-category.css',
})
export class AccountCategoryComponent implements OnInit {
  categories: AccountCategoryDto[] = [];
  loading = false;
  error = '';

  filterSearch = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  private searchDebounce: any;

  constructor(
    private categoryService: AccountCategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll({ pageSize: 100, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection }).subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load account categories';
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
    this.loadCategories();
  }

  applyFilters(): void {
    this.loadCategories();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
}
