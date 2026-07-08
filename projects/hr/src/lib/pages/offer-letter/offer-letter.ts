import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferLetterService } from '../../services/offer-letter.service';
import { ApplicationService } from '../../services/application.service';
import { CandidateService } from '../../services/candidate.service';
import { JobRequisitionService } from '../../services/job-requisition.service';
import { JobOfferService } from '../../services/job-offer.service';
import { EmployeeService } from '../../services/employee.service';
import { LookupService } from '../../services/lookup.service';
import { OfferLetterDto, CreateOfferLetterDto, UpdateOfferLetterDto } from '../../models/offer-letter.model';
import { ApplicationDto } from '../../models/application.model';
import { CandidateDto } from '../../models/candidate.model';
import { JobRequisitionDto } from '../../models/job-requisition.model';
import { JobOfferDto } from '../../models/job-offer.model';
import { EmployeeDto } from '../../models/employee.model';
import { LookupValueDto } from '../../models/lookup.model';
import { LookupTypeCode } from '../../models/hr-enums';
import { ApiResponse } from '../../models/api-response.model';

@Component({
  selector: 'lib-offer-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offer-letter.html',
  styleUrl: './offer-letter.css',
})
export class OfferLetterComponent implements OnInit {
  letters: OfferLetterDto[] = [];
  applications: ApplicationDto[] = [];
  candidates: CandidateDto[] = [];
  jobs: JobRequisitionDto[] = [];
  jobOffers: JobOfferDto[] = [];
  employees: EmployeeDto[] = [];
  statusValues: LookupValueDto[] = [];

  loading = false;
  error = '';
  showForm = false;
  editingLetter: OfferLetterDto | null = null;

  formApplicationId = '';
  formCandidateId = '';
  formJobId = '';
  formJobOfferId = '';
  formLetterContent = '';
  formIssuedDate = '';
  formExpiryDate = '';
  formStatusLookupValueId = '';
  formGeneratedByEmployeeId = '';
  formNotes = '';

  constructor(
    private service: OfferLetterService,
    private applicationService: ApplicationService,
    private candidateService: CandidateService,
    private jobService: JobRequisitionService,
    private jobOfferService: JobOfferService,
    private employeeService: EmployeeService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLetters();
    this.applicationService.getAll().subscribe({
      next: (res: ApiResponse<ApplicationDto[]>) => { this.applications = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.candidateService.getAll().subscribe({
      next: (res: ApiResponse<CandidateDto[]>) => { this.candidates = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobService.getAll().subscribe({
      next: (res: ApiResponse<JobRequisitionDto[]>) => { this.jobs = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.jobOfferService.getAll().subscribe({
      next: (res: ApiResponse<JobOfferDto[]>) => { this.jobOffers = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.employeeService.getAll().subscribe({
      next: (res: ApiResponse<EmployeeDto[]>) => { this.employees = res.data ?? []; this.cdr.detectChanges(); },
    });
    this.lookupService.getValuesByTypeCode(LookupTypeCode.OfferStatus).subscribe({
      next: (values) => { this.statusValues = values; this.cdr.detectChanges(); },
    });
  }

  getApplicationLabel(id?: string): string {
    if (!id) return '—';
    const app = this.applications.find(a => a.id === id);
    return app ? (app.applicationCode ?? id) : id;
  }

  getCandidateLabel(id?: string): string {
    if (!id) return '—';
    const c = this.candidates.find(c => c.id === id);
    return c ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || (c.candidateCode ?? id) : id;
  }

  getJobLabel(id?: string): string {
    if (!id) return '—';
    const j = this.jobs.find(j => j.id === id);
    return j ? (j.jobTitle ?? j.jobCode ?? id) : id;
  }

  getJobOfferLabel(id?: string): string {
    if (!id) return '—';
    const offer = this.jobOffers.find(o => o.id === id);
    return offer ? `${this.getApplicationLabel(offer.applicationId)} — ${offer.offerDate ?? id}` : id;
  }

  getEmployeeLabel(id?: string): string {
    if (!id) return '—';
    const e = this.employees.find(e => e.id === id);
    return e ? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || (e.employeeCode ?? id) : id;
  }

  getStatusLabel(id?: string): string {
    if (!id) return '—';
    const v = this.statusValues.find(v => v.id === id);
    return v ? (v.name ?? v.code ?? id) : id;
  }

  loadLetters() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.letters = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load offer letters.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingLetter = null; this.resetForm(); this.showForm = true; }

  openEditForm(letter: OfferLetterDto) {
    this.editingLetter = letter;
    this.formApplicationId = letter.applicationId ?? '';
    this.formCandidateId = letter.candidateId ?? '';
    this.formJobId = letter.jobId ?? '';
    this.formJobOfferId = letter.jobOfferId ?? '';
    this.formLetterContent = letter.letterContent ?? '';
    this.formIssuedDate = letter.issuedDate ?? '';
    this.formExpiryDate = letter.expiryDate ?? '';
    this.formStatusLookupValueId = letter.statusLookupValueId ?? '';
    this.formGeneratedByEmployeeId = letter.generatedByEmployeeId ?? '';
    this.formNotes = letter.notes ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formApplicationId = '';
    this.formCandidateId = '';
    this.formJobId = '';
    this.formJobOfferId = '';
    this.formLetterContent = '';
    this.formIssuedDate = '';
    this.formExpiryDate = '';
    this.formStatusLookupValueId = '';
    this.formGeneratedByEmployeeId = '';
    this.formNotes = '';
  }

  cancelForm() { this.showForm = false; this.editingLetter = null; this.resetForm(); }

  saveLetter() {
    if (this.editingLetter) {
      const dto: UpdateOfferLetterDto = {
        letterContent: this.formLetterContent || undefined,
        issuedDate: this.formIssuedDate || undefined,
        expiryDate: this.formExpiryDate || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        generatedByEmployeeId: this.formGeneratedByEmployeeId || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.update(this.editingLetter.id, dto).subscribe({
        next: () => { this.cancelForm(); this.loadLetters(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to update offer letter.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateOfferLetterDto = {
        applicationId: this.formApplicationId || undefined,
        candidateId: this.formCandidateId || undefined,
        jobId: this.formJobId || undefined,
        jobOfferId: this.formJobOfferId || undefined,
        letterContent: this.formLetterContent || undefined,
        issuedDate: this.formIssuedDate || undefined,
        expiryDate: this.formExpiryDate || undefined,
        statusLookupValueId: this.formStatusLookupValueId || undefined,
        generatedByEmployeeId: this.formGeneratedByEmployeeId || undefined,
        notes: this.formNotes || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.cancelForm(); this.loadLetters(); },
        error: (err) => { this.error = err?.error?.message ?? 'Failed to create offer letter.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteLetter(letter: OfferLetterDto) {
    if (!confirm('Delete this offer letter?')) return;
    this.service.delete(letter.id).subscribe({
      next: () => this.loadLetters(),
      error: () => { this.error = 'Failed to delete offer letter.'; this.cdr.detectChanges(); },
    });
  }
}
