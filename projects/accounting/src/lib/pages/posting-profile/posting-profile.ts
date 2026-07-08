import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostingProfileDto } from '../../models';
import { PaginationParams } from '../../models';
import { PostingProfileService } from '../../services/posting-profile.service';

@Component({
  selector: 'lib-posting-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posting-profile.html',
  styleUrl: './posting-profile.css',
})
export class PostingProfileComponent {
  profiles: PostingProfileDto[] = [];
  loading = false;
  error = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  moduleName = '';
  moduleOptions = ['Accounting', 'Sales', 'Procurement', 'Inventory', 'HR'];

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get displayProfiles(): PostingProfileDto[] {
    const rows = [...this.profiles];
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
    private svc: PostingProfileService,
    private cdr: ChangeDetectorRef,
  ) {}

  searchByModule(): void {
    if (!this.moduleName) {
      this.error = 'Please select a module';
      return;
    }
    this.page = 1;
    this.fetchProfiles();
  }

  private fetchProfiles(): void {
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize };
    this.svc.getByModule(this.moduleName, pagination).subscribe({
      next: (res) => {
        this.profiles = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (!res.success) this.error = res.message ?? 'Failed to load posting profiles';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Network error loading posting profiles';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number) {
    this.page = page;
    this.fetchProfiles();
  }

  onPageSizeChange() {
    this.page = 1;
    this.fetchProfiles();
  }
}
