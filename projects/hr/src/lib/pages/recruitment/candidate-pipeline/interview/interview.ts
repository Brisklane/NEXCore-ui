import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../../../services/interview.service';
import { InterviewDto, CreateInterviewDto, UpdateInterviewDto } from '../../../../models/interview.model';

@Component({
  selector: 'lib-interview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview.html',
  styleUrl: './interview.css',
})
export class Interview implements OnInit {
  interviews: InterviewDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingInterview: InterviewDto | null = null;

  formApplicationId = '';
  formCandidateId = '';
  formJobId = '';
  formInterviewTitle = '';
  formScheduledStart = '';
  formScheduledEnd = '';
  formDurationMinutes: number | '' = '';
  formFormat: number | '' = '';
  formStatusLookupValueId = '';
  formLocation = '';
  formVideoLink = '';
  formIsMandatoryRound = false;

  formatOptions = [
    { value: 0, label: 'In Person' },
    { value: 1, label: 'Video' },
    { value: 2, label: 'Phone' },
    { value: 3, label: 'Technical' },
  ];

  constructor(private service: InterviewService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadInterviews(); }

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
    this.formApplicationId = i.applicationId;
    this.formCandidateId = i.candidateId;
    this.formJobId = i.jobId;
    this.formInterviewTitle = i.interviewTitle ?? '';
    this.formScheduledStart = i.scheduledStart ?? '';
    this.formScheduledEnd = i.scheduledEnd ?? '';
    this.formDurationMinutes = i.durationMinutes ?? '';
    this.formFormat = i.format ?? '';
    this.formStatusLookupValueId = i.statusLookupValueId ?? '';
    this.formLocation = i.location ?? '';
    this.formVideoLink = i.videoLink ?? '';
    this.formIsMandatoryRound = i.isMandatoryRound;
    this.showForm = true;
  }

  resetForm() {
    this.formApplicationId = '';
    this.formCandidateId = '';
    this.formJobId = '';
    this.formInterviewTitle = '';
    this.formScheduledStart = '';
    this.formScheduledEnd = '';
    this.formDurationMinutes = '';
    this.formFormat = '';
    this.formStatusLookupValueId = '';
    this.formLocation = '';
    this.formVideoLink = '';
    this.formIsMandatoryRound = false;
  }

  cancelForm() { this.showForm = false; this.editingInterview = null; this.resetForm(); }

  saveInterview() {
    if (!this.formApplicationId.trim() || !this.formCandidateId.trim() || !this.formJobId.trim()) {
      this.error = 'Application, Candidate and Job are required';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingInterview) {
      const dto: UpdateInterviewDto = {
        interviewTitle: this.formInterviewTitle || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        scheduledStart: this.formScheduledStart || undefined,
        scheduledEnd: this.formScheduledEnd || undefined,
        durationMinutes: this.formDurationMinutes !== '' ? Number(this.formDurationMinutes) : undefined,
        format: this.formFormat !== '' ? Number(this.formFormat) : undefined,
        location: this.formLocation || undefined,
        videoLink: this.formVideoLink || undefined,
      };
      this.service.update(this.editingInterview.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadInterviews(); },
        error: () => { this.error = 'Failed to update interview'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateInterviewDto = {
        applicationId: this.formApplicationId,
        candidateId: this.formCandidateId,
        jobId: this.formJobId,
        interviewTitle: this.formInterviewTitle || undefined,
        scheduledStart: this.formScheduledStart || undefined,
        scheduledEnd: this.formScheduledEnd || undefined,
        durationMinutes: this.formDurationMinutes !== '' ? Number(this.formDurationMinutes) : undefined,
        format: this.formFormat !== '' ? Number(this.formFormat) : undefined,
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
    if (confirm(`Delete interview?`)) {
      this.service.delete(i.id).subscribe({
        next: () => this.loadInterviews(),
        error: () => { this.error = 'Failed to delete interview'; this.cdr.detectChanges(); },
      });
    }
  }
}
