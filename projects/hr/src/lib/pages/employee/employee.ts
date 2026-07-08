import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { JobTitleService } from '../../services/job-title.service';
import { PositionService } from '../../services/position.service';
import { JobLocationService } from '../../services/job-location.service';
import { EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from '../../models/employee.model';
import { HrLookupItemDto } from '../../models/hr-lookup-item.model';
import { PositionDto } from '../../models/position.model';
import { JobLocationDto } from '../../models/job-location.model';

@Component({
  selector: 'lib-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class EmployeeComponent implements OnInit {
  employees: EmployeeDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  positions: PositionDto[] = [];
  jobLocations: JobLocationDto[] = [];
  reportingManagers: EmployeeDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingEmployee: EmployeeDto | null = null;

  formEmployeeCode = '';
  formFirstName = '';
  formLastName = '';
  formMiddleName = '';
  formEmail = '';
  formPhone = '';
  formDepartmentId = '';
  formDesignationId = '';
  formPositionId = '';
  formReportingManagerId = '';
  formJobLocationId = '';
  formStatus = 1;
  formJoinDate = '';
  formExitDate = '';
  formIsActive = true;

  readonly statusOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'On Leave' },
    { value: 3, label: 'Terminated' },
    { value: 4, label: 'Resigned' },
  ];

  constructor(
    private service: EmployeeService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private positionService: PositionService,
    private jobLocationService: JobLocationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobTitleService.getLookup().subscribe({
      next: (res) => {
        this.designations = res.data ?? [];
        this.cdr.detectChanges();
        this.loadReportingManagers();
      },
    });
    this.positionService.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.positions = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.cdr.detectChanges();
      },
    });
    this.jobLocationService.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.jobLocations = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.cdr.detectChanges();
      },
    });
  }

  loadReportingManagers() {
    // Load employees for designations matching executive/senior management roles
    const managementKeywords = ['manager', 'director', 'head', 'chief', 'executive', 'president', 'vp', 'vice', 'lead', 'senior'];
    const managerDesignations = this.designations.filter(d =>
      managementKeywords.some(kw => d.name?.toLowerCase().includes(kw))
    );

    if (managerDesignations.length === 0) {
      // Fallback: load all employees if no management designations found
      this.service.getAll().subscribe({
        next: (res) => {
          const raw = res as any;
          this.reportingManagers = Array.isArray(raw) ? raw : (raw.data ?? []);
          this.cdr.detectChanges();
        },
      });
      return;
    }

    forkJoin(
      managerDesignations.map(d => this.service.getByDesignation(d.id))
    ).subscribe({
      next: (results) => {
        const all: EmployeeDto[] = [];
        for (const res of results) {
          const raw = res as any;
          const items: EmployeeDto[] = Array.isArray(raw) ? raw : (raw.data ?? []);
          all.push(...items);
        }
        // Deduplicate by id
        const seen = new Set<string>();
        this.reportingManagers = all.filter(e => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
        this.cdr.detectChanges();
      },
    });
  }

  loadEmployees() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.employees = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load employees'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingEmployee = null; this.resetForm(); this.showForm = true; }

  openEditForm(e: EmployeeDto) {
    this.editingEmployee = e;
    this.formEmployeeCode = e.employeeCode ?? '';
    this.formFirstName = e.firstName ?? '';
    this.formLastName = e.lastName ?? '';
    this.formMiddleName = e.middleName ?? '';
    this.formEmail = e.email ?? '';
    this.formPhone = e.phone ?? '';
    this.formDepartmentId = e.departmentId ?? '';
    this.formDesignationId = e.designationId ?? '';
    this.formPositionId = e.positionId ?? '';
    this.formReportingManagerId = e.reportingManagerId ?? '';
    this.formJobLocationId = e.jobLocationId ?? '';
    this.formStatus = e.status ?? 1;
    this.formJoinDate = e.joinDate ?? '';
    this.formExitDate = e.exitDate ?? '';
    this.formIsActive = e.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formEmployeeCode = '';
    this.formFirstName = '';
    this.formLastName = '';
    this.formMiddleName = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formDepartmentId = '';
    this.formDesignationId = '';
    this.formPositionId = '';
    this.formReportingManagerId = '';
    this.formJobLocationId = '';
    this.formStatus = 1;
    this.formJoinDate = '';
    this.formExitDate = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingEmployee = null; this.resetForm(); }

  getStatusLabel(status?: number): string {
    return this.statusOptions.find(s => s.value === status)?.label ?? 'Unknown';
  }

  getDepartmentName(id?: string): string {
    return this.departments.find(d => d.id === id)?.name ?? id ?? '-';
  }

  getDesignationName(id?: string): string {
    return this.designations.find(d => d.id === id)?.name ?? id ?? '-';
  }

  getPositionName(id?: string): string {
    return this.positions.find(p => p.id === id)?.positionName ?? id ?? '-';
  }

  getJobLocationName(id?: string): string {
    return this.jobLocations.find(l => l.id === id)?.locationName ?? id ?? '-';
  }

  getManagerName(id?: string): string {
    const m = this.reportingManagers.find(e => e.id === id);
    if (m) return `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim();
    return id ?? '-';
  }

  saveEmployee() {
    if (this.editingEmployee) {
      const dto: UpdateEmployeeDto = {
        firstName: this.formFirstName || undefined,
        lastName: this.formLastName || undefined,
        middleName: this.formMiddleName || undefined,
        email: this.formEmail || undefined,
        phone: this.formPhone || undefined,
        departmentId: this.formDepartmentId || undefined,
        designationId: this.formDesignationId || undefined,
        positionId: this.formPositionId || undefined,
        reportingManagerId: this.formReportingManagerId || undefined,
        jobLocationId: this.formJobLocationId || undefined,
        status: this.formStatus,
        joinDate: this.formJoinDate || undefined,
        exitDate: this.formExitDate || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingEmployee.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadEmployees(); },
        error: () => { this.error = 'Failed to update employee'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateEmployeeDto = {
        employeeCode: this.formEmployeeCode || undefined,
        firstName: this.formFirstName || undefined,
        lastName: this.formLastName || undefined,
        middleName: this.formMiddleName || undefined,
        email: this.formEmail || undefined,
        phone: this.formPhone || undefined,
        departmentId: this.formDepartmentId || undefined,
        designationId: this.formDesignationId || undefined,
        positionId: this.formPositionId || undefined,
        reportingManagerId: this.formReportingManagerId || undefined,
        jobLocationId: this.formJobLocationId || undefined,
        status: this.formStatus,
        joinDate: this.formJoinDate || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadEmployees(); },
        error: () => { this.error = 'Failed to create employee'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteEmployee(e: EmployeeDto) {
    if (confirm(`Delete employee "${e.firstName} ${e.lastName}"?`)) {
      this.service.delete(e.id).subscribe({
        next: () => this.loadEmployees(),
        error: () => { this.error = 'Failed to delete employee'; this.cdr.detectChanges(); },
      });
    }
  }
}
