import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DimensionDto, DimensionValueDto,
  CreateDimensionDto, UpdateDimensionDto,
  PaginationParams,
} from '../../models';
import { DimensionService } from '../../services/dimension.service';
import {
  AppPageHeaderComponent,
  AppFormPanelComponent,
  AppAlertComponent,
  AppInputComponent,
  AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent,
  RowHighlighter,
} from '@nexcore/shared';

@Component({
  selector: 'lib-dimension',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppFormPanelComponent, AppAlertComponent,
    AppInputComponent, AppDataTableComponent,
  ],
  templateUrl: './dimension.html',
  styleUrl: './dimension.css',
})
export class DimensionComponent implements OnInit {
  dimensions: DimensionDto[] = [];
  selectedDimension: DimensionDto | null = null;
  dimensionValues: DimensionValueDto[] = [];
  loading = false;
  loadingValues = false;
  error = '';
  successMsg = '';

  // Dimensions list pagination
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Dimension values pagination
  valuesPage = 1;
  valuesPageSize = 10;
  valuesTotalCount = 0;
  valuesTotalPages = 0;

  pageSizeOptions = [10, 25, 50, 100];

  filterSearch = '';
  private searchDebounce: any;

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  highlighter = new RowHighlighter();

  /* ── Table definitions ── */
  readonly dimColumns: TableColumn[] = [
    { key: 'code',        label: 'Code',        sortable: true },
    { key: 'name',        label: 'Name',        sortable: true },
    { key: 'isActive',    label: 'Active',      type: 'badge', sortable: true },
    { key: 'description', label: 'Description', format: (v) => v ?? '—' },
  ];

  readonly dimActions: TableAction[] = [
    { eventName: 'view',   label: 'View Values', icon: '📋', variant: 'default' },
    { eventName: 'edit',   label: 'Edit',        icon: '✏️',  variant: 'default' },
    { eventName: 'delete', label: 'Delete',      icon: '🗑️',  variant: 'danger'  },
  ];

  readonly valColumns: TableColumn[] = [
    { key: 'valueCode',   label: 'Value Code' },
    { key: 'valueName',   label: 'Value Name' },
    { key: 'isActive',    label: 'Active',      type: 'badge' },
    { key: 'description', label: 'Description', format: (v) => v ?? '—' },
  ];

  // Dimension form
  showDimForm = false;
  editingDim: DimensionDto | null = null;
  dimFormCode = '';
  dimFormName = '';
  dimFormIsActive = true;
  dimFormDescription = '';

  constructor(
    private svc: DimensionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDimensions();
  }

  loadDimensions(): void {
    this.loading = true;
    this.error = '';
    const pagination: PaginationParams = { pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.filterSearch || undefined, sortBy: this.sortBy, sortDirection: this.sortDirection };
    this.svc.getAll(pagination).subscribe({
      next: (res) => {
        this.dimensions = res.success ? (res.data ?? []) : [];
        this.totalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.page = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.page;
        this.totalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        if (!res.success) this.error = res.message ?? 'Failed to load dimensions';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Network error loading dimensions';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadDimensions();
  }

  onSearchInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.applyFilters(), 350);
  }

  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void {
    this.sortBy = e.sortBy;
    this.sortDirection = e.sortDirection;
    this.page = 1;
    this.loadDimensions();
  }

  goToPage(page: number): void {
    this.page = page;
    this.loadDimensions();
  }

  onPageSizeChange(size?: number): void {
    if (size) this.pageSize = size;
    this.page = 1;
    this.loadDimensions();
  }

  onDimAction(event: RowActionEvent<DimensionDto>): void {
    if (event.eventName === 'edit')   this.openEditDimForm(event.row);
    if (event.eventName === 'delete') this.deleteDimension(event.row);
    if (event.eventName === 'view')   this.viewValues(event.row);
  }

  // --- Dimension CRUD ---
  openCreateDimForm(): void {
    this.editingDim = null;
    this.dimFormCode = '';
    this.dimFormName = '';
    this.dimFormIsActive = true;
    this.dimFormDescription = '';
    this.showDimForm = true;
    this.successMsg = '';
  }

  openEditDimForm(dim: DimensionDto): void {
    this.editingDim = dim;
    this.dimFormCode = dim.code ?? '';
    this.dimFormName = dim.name ?? '';
    this.dimFormIsActive = dim.isActive;
    this.dimFormDescription = dim.description ?? '';
    this.showDimForm = true;
    this.successMsg = '';
  }

  cancelDimForm(): void {
    this.showDimForm = false;
    this.editingDim = null;
  }

  saveDimension(): void {
    if (this.editingDim) {
      const dto: UpdateDimensionDto = {
        name: this.dimFormName,
        isActive: this.dimFormIsActive,
        description: this.dimFormDescription || null,
      };
      this.svc.update(this.editingDim.id, dto).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Dimension updated successfully';
            this.showDimForm = false;
            this.editingDim = null;
            this.loadDimensions();
            if (this.selectedDimension?.id === res.data?.id) {
              this.selectedDimension = res.data!;
            }
          } else {
            this.error = res.message ?? 'Failed to update dimension';
          }
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Network error updating dimension'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDimensionDto = {
        code: this.dimFormCode,
        name: this.dimFormName,
        description: this.dimFormDescription || null,
      };
      this.svc.create(dto).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMsg = 'Dimension created successfully';
            this.showDimForm = false;
            this.loadDimensions();
            this.highlighter.flash(res.data?.id, this.cdr);
          } else {
            this.error = res.message ?? 'Failed to create dimension';
          }
          this.cdr.detectChanges();
        },
        error: () => { this.error = 'Network error creating dimension'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDimension(dim: DimensionDto): void {
    if (!confirm(`Delete dimension "${dim.name}"?`)) return;
    this.svc.delete(dim.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = 'Dimension deleted';
          if (this.selectedDimension?.id === dim.id) {
            this.selectedDimension = null;
            this.dimensionValues = [];
          }
          this.loadDimensions();
        } else {
          this.error = res.message ?? 'Failed to delete dimension';
        }
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Network error deleting dimension'; this.cdr.detectChanges(); },
    });
  }

  // --- View Values (read-only) ---
  viewValues(dim: DimensionDto): void {
    this.selectedDimension = dim;
    this.valuesPage = 1;
    this.loadValues();
  }

  loadValues(): void {
    if (!this.selectedDimension) return;
    this.loadingValues = true;
    this.dimensionValues = [];
    const pagination: PaginationParams = { pageNumber: this.valuesPage, pageSize: this.valuesPageSize };
    this.svc.getValues(this.selectedDimension.id, pagination).subscribe({
      next: (res) => {
        this.dimensionValues = res.success ? (res.data ?? []) : [];
        this.valuesTotalCount = res.pagination?.totalCount ?? res.totalCount ?? 0;
        this.valuesPage = res.pagination?.pageNumber ?? res.pageNumber ?? res.page ?? this.valuesPage;
        this.valuesTotalPages = res.pagination?.totalPages ?? res.totalPages ?? Math.ceil(this.valuesTotalCount / this.valuesPageSize);
        this.loadingValues = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingValues = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToValuesPage(page: number): void {
    this.valuesPage = page;
    this.loadValues();
  }

  onValuePageSizeChange(size?: number): void {
    if (size) this.valuesPageSize = size;
    this.valuesPage = 1;
    this.loadValues();
  }

  closeDetail(): void {
    this.selectedDimension = null;
    this.dimensionValues = [];
  }
}
