import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../../services/department.service';
import { DepartmentDto, CreateDepartmentDto, UpdateDepartmentDto } from '../../../../models/department.model';

@Component({
  selector: 'lib-settings-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class SettingsDepartmentsComponent implements OnInit {
  departments: DepartmentDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingDept: DepartmentDto | null = null;

  formDepartmentName = '';
  formDepartmentCode = '';
  formParentId = '';
  formManagerId = '';

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

  openCreateForm() { this.editingDept = null; this.resetForm(); this.showForm = true; }

  openEditForm(d: DepartmentDto) {
    this.editingDept = d;
    this.formDepartmentName = d.departmentName ?? '';
    this.formDepartmentCode = d.departmentCode ?? '';
    this.formParentId = d.parentDepartmentId ?? '';
    this.formManagerId = d.departmentHeadEmployeeId ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formDepartmentName = '';
    this.formDepartmentCode = '';
    this.formParentId = '';
    this.formManagerId = '';
  }

  cancelForm() { this.showForm = false; this.editingDept = null; this.resetForm(); }

  saveDepartment() {
    if (!this.formDepartmentName.trim()) {
      this.error = 'Department Name is required';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingDept) {
      const dto: UpdateDepartmentDto = {
        departmentName: this.formDepartmentName,
        parentDepartmentId: this.formParentId || undefined,
        departmentHeadEmployeeId: this.formManagerId || undefined,
      };
      this.service.update(this.editingDept.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadDepartments(); },
        error: () => { this.error = 'Failed to update department'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDepartmentDto = {
        departmentName: this.formDepartmentName,
        departmentCode: this.formDepartmentCode || undefined,
        parentDepartmentId: this.formParentId || undefined,
        departmentHeadEmployeeId: this.formManagerId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadDepartments(); },
        error: () => { this.error = 'Failed to create department'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDepartment(d: DepartmentDto) {
    if (confirm(`Delete department: ${d.departmentName}?`)) {
      this.service.delete(d.id).subscribe({
        next: () => this.loadDepartments(),
        error: () => { this.error = 'Failed to delete department'; this.cdr.detectChanges(); },
      });
    }
  }
}
