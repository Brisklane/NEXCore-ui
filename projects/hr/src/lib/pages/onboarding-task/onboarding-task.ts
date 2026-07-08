import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnboardingTaskService } from '../../services/onboarding-task.service';
import { DepartmentService } from '../../services/department.service';
import { JobTitleService } from '../../services/job-title.service';
import { OnboardingTaskDto, CreateOnboardingTaskDto, UpdateOnboardingTaskDto } from '../../models/onboarding-task.model';
import { HrLookupItemDto } from '../../models/hr-lookup-item.model';

@Component({
  selector: 'lib-onboarding-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding-task.html',
  styleUrl: './onboarding-task.css',
})
export class OnboardingTaskComponent implements OnInit {
  tasks: OnboardingTaskDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingTask: OnboardingTaskDto | null = null;

  formTemplateCode = '';
  formTaskName = '';
  formTaskCategory = '';
  formDescription = '';
  formDefaultAssigneeRole = '';
  formDefaultDueDaysFromStart = 0;
  formIsRequired = false;
  formSortOrder = 0;
  formApplicableDepartmentId = '';
  formApplicableDesignationId = '';
  formApplicableEmploymentType = '';
  formEstimatedHours: number | null = null;
  formRequiresDocumentUpload = false;
  formRequiresManagerSignoff = false;
  formIsActive = true;

  readonly employmentTypeOptions = [
    { value: 'FullTime', label: 'Full-Time' },
    { value: 'PartTime', label: 'Part-Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Intern', label: 'Intern' },
  ];

  readonly categoryOptions = [
    { value: 'Documentation', label: 'Documentation' },
    { value: 'IT Setup', label: 'IT Setup' },
    { value: 'Training', label: 'Training' },
    { value: 'Orientation', label: 'Orientation' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Other', label: 'Other' },
  ];

  constructor(
    private service: OnboardingTaskService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobTitleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
    });
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.tasks = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load onboarding task templates'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingTask = null; this.resetForm(); this.showForm = true; }

  openEditForm(t: OnboardingTaskDto) {
    this.editingTask = t;
    this.formTemplateCode = t.templateCode ?? '';
    this.formTaskName = t.taskName ?? '';
    this.formTaskCategory = t.taskCategory ?? '';
    this.formDescription = t.description ?? '';
    this.formDefaultAssigneeRole = t.defaultAssigneeRole ?? '';
    this.formDefaultDueDaysFromStart = t.defaultDueDaysFromStart;
    this.formIsRequired = t.isRequired;
    this.formSortOrder = t.sortOrder;
    this.formApplicableDepartmentId = t.applicableDepartmentId ?? '';
    this.formApplicableDesignationId = t.applicableDesignationId ?? '';
    this.formApplicableEmploymentType = t.applicableEmploymentType ?? '';
    this.formEstimatedHours = t.estimatedHours ?? null;
    this.formRequiresDocumentUpload = t.requiresDocumentUpload;
    this.formRequiresManagerSignoff = t.requiresManagerSignoff;
    this.formIsActive = t.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formTemplateCode = '';
    this.formTaskName = '';
    this.formTaskCategory = '';
    this.formDescription = '';
    this.formDefaultAssigneeRole = '';
    this.formDefaultDueDaysFromStart = 0;
    this.formIsRequired = false;
    this.formSortOrder = 0;
    this.formApplicableDepartmentId = '';
    this.formApplicableDesignationId = '';
    this.formApplicableEmploymentType = '';
    this.formEstimatedHours = null;
    this.formRequiresDocumentUpload = false;
    this.formRequiresManagerSignoff = false;
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingTask = null; this.resetForm(); }

  getDepartmentName(id?: string): string {
    return this.departments.find(d => d.id === id)?.name ?? id ?? '—';
  }

  getDesignationName(id?: string): string {
    return this.designations.find(d => d.id === id)?.name ?? id ?? '—';
  }

  saveTask() {
    if (this.editingTask) {
      const dto: UpdateOnboardingTaskDto = {
        taskName: this.formTaskName || undefined,
        taskCategory: this.formTaskCategory || undefined,
        description: this.formDescription || undefined,
        defaultAssigneeRole: this.formDefaultAssigneeRole || undefined,
        defaultDueDaysFromStart: this.formDefaultDueDaysFromStart,
        isRequired: this.formIsRequired,
        sortOrder: this.formSortOrder,
        estimatedHours: this.formEstimatedHours ?? undefined,
        requiresDocumentUpload: this.formRequiresDocumentUpload,
        requiresManagerSignoff: this.formRequiresManagerSignoff,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingTask.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to update task template'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateOnboardingTaskDto = {
        templateCode: this.formTemplateCode || undefined,
        taskName: this.formTaskName || undefined,
        taskCategory: this.formTaskCategory || undefined,
        description: this.formDescription || undefined,
        defaultAssigneeRole: this.formDefaultAssigneeRole || undefined,
        defaultDueDaysFromStart: this.formDefaultDueDaysFromStart,
        isRequired: this.formIsRequired,
        sortOrder: this.formSortOrder,
        applicableDepartmentId: this.formApplicableDepartmentId || undefined,
        applicableDesignationId: this.formApplicableDesignationId || undefined,
        applicableEmploymentType: this.formApplicableEmploymentType || undefined,
        estimatedHours: this.formEstimatedHours ?? undefined,
        requiresDocumentUpload: this.formRequiresDocumentUpload,
        requiresManagerSignoff: this.formRequiresManagerSignoff,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadTasks(); },
        error: () => { this.error = 'Failed to create task template'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteTask(t: OnboardingTaskDto) {
    if (confirm(`Delete onboarding task template "${t.taskName}"?`)) {
      this.service.delete(t.id).subscribe({
        next: () => this.loadTasks(),
        error: () => { this.error = 'Failed to delete task template'; this.cdr.detectChanges(); },
      });
    }
  }
}

