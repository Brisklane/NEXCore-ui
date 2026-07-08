import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { CandidateService } from '../../services/candidate.service';
import { JobRequisitionService } from '../../services/job-requisition.service';
import { ApplicationDto, CreateApplicationDto, UpdateApplicationDto } from '../../models/application.model';
import { CandidateDto } from '../../models/candidate.model';
import { JobRequisitionDto } from '../../models/job-requisition.model';

@Component({
  selector: 'lib-hr-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-application.html',
  styleUrls: ['./hr-application.css'],
})
export class HrApplicationComponent implements OnInit {
  applications: ApplicationDto[] = [];
  jobs: JobRequisitionDto[] = [];
  candidates: CandidateDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingApplication: ApplicationDto | null = null;

  formApplicationCode = '';
  formJobId = '';
  formCandidateId = '';
  formAppliedDate = '';
  formStatusLookupValueId = '';
  formPriorityLookupValueId = '';
  formIsShortlisted = false;
  formScreeningScore: number | null = null;
  formAssignedRecruiterEmployeeId = '';

  filterJobId = '';
  filterCandidateId = '';

  readonly statusOptions = [
    { value: '1', label: 'Applied' },
    { value: '2', label: 'Screening' },
    { value: '3', label: 'Shortlisted' },
    { value: '4', label: 'Interview' },
    { value: '5', label: 'Offer' },
    { value: '6', label: 'Hired' },
    { value: '7', label: 'Rejected' },
    { value: '8', label: 'Withdrawn' },
  ];

  readonly priorityOptions = [
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
    { value: '4', label: 'Critical' },
  ];

  constructor(
    private service: ApplicationService,
    private candidateService: CandidateService,
    private jobService: JobRequisitionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadApplications();
    this.candidateService.getAll().subscribe({
      next: (res) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobService.getAll().subscribe({
      next: (res) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
    });
  }

  loadApplications() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.applications = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load applications'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  filterByJob() {
    if (!this.filterJobId.trim()) { this.loadApplications(); return; }
    this.loading = true;
    this.service.getByJob(this.filterJobId.trim()).subscribe({
      next: (res) => { this.applications = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to filter by job'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  filterByCandidate() {
    if (!this.filterCandidateId.trim()) { this.loadApplications(); return; }
    this.loading = true;
    this.service.getByCandidate(this.filterCandidateId.trim()).subscribe({
      next: (res) => { this.applications = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to filter by candidate'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  clearFilters() {
    this.filterJobId = '';
    this.filterCandidateId = '';
    this.loadApplications();
  }

  openCreateForm() { this.editingApplication = null; this.resetForm(); this.error = ''; this.showForm = true; }

  openEditForm(a: ApplicationDto) {
    this.error = '';
    this.editingApplication = a;
    this.formApplicationCode = a.applicationCode ?? '';
    this.formJobId = a.jobId;
    this.formCandidateId = a.candidateId;
    this.formAppliedDate = a.appliedDate ?? '';
    this.formStatusLookupValueId = a.statusLookupValueId ?? '';
    this.formPriorityLookupValueId = a.priorityLookupValueId ?? '';
    this.formIsShortlisted = a.isShortlisted;
    this.formScreeningScore = a.screeningScore ?? null;
    this.formAssignedRecruiterEmployeeId = a.assignedRecruiterEmployeeId ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formApplicationCode = '';
    this.formJobId = '';
    this.formCandidateId = '';
    this.formAppliedDate = '';
    this.formStatusLookupValueId = '';
    this.formPriorityLookupValueId = '';
    this.formIsShortlisted = false;
    this.formScreeningScore = null;
    this.formAssignedRecruiterEmployeeId = '';
  }

  cancelForm() { this.showForm = false; this.editingApplication = null; this.resetForm(); }

  getJobTitle(id: string): string {
    const j = this.jobs.find(j => j.id === id);
    return j ? (j.jobTitle ?? j.jobCode ?? id) : id;
  }

  getCandidateName(id: string): string {
    const c = this.candidates.find(c => c.id === id);
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || id : id;
  }

  getStatusLabel(id?: string): string {
    return this.statusOptions.find(s => s.value === id)?.label ?? id ?? '—';
  }

  getPriorityLabel(id?: string): string {
    return this.priorityOptions.find(p => p.value === id)?.label ?? id ?? '—';
  }

  getStatusClass(id?: string): Record<string, boolean> {
    const label = this.getStatusLabel(id);
    return {
      'badge-active': ['Hired', 'Shortlisted', 'Offer'].includes(label),
      'badge-inactive': ['Rejected', 'Withdrawn'].includes(label),
    };
  }

  saveApplication() {
    if (!this.formJobId) {
      this.error = 'Please select a Job';
      this.cdr.detectChanges();
      return;
    }
    if (!this.formCandidateId) {
      this.error = 'Please select a Candidate';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingApplication) {
      const dto: UpdateApplicationDto = {
        appliedDate: this.formAppliedDate || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
        isShortlisted: this.formIsShortlisted,
        screeningScore: this.formScreeningScore ?? undefined,
      };
      this.service.update(this.editingApplication.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadApplications(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to update application'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateApplicationDto = {
        applicationCode: this.formApplicationCode || undefined,
        jobId: this.formJobId,
        candidateId: this.formCandidateId,
        appliedDate: this.formAppliedDate || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        priorityLookupValueId: this.formPriorityLookupValueId || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadApplications(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to create application'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteApplication(a: ApplicationDto) {
    if (confirm('Delete this application?')) {
      this.service.delete(a.id).subscribe({
        next: () => this.loadApplications(),
        error: () => { this.error = 'Failed to delete application'; this.cdr.detectChanges(); },
      });
    }
  }
}

