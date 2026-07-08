import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppFormPanelComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { ProcurementCategoryService } from '../../services/master-data.service';
import { ProcurementCategoryDto, CreateProcurementCategoryDto, UpdateProcurementCategoryDto } from '../../models/master-data.model';
import { requiredText, suggestCode } from '../../models/procurement-constants';

@Component({
  selector: 'lib-procurement-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppFormPanelComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './procurement-categories.html',
  styleUrl: './procurement-categories.css',
})
export class ProcurementCategories implements OnInit {
  categories: ProcurementCategoryDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';

  showForm = false;
  editing: ProcurementCategoryDto | null = null;
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: ProcurementCategoryDto | null = null;

  form = { code: '', name: '', description: '', parentCategoryId: '', isActive: true };
  codeManual = false;

  highlighter = new RowHighlighter();

  readonly columns: TableColumn[] = [
    { key: 'code', label: 'Code', width: '140px' },
    { key: 'name', label: 'Name' },
    { key: 'parentCategoryId', label: 'Parent', format: (v, row) => row.parentCategoryName ?? this.parentName(v) },
    { key: 'description', label: 'Description', format: (v) => v ?? '—' },
    { key: 'isActive', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => (v ? 'badge-active' : 'badge-inactive'), format: (v) => (v ? 'Active' : 'Inactive') },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  constructor(private service: ProcurementCategoryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.categories = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load categories'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  parentName(id?: string): string {
    if (!id) return '—';
    return this.categories.find(c => c.id === id)?.name ?? '—';
  }

  get filteredCategories(): ProcurementCategoryDto[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.categories;
    return this.categories.filter(c =>
      c.code.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.description ?? '').toLowerCase().includes(term) ||
      (c.parentCategoryName ?? this.parentName(c.parentCategoryId)).toLowerCase().includes(term));
  }

  /** Parent options for the form — excludes the category being edited (no self-parenting). */
  get parentOptions(): SelectOption[] {
    return this.categories
      .filter(c => !this.editing || c.id !== this.editing.id)
      .map(c => ({ value: c.id, label: `${c.code} — ${c.name}` }));
  }

  openCreate(): void {
    this.editing = null;
    this.form = { code: '', name: '', description: '', parentCategoryId: '', isActive: true };
    this.codeManual = false;
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(cat: ProcurementCategoryDto): void {
    this.editing = cat;
    this.form = {
      code: cat.code,
      name: cat.name,
      description: cat.description ?? '',
      parentCategoryId: cat.parentCategoryId ?? '',
      isActive: cat.isActive,
    };
    this.codeManual = true;
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  onNameChange(): void {
    if (!this.editing && !this.codeManual) {
      this.form.code = suggestCode(this.form.name, this.categories.map(c => c.code));
    }
  }

  cancel(): void { this.showForm = false; this.editing = null; }

  get errors() {
    return {
      code: requiredText(this.form.code, 'Code'),
      name: requiredText(this.form.name, 'Name'),
    };
  }
  get isValid(): boolean { return !this.errors.code && !this.errors.name; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';

    if (this.editing) {
      const dto: UpdateProcurementCategoryDto = {
        code: this.form.code.trim(),
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        parentCategoryId: this.form.parentCategoryId || undefined,
        isActive: this.form.isActive,
      };
      this.service.update(this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Category updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateProcurementCategoryDto = {
        code: this.form.code.trim(),
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        parentCategoryId: this.form.parentCategoryId || undefined,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Category created'; this.showForm = false; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  onRowAction(e: RowActionEvent<ProcurementCategoryDto>): void {
    if (e.eventName === 'edit') this.openEdit(e.row);
    if (e.eventName === 'delete') { this.deleteTarget = e.row; this.showDeleteConfirm = true; }
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Category deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
