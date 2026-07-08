import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowHighlighter } from '@nexcore/shared';
import { BrandService } from '../../services/brand.service';
import { BrandDto, CreateBrandDto, UpdateBrandDto } from '../../models/brand.model';

@Component({
  selector: 'lib-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class BrandsPage implements OnInit {
  items: BrandDto[] = [];
  loading = false; error = ''; showForm = false;
  editingItem: BrandDto | null = null;

  /** Flashes the newly-created row green and floats it to the top. */
  highlighter = new RowHighlighter();
  private justCreated: BrandDto | null = null;

  filterSearch = '';
  filterStatus = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  formCode = ''; formName = ''; formDescription = '';
  formLogoUrl = ''; formWebsite = ''; formIsActive = true;

  page = 1; pageSize = 10; totalCount = 0; totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(private service: BrandService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }

  private searchDebounce: any;
  applyFilters(): void { this.page = 1; this.load(); }
  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }
  clearFilters(): void { this.filterSearch = ''; this.filterStatus = ''; this.page = 1; this.load(); }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize,
      searchTerm: this.filterSearch || undefined,
      sortBy: this.sortBy, sortDirection: this.sortDirection,
      isActive: this.filterStatus === '' ? undefined : this.filterStatus === 'active',
    }).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load brands'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  /** List ordered so the freshly-created row sits on top while it's highlighted. */
  get displayItems(): BrandDto[] {
    const id = this.highlighter.id;
    if (id == null) return this.items;
    const idx = this.items.findIndex(i => i.id === id);
    if (idx <= 0) return this.items;
    const copy = [...this.items];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  /** After a reload following a create, prepend the new row if it fell off the page/sort, then flash it. */
  private applyJustCreated(): void {
    const created = this.justCreated;
    if (!created) return;
    this.justCreated = null;
    if (!this.items.some(i => i.id === created.id)) this.items = [created, ...this.items];
    this.highlighter.flash(created.id, this.cdr);
  }

  goToPage(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(): void { this.page = 1; this.load(); }
  openCreateForm(): void {
    this.editingItem = null;
    this.resetForm();
    this.formCode = `BRD-${(this.totalCount + 1).toString().padStart(6, '0')}`;
    this.showForm = true;
  }
  openEditForm(item: BrandDto): void {
    this.editingItem = item; this.formCode = item.code ?? ''; this.formName = item.name ?? '';
    this.formDescription = item.description ?? ''; this.formLogoUrl = item.logoUrl ?? '';
    this.formWebsite = item.website ?? ''; this.formIsActive = item.isActive; this.showForm = true;
  }
  resetForm(): void { this.formCode = ''; this.formName = ''; this.formDescription = ''; this.formLogoUrl = ''; this.formWebsite = ''; this.formIsActive = true; }
  cancelForm(): void { this.showForm = false; this.editingItem = null; this.resetForm(); }
  save(): void {
    const obs = this.editingItem
      ? this.service.update(this.editingItem.id, {
          code: this.formCode || null, name: this.formName || null,
          description: this.formDescription || null, logoUrl: this.formLogoUrl || null,
          website: this.formWebsite || null, isActive: this.formIsActive,
        } as UpdateBrandDto)
      : this.service.create({
          code: this.formCode || null, name: this.formName || null,
          description: this.formDescription || null, logoUrl: this.formLogoUrl || null,
          website: this.formWebsite || null,
        } as CreateBrandDto);
    const isCreate = !this.editingItem;
    obs.subscribe({
      next: (res) => {
        if (!res.success) { this.error = res.message || 'Failed to save'; this.cdr.detectChanges(); return; }
        if (isCreate) this.justCreated = res.data ?? null;
        this.showForm = false; this.load();
      },
      error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to save'; this.cdr.detectChanges(); },
    });
  }
  delete(item: BrandDto): void {
    if (!confirm('Delete this brand?')) return;
    this.service.delete(item.id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => { this.error = err.error?.message || 'Failed to delete'; this.cdr.detectChanges(); },
    });
  }
}