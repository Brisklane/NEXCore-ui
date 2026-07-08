import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateTaskService } from '../../../services/candidate-task.service';
import { ApplicationService } from '../../../services/application.service';
import { CandidateService } from '../../../services/candidate.service';
import { EmployeeService } from '../../../services/employee.service';
import { JobRequisitionService } from '../../../services/job-requisition.service';
import { LookupService } from '../../../services/lookup.service';
import { ApiResponse } from '../../../models/api-response.model';
import {
  CandidateTaskDto,
  CreateCandidateTaskDto,
  UpdateCandidateTaskDto,
} from '../../../models/candidate-task.model';
import { ApplicationDto } from '../../../models/application.model';
import { CandidateDto } from '../../../models/candidate.model';
import { EmployeeDto } from '../../../models/employee.model';
import { JobRequisitionDto } from '../../../models/job-requisition.model';
import { LookupValueDto } from '../../../models/lookup.model';

@Component({
  selector: 'lib-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'],
})
export class Tasks implements OnInit {
  tasks: CandidateTaskDto[] = [];
  applications: ApplicationDto[] = [];
  candidates: CandidateDto[] = [];
  employees: EmployeeDto[] = [];
  jobs: JobRequisitionDto[] = [];
  taskStatusValues: LookupValueDto[] = [];
  taskPriorityValues: LookupValueDto[] = [];

  loading = false;
  error = '';
  showForm = false;
  editingTask: CandidateTaskDto | null = null;

  formCandidateId = '';
  formApplicationId = '';
  formJobId = '';
  formTitle = '';
  formDescription = '';
  formDueDate = '';
  formPriority = '';
  formStatus = '';
  formAssignedEmployeeId = '';

  constructor(
    private service: CandidateTaskService,
    private applicationService: ApplicationService,
    private candidateService: CandidateService,
    private employeeService: EmployeeService,
    private jobService: JobRequisitionService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.applicationService.getAll().subscribe({
      next: (res) => { this.applications = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.candidateService.getAll().subscribe({
      next: (res) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.employeeService.getAll().subscribe({
      next: (res) => { this.employees = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobService.getAll().subscribe({
      next: (res) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.lookupService.getValuesByTypeCode('TASK_STATUS').subscribe({
      next: (values) => { this.taskStatusValues = values; this.cdr.detectChanges(); },
    });
    this.lookupService.getValuesByTypeCode('PRIORITY').subscribe({
      next: (values) => { this.taskPriorityValues = values; this.cdr.detectChanges(); },
    });
  }

  getApplicationLabel(id?: string): string {
    if (!id) return '—';
    const app = this.applications.find(a => a.id === id);
    return app ? (app.applicationCode ?? app.id) : id;
  }

  getCandidateLabel(id?: string): string {
    if (!id) return '—';
    const c = this.candidates.find(c => c.id === id);
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || (c.candidateCode ?? id) : id;
  }

  getEmployeeLabel(id?: string): string {
    if (!id) return '—';
    const e = this.employees.find(e => e.id === id);
    return e ? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || (e.employeeCode ?? id) : id;
  }

  getJobLabel(id?: string): string {
    if (!id) return '—';
    const j = this.jobs.find(j => j.id === id);
    return j ? (j.jobTitle ?? j.jobCode ?? id) : id;
  }

  getStatusLabel(id?: string): string {
    if (!id) return '—';
    const v = this.taskStatusValues.find(v => v.id === id);
    return v ? (v.name ?? v.code ?? id) : id;
  }

  getPriorityLabel(id?: string): string {
    if (!id) return '—';
    const v = this.taskPriorityValues.find(v => v.id === id);
    return v ? (v.name ?? v.code ?? id) : id;
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (response: ApiResponse<CandidateTaskDto[]>) => {
        this.tasks = response.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load candidate tasks.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingTask = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(task: CandidateTaskDto) {
    this.editingTask = task;
    this.formCandidateId = this.candidates.some(c => c.id === task.candidateId) ? (task.candidateId ?? '') : '';
    this.formApplicationId = this.applications.some(a => a.id === task.applicationId) ? (task.applicationId ?? '') : '';
    this.formJobId = this.jobs.some(j => j.id === task.jobId) ? (task.jobId ?? '') : '';
    this.formTitle = task.taskCode ?? '';
    this.formDescription = task.description ?? '';
    this.formDueDate = task.dueDate ?? '';
    this.formPriority = task.taskTypeLookupValueId ?? '';
    this.formStatus = task.statusLookupValueId ?? '';
    this.formAssignedEmployeeId = this.employees.some(e => e.id === task.assignedByEmployeeId) ? (task.assignedByEmployeeId ?? '') : '';
    this.showForm = true;
  }

  resetForm() {
    this.formCandidateId = '';
    this.formApplicationId = '';
    this.formJobId = '';
    this.formTitle = '';
    this.formDescription = '';
    this.formDueDate = '';
    this.formPriority = '';
    this.formStatus = '';
    this.formAssignedEmployeeId = '';
  }

  cancelForm() {
    this.showForm = false;
    this.editingTask = null;
    this.resetForm();
  }

  saveTask() {
    const resolvedCandidateId = this.candidates.some(c => c.id === this.formCandidateId) ? this.formCandidateId : undefined;
    const resolvedApplicationId = this.applications.some(a => a.id === this.formApplicationId) ? this.formApplicationId : undefined;
    const resolvedJobId = this.jobs.some(j => j.id === this.formJobId) ? this.formJobId : undefined;
    const resolvedEmployeeId = this.employees.some(e => e.id === this.formAssignedEmployeeId) ? this.formAssignedEmployeeId : undefined;

    const dto = this.editingTask
      ? {
          candidateId: resolvedCandidateId,
          applicationId: resolvedApplicationId,
          jobId: resolvedJobId,
          taskCode: this.formTitle.trim() || undefined,
          description: this.formDescription.trim() || undefined,
          dueDate: this.formDueDate || undefined,
          taskTypeLookupValueId: this.formPriority || undefined,
          statusLookupValueId: this.formStatus || undefined,
          assignedByEmployeeId: resolvedEmployeeId,
        } as UpdateCandidateTaskDto
      : {
          candidateId: resolvedCandidateId,
          applicationId: resolvedApplicationId,
          jobId: resolvedJobId,
          taskCode: this.formTitle.trim() || undefined,
          description: this.formDescription.trim() || undefined,
          dueDate: this.formDueDate || undefined,
          taskTypeLookupValueId: this.formPriority || undefined,
          statusLookupValueId: this.formStatus || undefined,
          assignedByEmployeeId: resolvedEmployeeId,
        } as CreateCandidateTaskDto;

    if (this.editingTask) {
      this.service.update(this.editingTask.id, dto).subscribe({
        next: () => { this.cancelForm(); this.loadTasks(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to update task.'; this.cdr.detectChanges(); },
      });
    } else {
      this.service.create(dto).subscribe({
        next: () => { this.cancelForm(); this.loadTasks(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to create task.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteTask(task: CandidateTaskDto) {
    if (!confirm(`Delete task "${task.taskCode ?? 'Untitled'}"?`)) return;
    this.service.delete(task.id).subscribe({
      next: () => this.loadTasks(),
      error: () => { this.error = 'Failed to delete task.'; this.cdr.detectChanges(); },
    });
  }
}
