import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppFormPanelComponent, AppAlertComponent,
  AppInputComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, RowHighlighter,
} from '@nexcore/shared';
import { VendorCategoryService } from '../../services/master-data.service';
import { VendorCategoryDto, CreateVendorCategoryDto, UpdateVendorCategoryDto } from '../../models/master-data.model';
import { requiredText, suggestCode } from '../../models/procurement-constants';

@Component({
  selector: 'lib-vendor-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppFormPanelComponent, AppAlertComponent,
    AppInputComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './vendor-categories.html',
  styleUrl: './vendor-categories.css',
})
export class VendorCategories implements OnInit {
  categories: VendorCategoryDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';

  showForm = false;
  editing: VendorCategoryDto | null = null;
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: VendorCategoryDto | null = null;

  form = { code: '', name: '', description: '', isActive: true };
  codeManual = false;

  highlighter = new RowHighlighter();

  readonly columns: TableColumn[] = [
    { key: 'code', label: 'Code', width: '140px' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', format: (v) => v ?? '—' },
    { key: 'isActive', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => (v ? 'badge-active' : 'badge-inactive'), format: (v) => (v ? 'Active' : 'Inactive') },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  constructor(private service: VendorCategoryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.categories = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load categories'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form = { code: '', name: '', description: '', isActive: true };
    this.codeManual = false;
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(cat: VendorCategoryDto): void {
    this.editing = cat;
    this.form = { code: cat.code, name: cat.name, description: cat.description ?? '', isActive: cat.isActive };
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

  get filteredCategories(): VendorCategoryDto[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.categories;
    return this.categories.filter(c =>
      c.code.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.description ?? '').toLowerCase().includes(term));
  }

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
      const dto: UpdateVendorCategoryDto = {
        code: this.form.code.trim(),
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
        isActive: this.form.isActive,
      };
      this.service.update(this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Category updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateVendorCategoryDto = {
        code: this.form.code.trim(),
        name: this.form.name.trim(),
        description: this.form.description.trim() || undefined,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Category created'; this.showForm = false; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  onRowAction(e: RowActionEvent<VendorCategoryDto>): void {
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
