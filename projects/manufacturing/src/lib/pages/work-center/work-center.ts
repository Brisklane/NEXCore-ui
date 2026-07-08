import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkCenterDto, CreateWorkCenterDto, UpdateWorkCenterDto } from '../../models/work-center.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-work-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-center.html',
  styleUrl: './work-center.css',
})
export class WorkCenter implements OnInit {
  items: WorkCenterDto[] = [];
  highlighter = new RowHighlighter();
  private justCreated: any = null;
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  loading = false;
  error = '';
  showForm = false;
  editing: WorkCenterDto | null = null;
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  pageSizeOptions = [10, 25, 50, 100];

  formName = '';
  formCode = '';
  formDescription = '';
  formCapacityPerHour = 0;
  formHourlyMachineCost = 0;
  formIsActive = true;

  constructor(private svc: WorkCenterService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  get displayRows(): any[] {
    let rows: any[] = [...this.items];
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

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll({ pageNumber: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.items = r.data ?? [];
        this.totalCount = r.pagination?.totalCount ?? r.totalCount ?? 0;
        this.page = r.pagination?.pageNumber ?? r.pageNumber ?? r.page ?? this.page;
        this.totalPages = r.pagination?.totalPages ?? r.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.applyJustCreated();
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load work centers'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  goToPage(page: number) { this.page = page; this.load(); }
  onPageSizeChange() { this.page = 1; this.load(); }

  openCreate() {
    this.editing = null;
    this.reset();
    this.formCode = 'WC-' + String(this.totalCount + 1).padStart(3, '0');
    this.showForm = true;
  }

  openEdit(item: WorkCenterDto) {
    this.editing = item;
    this.formName = item.name ?? '';
    this.formCode = item.code ?? '';
    this.formDescription = item.description ?? '';
    this.formCapacityPerHour = item.capacityPerHour ?? 0;
    this.formHourlyMachineCost = item.hourlyMachineCost ?? 0;
    this.formIsActive = item.isActive ?? true;
    this.showForm = true;
  }

  reset() { this.formName = ''; this.formCode = ''; this.formDescription = ''; this.formCapacityPerHour = 0; this.formHourlyMachineCost = 0; this.formIsActive = true; }
  cancel() { this.showForm = false; this.editing = null; this.reset(); }

  save() {
    if (this.editing) {
      const dto: UpdateWorkCenterDto = { name: this.formName, code: this.formCode, description: this.formDescription, capacityPerHour: this.formCapacityPerHour, hourlyMachineCost: this.formHourlyMachineCost, isActive: this.formIsActive };
      this.svc.update(this.editing.id, dto).subscribe({ next: () => { this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to update'; this.cdr.detectChanges(); } });
    } else {
      const dto: CreateWorkCenterDto = { name: this.formName, code: this.formCode, description: this.formDescription, capacityPerHour: this.formCapacityPerHour, hourlyMachineCost: this.formHourlyMachineCost };
      this.svc.create(dto).subscribe({ next: (res) => { this.justCreated = res.data ?? null; this.showForm = false; this.load(); }, error: () => { this.error = 'Failed to create'; this.cdr.detectChanges(); } });
    }
  }

  delete(item: WorkCenterDto) {
    if (confirm(`Delete work center "${item.name}"?`)) {
      this.svc.delete(item.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete'; this.cdr.detectChanges(); } });
    }
  }
}
