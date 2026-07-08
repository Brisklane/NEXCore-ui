import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../services/interview.service';
import { ApplicationService } from '../../services/application.service';
import { CandidateService } from '../../services/candidate.service';
import { JobRequisitionService } from '../../services/job-requisition.service';
import { InterviewDto, CreateInterviewDto, UpdateInterviewDto } from '../../models/interview.model';
import { ApplicationDto } from '../../models/application.model';
import { CandidateDto } from '../../models/candidate.model';
import { JobRequisitionDto } from '../../models/job-requisition.model';

@Component({
  selector: 'lib-interview-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-crud.html',
  styleUrl: './interview-crud.css',
})
export class InterviewCrudComponent implements OnInit {
  interviews: InterviewDto[] = [];
  applications: ApplicationDto[] = [];
  candidates: CandidateDto[] = [];
  jobs: JobRequisitionDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingInterview: InterviewDto | null = null;

  formInterviewCode = '';
  formApplicationId = '';
  formCandidateId = '';
  formJobId = '';
  formInterviewTitle = '';
  formInterviewTypeLookupValueId = '';
  formInterviewSequenceNo: number | null = null;
  formStatusLookupValueId = '';
  formScheduledStart = '';
  formScheduledEnd = '';
  formDurationMinutes: number | null = null;
  formFormat = 0;
  formLocation = '';
  formVideoLink = '';
  formIsMandatoryRound = false;

  readonly formatOptions = [
    { value: 0, label: 'In Person' },
    { value: 1, label: 'Video' },
    { value: 2, label: 'Phone' },
    { value: 3, label: 'Technical' },
  ];

  readonly interviewTypeOptions = [
    { value: '1', label: 'HR Screen' },
    { value: '2', label: 'Technical' },
    { value: '3', label: 'Panel' },
    { value: '4', label: 'Managerial' },
    { value: '5', label: 'Final' },
  ];

  readonly statusOptions = [
    { value: '1', label: 'Scheduled' },
    { value: '2', label: 'Confirmed' },
    { value: '3', label: 'Completed' },
    { value: '4', label: 'Cancelled' },
    { value: '5', label: 'No Show' },
  ];

  constructor(
    private service: InterviewService,
    private applicationService: ApplicationService,
    private candidateService: CandidateService,
    private jobService: JobRequisitionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadInterviews();
    this.applicationService.getAll().subscribe({
      next: (res) => { this.applications = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.candidateService.getAll().subscribe({
      next: (res) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobService.getAll().subscribe({
      next: (res) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
    });
  }

  loadInterviews() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.interviews = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load interviews'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingInterview = null; this.resetForm(); this.showForm = true; }

  openEditForm(i: InterviewDto) {
    this.editingInterview = i;
    this.formInterviewCode = i.interviewCode ?? '';
    this.formApplicationId = i.applicationId;
    this.formCandidateId = i.candidateId;
    this.formJobId = i.jobId;
    this.formInterviewTitle = i.interviewTitle ?? '';
    this.formInterviewTypeLookupValueId = i.interviewTypeLookupValueId ?? '';
    this.formInterviewSequenceNo = i.interviewSequenceNo ?? null;
    this.formStatusLookupValueId = i.statusLookupValueId ?? '';
    this.formScheduledStart = i.scheduledStart ?? '';
    this.formScheduledEnd = i.scheduledEnd ?? '';
    this.formDurationMinutes = i.durationMinutes ?? null;
    this.formFormat = i.format ?? 0;
    this.formLocation = i.location ?? '';
    this.formVideoLink = i.videoLink ?? '';
    this.formIsMandatoryRound = i.isMandatoryRound;
    this.showForm = true;
  }

  resetForm() {
    this.formInterviewCode = '';
    this.formApplicationId = '';
    this.formCandidateId = '';
    this.formJobId = '';
    this.formInterviewTitle = '';
    this.formInterviewTypeLookupValueId = '';
    this.formInterviewSequenceNo = null;
    this.formStatusLookupValueId = '';
    this.formScheduledStart = '';
    this.formScheduledEnd = '';
    this.formDurationMinutes = null;
    this.formFormat = 0;
    this.formLocation = '';
    this.formVideoLink = '';
    this.formIsMandatoryRound = false;
  }

  cancelForm() { this.showForm = false; this.editingInterview = null; this.resetForm(); }

  getApplicationLabel(id: string): string {
    const a = this.applications.find(a => a.id === id);
    return a ? (a.applicationCode ?? a.id) : id;
  }

  getCandidateName(id: string): string {
    const c = this.candidates.find(c => c.id === id);
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || id : id;
  }

  getJobTitle(id: string): string {
    const j = this.jobs.find(j => j.id === id);
    return j ? (j.jobTitle ?? j.jobCode ?? id) : id;
  }

  getFormatLabel(format?: number): string {
    return this.formatOptions.find(f => f.value === format)?.label ?? '—';
  }

  getStatusLabel(id?: string): string {
    return this.statusOptions.find(s => s.value === id)?.label ?? id ?? '—';
  }

  saveInterview() {
    if (this.editingInterview) {
      const dto: UpdateInterviewDto = {
        interviewTitle: this.formInterviewTitle || undefined,
        interviewTypeLookupValueId: this.formInterviewTypeLookupValueId || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        scheduledStart: this.formScheduledStart || undefined,
        scheduledEnd: this.formScheduledEnd || undefined,
        durationMinutes: this.formDurationMinutes ?? undefined,
        format: this.formFormat,
        location: this.formLocation || undefined,
        videoLink: this.formVideoLink || undefined,
      };
      this.service.update(this.editingInterview.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadInterviews(); },
        error: () => { this.error = 'Failed to update interview'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateInterviewDto = {
        interviewCode: this.formInterviewCode || undefined,
        applicationId: this.formApplicationId,
        candidateId: this.formCandidateId,
        jobId: this.formJobId,
        interviewTitle: this.formInterviewTitle || undefined,
        interviewTypeLookupValueId: this.formInterviewTypeLookupValueId || undefined,
        interviewSequenceNo: this.formInterviewSequenceNo ?? undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        scheduledStart: this.formScheduledStart || undefined,
        scheduledEnd: this.formScheduledEnd || undefined,
        durationMinutes: this.formDurationMinutes ?? undefined,
        format: this.formFormat,
        location: this.formLocation || undefined,
        videoLink: this.formVideoLink || undefined,
        isMandatoryRound: this.formIsMandatoryRound,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadInterviews(); },
        error: () => { this.error = 'Failed to create interview'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteInterview(i: InterviewDto) {
    if (confirm('Delete this interview?')) {
      this.service.delete(i.id).subscribe({
        next: () => this.loadInterviews(),
        error: () => { this.error = 'Failed to delete interview'; this.cdr.detectChanges(); },
      });
    }
  }
}
