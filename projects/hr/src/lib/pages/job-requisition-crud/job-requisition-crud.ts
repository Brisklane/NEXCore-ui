import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobRequisitionService } from '../../services/job-requisition.service';
import { DepartmentService } from '../../services/department.service';
import { JobTitleService } from '../../services/job-title.service';
import { CurrencyService } from '../../services/currency.service';
import { LookupService } from '../../services/lookup.service';
import { JobRequisitionDto, CreateJobRequisitionDto, UpdateJobRequisitionDto } from '../../models/job-requisition.model';
import { HrLookupItemDto } from '../../models/hr-lookup-item.model';
import { LookupValueDto } from '../../models/lookup.model';
import { JobRecordType, LookupTypeCode } from '../../models/hr-enums';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDto } from '../../models/employee.model';

@Component({
  selector: 'lib-job-requisition-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-requisition-crud.html',
  styleUrl: './job-requisition-crud.css',
})
export class JobRequisitionCrudComponent implements OnInit {
  requisitions: JobRequisitionDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  currencies: HrLookupItemDto[] = [];
  employees: EmployeeDto[] = [];
  priorities: LookupValueDto[] = [];
  statuses: LookupValueDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingRequisition: JobRequisitionDto | null = null;

  formJobTitle = '';
  formDepartmentId = '';
  formDesignationId = '';
  formHeadcount = 1;
  formCurrencyId = '';
  formSalaryRangeMin: number | '' = '';
  formSalaryRangeMax: number | '' = '';
  formTargetStartDate = '';
  formRequestedByEmployeeId = '';
  formHiringManagerEmployeeId = '';
  formStatusLookupValueId = '';
  formPriorityLookupValueId = '';

  constructor(
    private service: JobRequisitionService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private currencyService: CurrencyService,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadRequisitions();
  }

  loadLookups() {
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.jobTitleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.currencyService.getLookup().subscribe({
      next: (res) => { this.currencies = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.employeeService.getAll().subscribe({
      next: (res) => { const raw = res as any; this.employees = Array.isArray(raw) ? raw : (raw.data ?? []); this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.Priority).subscribe({
      next: (values) => { this.priorities = values; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.JobStatus).subscribe({
      next: (values) => { this.statuses = values; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  getDepartmentName(id: string): string {
    return this.departments.find(d => d.id === id)?.name ?? id;
  }

  getDesignationName(id: string): string {
    return this.designations.find(d => d.id === id)?.name ?? id;
  }

  getCurrencyName(id?: string): string {
    if (!id) return '—';
    return this.currencies.find(c => c.id === id)?.name ?? id;
  }

  getEmployeeName(id?: string): string {
    if (!id) return '—';
    const e = this.employees.find(emp => emp.id === id);
    return e ? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() : id;
  }

  loadRequisitions() {
    this.loading = true;
    this.error = '';
    this.service.getAll(JobRecordType.Requisition).subscribe({
      next: (res) => { this.requisitions = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load job requisitions'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingRequisition = null; this.resetForm(); this.showForm = true; }

  openEditForm(r: JobRequisitionDto) {
    this.editingRequisition = r;
    this.formJobTitle = r.jobTitle ?? '';
    this.formDepartmentId = r.departmentId;
    this.formDesignationId = r.designationId;
    this.formHeadcount = r.headcount;
    this.formCurrencyId = r.currencyId ?? '';
    this.formSalaryRangeMin = r.salaryRangeMin ?? '';
    this.formSalaryRangeMax = r.salaryRangeMax ?? '';
    this.formTargetStartDate = r.targetStartDate ? r.targetStartDate.substring(0, 10) : '';
    this.formRequestedByEmployeeId = r.requestedByEmployeeId ?? '';
    this.formHiringManagerEmployeeId = r.hiringManagerEmployeeId ?? '';
    this.formStatusLookupValueId = r.statusLookupValueId ?? '';
    this.formPriorityLookupValueId = r.priorityLookupValueId ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formJobTitle = '';
    this.formDepartmentId = '';
    this.formDesignationId = '';
    this.formHeadcount = 1;
    this.formCurrencyId = '';
    this.formSalaryRangeMin = '';
    this.formSalaryRangeMax = '';
    this.formTargetStartDate = '';
    this.formRequestedByEmployeeId = '';
    this.formHiringManagerEmployeeId = '';
    this.formStatusLookupValueId = '';
    this.formPriorityLookupValueId = '';
  }

  cancelForm() { this.showForm = false; this.editingRequisition = null; this.resetForm(); }

  saveRequisition() {
    if (!this.formJobTitle || !this.formDepartmentId || !this.formDesignationId || !this.formCurrencyId) {
      this.error = 'Job Title, Department, Designation and Currency are required';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editingRequisition && !this.formRequestedByEmployeeId) {
      this.error = 'RequestedByEmployeeId is required when creating a Job Requisition.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingRequisition) {
      const dto: UpdateJobRequisitionDto = {
        jobTitle: this.formJobTitle,
        headcount: this.formHeadcount,
        currencyId: this.formCurrencyId,
        salaryRangeMin: this.formSalaryRangeMin !== '' ? Number(this.formSalaryRangeMin) : undefined,
        salaryRangeMax: this.formSalaryRangeMax !== '' ? Number(this.formSalaryRangeMax) : undefined,
        targetStartDate: this.formTargetStartDate || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        hiringManagerEmployeeId: this.formHiringManagerEmployeeId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
      };
      this.service.update(this.editingRequisition.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadRequisitions(); },
        error: () => { this.error = 'Failed to update requisition'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobRequisitionDto = {
        jobTitle: this.formJobTitle,
        departmentId: this.formDepartmentId,
        designationId: this.formDesignationId,
        headcount: this.formHeadcount,
        currencyId: this.formCurrencyId,
        salaryRangeMin: this.formSalaryRangeMin !== '' ? Number(this.formSalaryRangeMin) : undefined,
        salaryRangeMax: this.formSalaryRangeMax !== '' ? Number(this.formSalaryRangeMax) : undefined,
        targetStartDate: this.formTargetStartDate || undefined,
        recordType: JobRecordType.Requisition,
        requestedByEmployeeId: this.formRequestedByEmployeeId,
        hiringManagerEmployeeId: this.formHiringManagerEmployeeId || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadRequisitions(); },
        error: () => { this.error = 'Failed to create requisition'; this.cdr.detectChanges(); },
      });
    }
  }

  approve(r: JobRequisitionDto) {
    this.service.approve(r.id).subscribe({
      next: () => this.loadRequisitions(),
      error: () => { this.error = 'Failed to approve requisition'; this.cdr.detectChanges(); },
    });
  }

  reject(r: JobRequisitionDto) {
    this.service.reject(r.id).subscribe({
      next: () => this.loadRequisitions(),
      error: () => { this.error = 'Failed to reject requisition'; this.cdr.detectChanges(); },
    });
  }

  deleteRequisition(r: JobRequisitionDto) {
    if (confirm(`Delete job requisition "${r.jobTitle}"?`)) {
      this.service.delete(r.id).subscribe({
        next: () => this.loadRequisitions(),
        error: () => { this.error = 'Failed to delete requisition'; this.cdr.detectChanges(); },
      });
    }
  }
}
