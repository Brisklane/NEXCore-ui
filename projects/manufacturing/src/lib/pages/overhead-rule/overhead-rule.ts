import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverheadRuleService } from '../../services/overhead-rule.service';
import { OverheadRuleDto, CreateOverheadRuleDto, UpdateOverheadRuleDto } from '../../models/overhead-rule.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-overhead-rule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overhead-rule.html',
  styleUrl: './overhead-rule.css',
})
export class OverheadRule implements OnInit {
  items: OverheadRuleDto[] = [];
  filteredItems: OverheadRuleDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: OverheadRuleDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  // Form fields
  formCode = '';
  formOverheadType = '';
  formRateType = 'Percentage';
  formRate = 0;
  formBasis = '';
  formEffectiveDate = '';
  formEffectiveTo = '';
  formIsActive = true;
  rateTypes = ['Percentage', 'Fixed', 'PerHour', 'PerUnit'];

  // Filters
  filterSearch = '';
  filterRateType = '';
  filterStatus = 'all'; // all, active, inactive

  constructor(private svc: OverheadRuleService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyFilters();
        this.applyJustCreated();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load overhead rules';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      const matchSearch =
        !this.filterSearch ||
        item.code?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.name?.toLowerCase().includes(this.filterSearch.toLowerCase()) ||
        item.appliesTo?.toLowerCase().includes(this.filterSearch.toLowerCase());

      const matchRateType = !this.filterRateType || item.rateType === this.filterRateType;

      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && item.isActive) ||
        (this.filterStatus === 'inactive' && !item.isActive);

      return matchSearch && matchRateType && matchStatus;
    });
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.applyFilters();
  }

  get displayRows(): any[] {
    let rows: any[] = [...this.filteredItems];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const id = this.highlighter.id;
    if (id != null) {
      const idx = rows.findIndex(r => r?.id === id);
      if (idx > 0) { const [row] = rows.splice(idx, 1); rows.unshift(row); }
    }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  private applyJustCreated(): void {
    const c = this.justCreated;
    if (!c) return;
    this.justCreated = null;
    if (!this.filteredItems.some((i: any) => i?.id === c.id)) this.filteredItems = [c, ...this.filteredItems];
    this.highlighter.flash(c.id, this.cdr);
  }

  isEffectiveNow(item: OverheadRuleDto): boolean {
    if (!item.effectiveFrom) return true;
    const today = new Date();
    const fromDate = new Date(item.effectiveFrom);
    const toDate = item.effectiveTo ? new Date(item.effectiveTo) : null;
    return fromDate <= today && (!toDate || today <= toDate);
  }

  openCreate() {
    this.editing = null;
    this.reset();
    this.showForm = true;
  }

  openEdit(item: OverheadRuleDto) {
    this.editing = item;
    this.formCode = item.code ?? '';
    this.formOverheadType = item.name ?? '';
    this.formRateType = item.rateType ?? 'Percentage';
    this.formRate = item.value ?? 0;
    this.formBasis = item.appliesTo ?? '';
    this.formEffectiveDate = item.effectiveFrom ? item.effectiveFrom.substring(0, 10) : '';
    this.formEffectiveTo = item.effectiveTo ? item.effectiveTo.substring(0, 10) : '';
    this.formIsActive = item.isActive ?? true;
    this.showForm = true;
  }

  reset() {
    this.formCode = '';
    this.formOverheadType = '';
    this.formRateType = 'Percentage';
    this.formRate = 0;
    this.formBasis = '';
    this.formEffectiveDate = '';
    this.formEffectiveTo = '';
    this.formIsActive = true;
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  save() {
    if (!this.formOverheadType.trim()) {
      this.error = 'Rule name is required.';
      this.cdr.detectChanges();
      return;
    }

    if (this.formRate < 0) {
      this.error = 'Rate must be non-negative.';
      this.cdr.detectChanges();
      return;
    }

    if (this.formEffectiveDate && this.formEffectiveTo && this.formEffectiveDate > this.formEffectiveTo) {
      this.error = 'Effective From date cannot be after Effective To date.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editing) {
      const dto: UpdateOverheadRuleDto = {
        code: this.formCode || undefined,
        name: this.formOverheadType,
        rateType: this.formRateType || undefined,
        value: this.formRate,
        appliesTo: this.formBasis || undefined,
        effectiveFrom: this.formEffectiveDate || undefined,
        effectiveTo: this.formEffectiveTo || undefined,
        isActive: this.formIsActive,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to update';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateOverheadRuleDto = {
        code: this.formCode || undefined,
        name: this.formOverheadType,
        rateType: this.formRateType || undefined,
        value: this.formRate,
        appliesTo: this.formBasis || undefined,
        effectiveFrom: this.formEffectiveDate || undefined,
        effectiveTo: this.formEffectiveTo || undefined,
      };
      this.svc.create(dto).subscribe({
        next: (res) => {
          this.justCreated = res.data ?? null;
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to create';
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: OverheadRuleDto) {
    if (confirm(`Delete overhead rule "${item.name}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => {
          this.error = 'Failed to delete';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
