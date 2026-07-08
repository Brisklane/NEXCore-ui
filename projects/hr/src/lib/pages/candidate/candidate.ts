import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { CandidateDto, CreateCandidateDto, UpdateCandidateDto } from '../../models/candidate.model';

@Component({
  selector: 'lib-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate.html',
  styleUrl: './candidate.css',
})
export class CandidateComponent implements OnInit {
  candidates: CandidateDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCandidate: CandidateDto | null = null;
  blacklistReason = '';
  showBlacklistForm = false;
  blacklistTargetId = '';

  formCandidateCode = '';
  formFirstName = '';
  formLastName = '';
  formEmail = '';
  formPhone = '';
  formResumeUrl = '';
  formCurrentCompany = '';
  formSource = 0;
  formTotalExperienceYears: number | null = null;
  formCurrentSalary: number | null = null;
  formExpectedSalary: number | null = null;
  formConsentGiven = false;

  readonly sourceOptions = [
    { value: 0, label: 'Unknown' },
    { value: 1, label: 'LinkedIn' },
    { value: 2, label: 'Referral' },
    { value: 3, label: 'Direct' },
    { value: 4, label: 'Job Board' },
    { value: 5, label: 'Agency' },
  ];

  constructor(private service: CandidateService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadCandidates(); }

  loadCandidates() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.candidates = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load candidates'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingCandidate = null; this.resetForm(); this.showForm = true; }

  openEditForm(c: CandidateDto) {
    this.editingCandidate = c;
    this.formCandidateCode = c.candidateCode ?? '';
    this.formFirstName = c.firstName ?? '';
    this.formLastName = c.lastName ?? '';
    this.formEmail = c.email ?? '';
    this.formPhone = c.phone ?? '';
    this.formResumeUrl = c.resumeUrl ?? '';
    this.formCurrentCompany = c.currentCompany ?? '';
    this.formSource = c.source ?? 0;
    this.formTotalExperienceYears = c.totalExperienceYears ?? null;
    this.formCurrentSalary = c.currentSalary ?? null;
    this.formExpectedSalary = c.expectedSalary ?? null;
    this.formConsentGiven = c.consentGiven;
    this.showForm = true;
  }

  resetForm() {
    this.formCandidateCode = '';
    this.formFirstName = '';
    this.formLastName = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formResumeUrl = '';
    this.formCurrentCompany = '';
    this.formSource = 0;
    this.formTotalExperienceYears = null;
    this.formCurrentSalary = null;
    this.formExpectedSalary = null;
    this.formConsentGiven = false;
  }

  cancelForm() { this.showForm = false; this.editingCandidate = null; this.resetForm(); }

  getSourceLabel(source?: number): string {
    return this.sourceOptions.find(s => s.value === source)?.label ?? '-';
  }

  saveCandidate() {
    if (this.editingCandidate) {
      const dto: UpdateCandidateDto = {
        firstName: this.formFirstName?.trim() || undefined,
        lastName: this.formLastName?.trim() || undefined,
        email: this.formEmail?.trim() || undefined,
        phone: this.formPhone?.trim() || undefined,
        resumeUrl: this.formResumeUrl?.trim() || undefined,
        currentCompany: this.formCurrentCompany?.trim() || undefined,
        source: this.formSource ? Number(this.formSource) : undefined,
        totalExperienceYears: this.formTotalExperienceYears ?? undefined,
        currentSalary: this.formCurrentSalary ?? undefined,
        expectedSalary: this.formExpectedSalary ?? undefined,
        consentGiven: this.formConsentGiven,
      };
      this.service.update(this.editingCandidate.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadCandidates(); },
        error: () => { this.error = 'Failed to update candidate'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateCandidateDto = {
        candidateCode: this.formCandidateCode?.trim() || undefined,
        firstName: this.formFirstName?.trim() || undefined,
        lastName: this.formLastName?.trim() || undefined,
        email: this.formEmail?.trim() || undefined,
        phone: this.formPhone?.trim() || undefined,
        resumeUrl: this.formResumeUrl?.trim() || undefined,
        currentCompany: this.formCurrentCompany?.trim() || undefined,
        source: this.formSource ? Number(this.formSource) : undefined,
        totalExperienceYears: this.formTotalExperienceYears ?? undefined,
        currentSalary: this.formCurrentSalary ?? undefined,
        expectedSalary: this.formExpectedSalary ?? undefined,
        consentGiven: this.formConsentGiven,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadCandidates(); },
        error: () => { this.error = 'Failed to create candidate'; this.cdr.detectChanges(); },
      });
    }
  }

  openBlacklistForm(c: CandidateDto) {
    this.blacklistTargetId = c.id;
    this.blacklistReason = '';
    this.showBlacklistForm = true;
  }

  confirmBlacklist() {
    this.service.blacklist(this.blacklistTargetId, this.blacklistReason).subscribe({
      next: () => { this.showBlacklistForm = false; this.loadCandidates(); },
      error: () => { this.error = 'Failed to blacklist candidate'; this.cdr.detectChanges(); },
    });
  }

  unblacklist(c: CandidateDto) {
    this.service.unblacklist(c.id).subscribe({
      next: () => this.loadCandidates(),
      error: () => { this.error = 'Failed to remove from blacklist'; this.cdr.detectChanges(); },
    });
  }

  deleteCandidate(c: CandidateDto) {
    if (confirm(`Delete candidate "${c.firstName} ${c.lastName}"?`)) {
      this.service.delete(c.id).subscribe({
        next: () => this.loadCandidates(),
        error: () => { this.error = 'Failed to delete candidate'; this.cdr.detectChanges(); },
      });
    }
  }
}
