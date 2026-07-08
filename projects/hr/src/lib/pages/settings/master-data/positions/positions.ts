import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PositionService } from '../../../../services/position.service';
import { DepartmentService } from '../../../../services/department.service';
import { JobTitleService } from '../../../../services/job-title.service';
import { PositionDto, CreatePositionDto, UpdatePositionDto } from '../../../../models/position.model';
import { HrLookupItemDto } from '../../../../models/hr-lookup-item.model';

@Component({
  selector: 'lib-settings-positions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './positions.html',
  styleUrl: '../../../shared-styles.css',
})
export class SettingsPositionsComponent implements OnInit {
  positions: PositionDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];

  loading = false;
  error = '';
  saving = false;
  saveError = '';

  showForm = false;
  editingPosition: PositionDto | null = null;

  formCode = '';
  formName = '';
  formDepartmentId = '';
  formDesignationId = '';
  formIsVacant = true;
  formIsActive = true;

  constructor(
    private service: PositionService,
    private deptService: DepartmentService,
    private titleService: JobTitleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPositions();
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.deptService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.titleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  loadPositions() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.positions = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load positions.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  getDeptName(id: string): string {
    return this.departments.find(d => d.id === id)?.name ?? id;
  }

  getDesignationName(id: string): string {
    return this.designations.find(d => d.id === id)?.name ?? id;
  }

  openCreateForm() { this.editingPosition = null; this.resetForm(); this.showForm = true; this.saveError = ''; }

  openEditForm(pos: PositionDto) {
    this.editingPosition = pos;
    this.formCode = pos.positionCode ?? '';
    this.formName = pos.positionName ?? '';
    this.formDepartmentId = pos.departmentId;
    this.formDesignationId = pos.designationId;
    this.formIsVacant = pos.isVacant;
    this.formIsActive = pos.isActive;
    this.showForm = true;
    this.saveError = '';
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formDepartmentId = '';
    this.formDesignationId = '';
    this.formIsVacant = true;
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingPosition = null; this.resetForm(); this.saveError = ''; }

  savePosition() {
    if (!this.formName.trim() || !this.formDepartmentId || !this.formDesignationId) {
      this.saveError = 'Position Name, Department, and Designation are required.';
      return;
    }
    this.saving = true;
    this.saveError = '';

    if (this.editingPosition) {
      const dto: UpdatePositionDto = {
        positionName: this.formName,
        departmentId: this.formDepartmentId,
        designationId: this.formDesignationId,
        isVacant: this.formIsVacant,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingPosition.id, dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadPositions(); },
        error: () => { this.saving = false; this.saveError = 'Failed to update position.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreatePositionDto = {
        positionCode: this.formCode || undefined,
        positionName: this.formName,
        departmentId: this.formDepartmentId,
        designationId: this.formDesignationId,
      };
      this.service.create(dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadPositions(); },
        error: () => { this.saving = false; this.saveError = 'Failed to create position.'; this.cdr.detectChanges(); },
      });
    }
  }

  deletePosition(pos: PositionDto) {
    if (!confirm(`Delete position "${pos.positionName}"?`)) return;
    this.service.delete(pos.id).subscribe({
      next: () => this.loadPositions(),
      error: () => { this.error = 'Failed to delete position.'; this.cdr.detectChanges(); },
    });
  }
}
