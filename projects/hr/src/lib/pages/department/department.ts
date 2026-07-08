import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto } from '../../models/department.model';

@Component({
  selector: 'lib-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department.html',
  styleUrl: './department.css',
})
export class DepartmentComponent implements OnInit {
  departments: DepartmentDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingDepartment: DepartmentDto | null = null;

  formDepartmentName = '';
  formDepartmentCode = '';
  formParentDepartmentId = '';
  formDepartmentHeadEmployeeId = '';
  formIsActive = true;

  constructor(private service: DepartmentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadDepartments(); }

  loadDepartments() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load departments'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingDepartment = null; this.resetForm(); this.showForm = true; }

  openEditForm(d: DepartmentDto) {
    this.editingDepartment = d;
    this.formDepartmentName = d.departmentName ?? '';
    this.formDepartmentCode = d.departmentCode ?? '';
    this.formParentDepartmentId = d.parentDepartmentId ?? '';
    this.formDepartmentHeadEmployeeId = d.departmentHeadEmployeeId ?? '';
    this.formIsActive = d.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formDepartmentName = '';
    this.formDepartmentCode = '';
    this.formParentDepartmentId = '';
    this.formDepartmentHeadEmployeeId = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingDepartment = null; this.resetForm(); }

  saveDepartment() {
    if (!this.formDepartmentName.trim()) {
      this.error = 'Department Name is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingDepartment) {
      const dto: UpdateDepartmentDto = {
        departmentName: this.formDepartmentName,
        parentDepartmentId: this.formParentDepartmentId || undefined,
        departmentHeadEmployeeId: this.formDepartmentHeadEmployeeId || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingDepartment.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadDepartments(); },
        error: () => { this.error = 'Failed to update department'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDepartmentDto = {
        departmentCode: this.formDepartmentCode || undefined,
        departmentName: this.formDepartmentName,
        parentDepartmentId: this.formParentDepartmentId || undefined,
        departmentHeadEmployeeId: this.formDepartmentHeadEmployeeId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadDepartments(); },
        error: () => { this.error = 'Failed to create department'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDepartment(d: DepartmentDto) {
    if (confirm(`Delete department "${d.departmentName}"?`)) {
      this.service.delete(d.id).subscribe({
        next: () => this.loadDepartments(),
        error: () => { this.error = 'Failed to delete department'; this.cdr.detectChanges(); },
      });
    }
  }
}
