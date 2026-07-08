import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../../services/application.service';
import { CandidateService } from '../../../../services/candidate.service';
import { EmployeeService } from '../../../../services/employee.service';
import { JobPostingChannelService } from '../../../../services/job-posting-channel.service';
import { JobRequisitionService } from '../../../../services/job-requisition.service';
import { LookupService } from '../../../../services/lookup.service';
import { ApplicationDto, UpdateApplicationDto } from '../../../../models/application.model';
import { CandidateDto } from '../../../../models/candidate.model';
import { EmployeeDto } from '../../../../models/employee.model';
import { JobPostingChannelDto } from '../../../../models/job-posting-channel.model';
import { JobRequisitionDto } from '../../../../models/job-requisition.model';
import { LookupValueDto } from '../../../../models/lookup.model';
import { LookupTypeCode } from '../../../../models/hr-enums';
import { ApiResponse } from '../../../../models/api-response.model';

@Component({
  selector: 'lib-screening',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './screening.html',
  styleUrl: './screening.css',
})
export class Screening implements OnInit {
  applications: ApplicationDto[] = [];
  jobs: JobRequisitionDto[] = [];
  candidates: CandidateDto[] = [];
  jobPostingChannels: JobPostingChannelDto[] = [];
  employees: EmployeeDto[] = [];
  statusValues: LookupValueDto[] = [];
  priorityValues: LookupValueDto[] = [];
  stageValues: LookupValueDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingApplication: ApplicationDto | null = null;

  formJobId = '';
  formCandidateId = '';
  formJobPostingChannelId = '';
  formCurrentStageLookupValueId = '';
  formStatusLookupValueId = '';
  formPriorityLookupValueId = '';
  formAppliedDate = '';
  formAssignedRecruiterEmployeeId = '';

  constructor(
    private service: ApplicationService,
    private candidateService: CandidateService,
    private employeeService: EmployeeService,
    private jobPostingChannelService: JobPostingChannelService,
    private jobService: JobRequisitionService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadCandidates();
    this.loadJobs();
    this.loadEmployees();
    this.loadJobPostingChannels();
  }

  loadApplications() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res: ApiResponse<ApplicationDto[]>) => {
        this.applications = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load applications';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCandidates() {
    this.candidateService.getAll().subscribe({
      next: (res: ApiResponse<CandidateDto[]>) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadJobs() {
    this.jobService.getAll().subscribe({
      next: (res: ApiResponse<JobRequisitionDto[]>) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe({
      next: (res: ApiResponse<EmployeeDto[]>) => { this.employees = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadJobPostingChannels() {
    this.jobPostingChannelService.getAll().subscribe({
      next: (res: ApiResponse<JobPostingChannelDto[]>) => { this.jobPostingChannels = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadLookups() {
    this.lookupService.getValuesByTypeCode(LookupTypeCode.ApplicationStatus).subscribe({
      next: (values) => {
        this.statusValues = values;
        this.loadApplications();
        this.cdr.detectChanges();
      },
      error: () => { this.loadApplications(); },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.Priority).subscribe({
      next: (values) => { this.priorityValues = values; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.ApplicationStage).subscribe({
      next: (values) => { this.stageValues = values; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  getJobTitle(id: string): string {
    const job = this.jobs.find((j) => j.id === id);
    return job ? job.jobTitle || job.jobCode || id : id;
  }

  getCandidateName(id?: string): string {
    if (!id) return '—';
    const candidate = this.candidates.find((c) => c.id === id);
    if (!candidate) return id;
    const name = `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
    return name || candidate.email || id;
  }

  getEmployeeName(id?: string): string {
    if (!id) return '—';
    const employee = this.employees.find((e) => e.id === id);
    if (!employee) return id;
    const name = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
    return name || employee.email || id;
  }

  getJobPostingChannelName(id?: string): string {
    if (!id) return '—';
    const channel = this.jobPostingChannels.find((c) => c.id === id);
    return channel ? channel.channelNameSnapshot || channel.id : id;
  }

  getLookupValueName(values: LookupValueDto[], id?: string): string {
    if (!id) return '—';
    return values.find((value) => value.id === id)?.name ?? id;
  }

  openEditForm(app: ApplicationDto) {
    this.editingApplication = app;
    this.formJobId = app.jobId;
    this.formCandidateId = app.candidateId;
    this.formJobPostingChannelId = app.jobPostingChannelId ?? '';
    this.formCurrentStageLookupValueId = app.currentStageLookupValueId ?? '';
    this.formStatusLookupValueId = app.statusLookupValueId ?? '';
    this.formPriorityLookupValueId = app.priorityLookupValueId ?? '';
    this.formAppliedDate = app.appliedDate ?? '';
    this.formAssignedRecruiterEmployeeId = app.assignedRecruiterEmployeeId ?? '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingApplication = null;
    this.resetForm();
  }

  resetForm() {
    this.formJobId = '';
    this.formCandidateId = '';
    this.formJobPostingChannelId = '';
    this.formCurrentStageLookupValueId = '';
    this.formStatusLookupValueId = '';
    this.formPriorityLookupValueId = '';
    this.formAppliedDate = '';
    this.formAssignedRecruiterEmployeeId = '';
  }

  saveApplication() {
    if (!this.editingApplication) {
      this.error = 'No application selected to update';
      this.cdr.detectChanges();
      return;
    }

    const dto: UpdateApplicationDto = {
      currentStageLookupValueId: this.formCurrentStageLookupValueId || undefined,
      statusLookupValueId: this.formStatusLookupValueId || undefined,
      priorityLookupValueId: this.formPriorityLookupValueId || undefined,
      assignedRecruiterEmployeeId: this.formAssignedRecruiterEmployeeId || undefined,
      jobPostingChannelId: this.formJobPostingChannelId || undefined,
      appliedDate: this.formAppliedDate || undefined,
    };

    this.service.update(this.editingApplication.id, dto).subscribe({
      next: () => {
        this.showForm = false;
        this.loadApplications();
        this.editingApplication = null;
      },
      error: () => {
        this.error = 'Failed to update application';
        this.cdr.detectChanges();
      },
    });
  }

  deleteApplication(app: ApplicationDto) {
    if (!confirm('Delete this application?')) return;
    this.service.delete(app.id).subscribe({
      next: () => this.loadApplications(),
      error: () => {
        this.error = 'Failed to delete application';
        this.cdr.detectChanges();
      },
    });
  }

  changeStatus(app: ApplicationDto, statusLookupValueId: string) {
    const dto: UpdateApplicationDto = { statusLookupValueId };
    this.service.update(app.id, dto).subscribe({
      next: () => this.loadApplications(),
      error: () => {
        this.error = 'Failed to change application status';
        this.cdr.detectChanges();
      },
    });
  }
}
