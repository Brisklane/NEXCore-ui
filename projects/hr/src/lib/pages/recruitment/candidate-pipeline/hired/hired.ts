import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../../services/candidate.service';
import { CandidateDto } from '../../../../models/candidate.model';
import { ApiResponse } from '../../../../models/api-response.model';

@Component({
  selector: 'lib-hired',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hired.html',
  styleUrl: './hired.css',
})
export class Hired implements OnInit {
  candidates: CandidateDto[] = [];
  loading = false;
  error = '';

  readonly sourceOptions = [
    { value: 0, label: 'Unknown' },
    { value: 1, label: 'LinkedIn' },
    { value: 2, label: 'Referral' },
    { value: 3, label: 'Direct' },
    { value: 4, label: 'Job Board' },
    { value: 5, label: 'Agency' },
  ];

  constructor(private service: CandidateService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res: ApiResponse<CandidateDto[]>) => { this.candidates = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load candidates'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  getSourceLabel(source?: number): string {
    return this.sourceOptions.find((s) => s.value === source)?.label ?? 'Unknown';
  }

  getStatusLabel(c: CandidateDto): string {
    return c.isBlacklisted ? 'Blacklisted' : 'Active';
  }
}
