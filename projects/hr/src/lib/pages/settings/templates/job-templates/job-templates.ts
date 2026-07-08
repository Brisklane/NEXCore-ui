import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobTemplateService } from '../../../../services/job-template.service';
import { DepartmentService } from '../../../../services/department.service';
import { JobTitleService } from '../../../../services/job-title.service';
import { HrLookupItemDto } from '../../../../models/hr-lookup-item.model';
import { JobTemplateDto, CreateJobTemplateDto, UpdateJobTemplateDto } from '../../../../models/job-template.model';
import { EmploymentType } from '../../../../models/hr-enums';

@Component({
  selector: 'lib-job-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-templates.html',
  styleUrl: './job-templates.css',
})
export class JobTemplatesComponent implements OnInit {
  templates: JobTemplateDto[] = [];
  departments: HrLookupItemDto[] = [];
  designations: HrLookupItemDto[] = [];
  employmentTypes = Object.values(EmploymentType);
  loading = false;
  error = '';
  showForm = false;
  editingTemplate: JobTemplateDto | null = null;

  formTemplateCode = '';
  formTemplateName = '';
  formJobTitle = '';
  formDepartmentId = '';
  formDesignationId = '';
  formEmploymentType = '';
  formDescription = '';
  formIsActive = true;

  constructor(
    private service: JobTemplateService,
    private departmentService: DepartmentService,
    private jobTitleService: JobTitleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadTemplates();
  }

  loadLookups() {
    this.departmentService.getLookup().subscribe({
      next: (res) => { this.departments = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });

    this.jobTitleService.getLookup().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  loadTemplates() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.templates = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load job templates';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingTemplate = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(template: JobTemplateDto) {
    this.editingTemplate = template;
    this.formTemplateCode = template.templateCode;
    this.formTemplateName = template.templateName;
    this.formJobTitle = template.jobTitle;
    this.formDepartmentId = template.departmentId ?? '';
    this.formDesignationId = template.designationId ?? '';
    this.formEmploymentType = template.employmentType ?? '';
    this.formDescription = template.description ?? '';
    this.formIsActive = template.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formTemplateCode = '';
    this.formTemplateName = '';
    this.formJobTitle = '';
    this.formDepartmentId = '';
    this.formDesignationId = '';
    this.formEmploymentType = '';
    this.formDescription = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingTemplate = null;
    this.resetForm();
  }

  saveTemplate() {
    if (!this.formTemplateCode.trim() || !this.formTemplateName.trim() || !this.formJobTitle.trim()) {
      this.error = 'Template Code, Template Name and Job Title are required';
      this.cdr.detectChanges();
      return;
    }

    this.error = '';

    if (this.editingTemplate) {
      const dto: UpdateJobTemplateDto = {
        templateName: this.formTemplateName,
        jobTitle: this.formJobTitle,
        departmentId: this.formDepartmentId || undefined,
        designationId: this.formDesignationId || undefined,
        employmentType: this.formEmploymentType || undefined,
        description: this.formDescription || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingTemplate.id, dto).subscribe({
        next: () => {
          this.showForm = false;
          this.loadTemplates();
        },
        error: () => {
          this.error = 'Failed to update job template';
          this.cdr.detectChanges();
        },
      });
    } else {
      const dto: CreateJobTemplateDto = {
        templateCode: this.formTemplateCode,
        templateName: this.formTemplateName,
        jobTitle: this.formJobTitle,
        departmentId: this.formDepartmentId || undefined,
        designationId: this.formDesignationId || undefined,
        employmentType: this.formEmploymentType || undefined,
        description: this.formDescription || undefined,
        isActive: this.formIsActive,
      };
      this.service.create(dto).subscribe({
        next: () => {
          this.showForm = false;
          this.loadTemplates();
        },
        error: () => {
          this.error = 'Failed to create job template';
          this.cdr.detectChanges();
        },
      });
    }
  }

  deleteTemplate(template: JobTemplateDto) {
    if (!confirm(`Delete job template "${template.templateName}"?`)) {
      return;
    }
    this.service.delete(template.id).subscribe({
      next: () => this.loadTemplates(),
      error: () => { this.error = 'Failed to delete job template'; this.cdr.detectChanges(); },
    });
  }

  getDepartmentName(id?: string): string {
    if (!id) return '—';
    return this.departments.find(d => d.id === id)?.name ?? id;
  }

  getDesignationName(id?: string): string {
    if (!id) return '—';
    return this.designations.find(d => d.id === id)?.name ?? id;
  }
}
