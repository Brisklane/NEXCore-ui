import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../../services/application.service';
import { CandidateService } from '../../../../services/candidate.service';
import { EmployeeService } from '../../../../services/employee.service';
import { JobPostingChannelService } from '../../../../services/job-posting-channel.service';
import { JobRequisitionService } from '../../../../services/job-requisition.service';
import { LookupService } from '../../../../services/lookup.service';
import { ApplicationDto, CreateApplicationDto, UpdateApplicationDto } from '../../../../models/application.model';
import { CandidateDto } from '../../../../models/candidate.model';
import { EmployeeDto } from '../../../../models/employee.model';
import { JobPostingChannelDto } from '../../../../models/job-posting-channel.model';
import { JobRequisitionDto } from '../../../../models/job-requisition.model';
import { LookupValueDto } from '../../../../models/lookup.model';
import { LookupTypeCode } from '../../../../models/hr-enums';

@Component({
  selector: 'lib-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class Applications implements OnInit {
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
    private jobService: JobRequisitionService,
    private jobPostingChannelService: JobPostingChannelService,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadApplications();
    this.loadCandidates();
    this.loadJobs();
    this.loadEmployees();
    this.loadJobPostingChannels();
    this.loadLookups();
  }

  loadCandidates() {
    this.candidateService.getAll().subscribe({
      next: (res) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load candidates'; this.cdr.detectChanges(); },
    });
  }

  loadJobs() {
    this.jobService.getAll().subscribe({
      next: (res) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load jobs'; this.cdr.detectChanges(); },
    });
  }

  loadJobPostingChannels() {
    this.jobPostingChannelService.getAll().subscribe({
      next: (res) => { this.jobPostingChannels = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe({
      next: (res) => { this.employees = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
    });
  }

  loadLookups() {
    this.lookupService.getValuesByTypeCode(LookupTypeCode.ApplicationStatus).subscribe({
      next: (values) => { this.statusValues = values; this.cdr.detectChanges(); },
      error: () => { /* non-fatal */ },
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

  getJobPostingChannelName(id?: string): string {
    if (!id) return '—';
    const channel = this.jobPostingChannels.find((c) => c.id === id);
    return channel ? channel.channelNameSnapshot || channel.id : id;
  }

  getLookupValueName(id: string | undefined, values: LookupValueDto[]): string {
    if (!id) return '—';
    return values.find((value) => value.id === id)?.name ?? id;
  }

  loadApplications() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.applications = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load applications'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingApplication = null; this.resetForm(); this.error = ''; this.showForm = true; }

  openEditForm(a: ApplicationDto) {
    this.editingApplication = a;
    this.formJobId = a.jobId;
    this.formCandidateId = a.candidateId;
    this.formJobPostingChannelId = a.jobPostingChannelId ?? '';
    this.formCurrentStageLookupValueId = a.currentStageLookupValueId ?? '';
    this.formStatusLookupValueId = a.statusLookupValueId ?? '';
    this.formPriorityLookupValueId = a.priorityLookupValueId ?? '';
    this.formAppliedDate = a.appliedDate ?? '';
    this.formAssignedRecruiterEmployeeId = a.assignedRecruiterEmployeeId ?? '';
    this.showForm = true;
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

  cancelForm() { this.showForm = false; this.editingApplication = null; this.resetForm(); }

  getJobTitle(id: string): string {
    const job = this.jobs.find((j) => j.id === id);
    return job ? job.jobTitle || job.jobCode || id : id;
  }

  getCandidateName(id: string): string {
    const candidate = this.candidates.find((c) => c.id === id);
    if (!candidate) {
      return id;
    }
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

  saveApplication() {
    if (!this.formJobId.trim() || !this.formCandidateId.trim()) {
      this.error = 'Job ID and Candidate ID are required';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingApplication) {
      const dto: UpdateApplicationDto = {
        currentStageLookupValueId: this.formCurrentStageLookupValueId || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
        assignedRecruiterEmployeeId: this.formAssignedRecruiterEmployeeId || undefined,
      };
      this.service.update(this.editingApplication.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadApplications(); },
        error: () => { this.error = 'Failed to update application'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateApplicationDto = {
        jobId: this.formJobId,
        candidateId: this.formCandidateId,
        jobPostingChannelId: this.formJobPostingChannelId || undefined,
        appliedDate: this.formAppliedDate || undefined,
        currentStageLookupValueId: this.formCurrentStageLookupValueId || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
        assignedRecruiterEmployeeId: this.formAssignedRecruiterEmployeeId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadApplications(); },
        error: () => { this.error = 'Failed to create application'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteApplication(a: ApplicationDto) {
    if (confirm(`Delete application?`)) {
      this.service.delete(a.id).subscribe({
        next: () => this.loadApplications(),
        error: () => { this.error = 'Failed to delete application'; this.cdr.detectChanges(); },
      });
    }
  }
}
