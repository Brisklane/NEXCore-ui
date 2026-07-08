import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverheadRuleService } from '../../services/overhead-rule.service';
import { OverheadRuleDto, CreateOverheadRuleDto, UpdateOverheadRuleDto } from '../../models/overhead-rule.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-labor-rate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labor-rate.html',
  styleUrl: './labor-rate.css',
})
export class LaborRate implements OnInit {
  items: OverheadRuleDto[] = [];
  filteredItems: OverheadRuleDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editing: OverheadRuleDto | null = null;

  formCode = '';
  formName = '';
  formRatePerHour = 0;
  formWorkCenterScope = 'All';
  formEffectiveFrom = '';
  formEffectiveTo = '';
  formIsActive = true;

  filterSearch = '';
  filterStatus = 'all';

  page = 1;
  pageSize = 10;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get pagedItems(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.displayRows.slice(start, start + this.pageSize);
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
    if (!this.items.some((i: any) => i?.id === c.id)) this.items = [c, ...this.items];
    this.highlighter.flash(c.id, this.cdr);
  }

  constructor(private svc: OverheadRuleService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  private isLaborRule(item: OverheadRuleDto): boolean {
    const name = (item.name ?? '').toLowerCase();
    const code = (item.code ?? '').toLowerCase();
    const appliesTo = (item.appliesTo ?? '').toLowerCase();
    return appliesTo.includes('labor') || appliesTo.includes('labour') || code.startsWith('lr-') || name.includes('labor') || name.includes('labour');
  }

  private normalizeLaborAppliesTo(scope: string): string {
    const trimmed = scope.trim();
    return `Labor:${trimmed || 'All'}`;
  }

  private extractScope(appliesTo: string | null | undefined): string {
    const raw = (appliesTo ?? '').trim();
    if (!raw) return 'All';
    const parts = raw.split(':');
    if (parts.length < 2) return 'All';
    return parts.slice(1).join(':').trim() || 'All';
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageSize: 1000 }).subscribe({
      next: (r) => {
        this.items = (r.data ?? []).filter((x) => this.isLaborRule(x));
        this.applyJustCreated();
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load labor rates';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      const search = this.filterSearch.toLowerCase();
      const matchSearch = !search ||
        (item.code ?? '').toLowerCase().includes(search) ||
        (item.name ?? '').toLowerCase().includes(search) ||
        (item.appliesTo ?? '').toLowerCase().includes(search);

      const matchStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && item.isActive) ||
        (this.filterStatus === 'inactive' && !item.isActive);

      return matchSearch && matchStatus;
    });
    this.totalPages = Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
    this.cdr.detectChanges();
  }

  onFilterChange() {
    this.page = 1;
    this.applyFilters();
  }

  goToPage(page: number) { this.page = page; }
  onPageSizeChange() { this.page = 1; this.totalPages = Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize)); }

  openCreate() {
    this.editing = null;
    this.reset();
    this.formCode = 'LR-' + String(this.items.length + 1).padStart(3, '0');
    this.showForm = true;
  }

  openEdit(item: OverheadRuleDto) {
    this.editing = item;
    this.formCode = item.code ?? '';
    this.formName = item.name ?? '';
    this.formRatePerHour = item.value ?? 0;
    this.formWorkCenterScope = this.extractScope(item.appliesTo);
    this.formEffectiveFrom = item.effectiveFrom ? item.effectiveFrom.substring(0, 10) : '';
    this.formEffectiveTo = item.effectiveTo ? item.effectiveTo.substring(0, 10) : '';
    this.formIsActive = item.isActive ?? true;
    this.showForm = true;
  }

  reset() {
    this.formCode = '';
    this.formName = 'Labor Rate';
    this.formRatePerHour = 0;
    this.formWorkCenterScope = 'All';
    this.formEffectiveFrom = '';
    this.formEffectiveTo = '';
    this.formIsActive = true;
  }

  cancel() {
    this.showForm = false;
    this.editing = null;
    this.reset();
  }

  save() {
    if (!this.formName.trim()) {
      this.error = 'Rate name is required.';
      this.cdr.detectChanges();
      return;
    }

    if (this.formRatePerHour < 0) {
      this.error = 'Rate per hour must be non-negative.';
      this.cdr.detectChanges();
      return;
    }

    if (this.formEffectiveFrom && this.formEffectiveTo && this.formEffectiveFrom > this.formEffectiveTo) {
      this.error = 'Effective From cannot be after Effective To.';
      this.cdr.detectChanges();
      return;
    }

    const payloadBase = {
      code: this.formCode || 'LR-GENERAL',
      name: this.formName,
      rateType: 'PerHour',
      value: this.formRatePerHour,
      appliesTo: this.normalizeLaborAppliesTo(this.formWorkCenterScope),
      effectiveFrom: this.formEffectiveFrom || null,
      effectiveTo: this.formEffectiveTo || null,
    };

    if (this.editing) {
      const dto: UpdateOverheadRuleDto = {
        ...payloadBase,
        isActive: this.formIsActive,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to update labor rate';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateOverheadRuleDto = payloadBase;
      this.svc.create(dto).subscribe({
        next: (res: any) => {
          this.justCreated = res?.data ?? null;
          this.showForm = false;
          this.load();
        },
        error: () => {
          this.error = 'Failed to create labor rate';
          this.cdr.detectChanges();
        },
      });
    }
  }

  delete(item: OverheadRuleDto) {
    if (confirm(`Delete labor rate "${item.name}"?`)) {
      this.svc.delete(item.id).subscribe({
        next: () => this.load(),
        error: () => {
          this.error = 'Failed to delete labor rate';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
