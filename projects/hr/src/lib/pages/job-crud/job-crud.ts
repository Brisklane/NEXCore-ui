import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobRequisitionService } from '../../services/job-requisition.service';
import { DepartmentService } from '../../services/department.service';
import { JobTitleService } from '../../services/job-title.service';
import { CurrencyService } from '../../services/currency.service';
import { JobRequisitionDto, CreateJobRequisitionDto, UpdateJobRequisitionDto } from '../../models/job-requisition.model';
import { HrLookupItemDto } from '../../models/hr-lookup-item.model';
import { JobRecordType } from '../../models/hr-enums';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDto } from '../../models/employee.model';

@Component({
  selector: 'lib-job-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-crud.html',
  styleUrl: './job-crud.css',
})
export class JobCrudComponent implements OnInit {
  jobs: JobRequisitionDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  currencies: HrLookupItemDto[] = [];
  employees: EmployeeDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingJob: JobRequisitionDto | null = null;
  readonly recordType = JobRecordType.Job;

  formJobTitle = '';
  formDepartmentId = '';
  formDesignationId = '';
  formHeadcount = 1;
  formCurrencyId = '';
  formSalaryRangeMin: number | '' = '';
  formSalaryRangeMax: number | '' = '';
  formTargetStartDate = '';
  formRequestedByEmployeeId = '';

  constructor(
    private service: JobRequisitionService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private currencyService: CurrencyService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadJobs();
  }

  loadLookups() {
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* lookup failure is non-fatal */ },
    });
    this.jobTitleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* lookup failure is non-fatal */ },
    });
    this.currencyService.getLookup().subscribe({
      next: (res) => { this.currencies = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* lookup failure is non-fatal */ },
    });
    this.employeeService.getAll().subscribe({
      next: (res) => { const raw = res as any; this.employees = Array.isArray(raw) ? raw : (raw.data ?? []); this.cdr.detectChanges(); },
      error: () => { /* lookup failure is non-fatal */ },
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

  loadJobs() {
    this.loading = true;
    this.error = '';
    this.service.getAll(JobRecordType.Job).subscribe({
      next: (res) => { this.jobs = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load jobs'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingJob = null; this.resetForm(); this.showForm = true; }

  openEditForm(job: JobRequisitionDto) {
    this.editingJob = job;
    this.formJobTitle = job.jobTitle ?? '';
    this.formDepartmentId = job.departmentId;
    this.formDesignationId = job.designationId;
    this.formHeadcount = job.headcount;
    this.formCurrencyId = job.currencyId ?? '';
    this.formSalaryRangeMin = job.salaryRangeMin ?? '';
    this.formSalaryRangeMax = job.salaryRangeMax ?? '';
    this.formTargetStartDate = job.targetStartDate ? job.targetStartDate.substring(0, 10) : '';
    this.formRequestedByEmployeeId = job.requestedByEmployeeId ?? '';
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
  }

  cancelForm() { this.showForm = false; this.editingJob = null; this.resetForm(); }

  saveJob() {
    if (!this.formJobTitle || !this.formDepartmentId || !this.formDesignationId || !this.formCurrencyId) {
      this.error = 'Job Title, Department, Designation and Currency are required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingJob) {
      const dto: UpdateJobRequisitionDto = {
        jobTitle: this.formJobTitle,
        headcount: this.formHeadcount,
        currencyId: this.formCurrencyId,
        salaryRangeMin: this.formSalaryRangeMin !== '' ? Number(this.formSalaryRangeMin) : undefined,
        salaryRangeMax: this.formSalaryRangeMax !== '' ? Number(this.formSalaryRangeMax) : undefined,
        targetStartDate: this.formTargetStartDate || undefined,
      };
      this.service.update(this.editingJob.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadJobs(); },
        error: () => { this.error = 'Failed to update job'; this.cdr.detectChanges(); },
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
        recordType: this.recordType,
        requestedByEmployeeId: this.formRequestedByEmployeeId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadJobs(); },
        error: () => { this.error = 'Failed to create job'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteJob(job: JobRequisitionDto) {
    if (confirm(`Delete job "${job.jobTitle}"?`)) {
      this.service.delete(job.id).subscribe({
        next: () => this.loadJobs(),
        error: () => { this.error = 'Failed to delete job'; this.cdr.detectChanges(); },
      });
    }
  }
}
