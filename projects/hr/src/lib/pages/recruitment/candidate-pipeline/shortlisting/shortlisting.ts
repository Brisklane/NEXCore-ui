import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../../services/application.service';
import { ApplicationDto } from '../../../../models/application.model';

@Component({
  selector: 'lib-shortlisting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shortlisting.html',
  styleUrl: './shortlisting.css',
})
export class Shortlisting implements OnInit {
  applications: ApplicationDto[] = [];
  loading = false;
  error = '';
  selectedApplication: ApplicationDto | null = null;
  shortlistNotes = '';
  rating = 0;

  constructor(private service: ApplicationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadApplications(); }

  loadApplications() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { 
        this.applications = (res.data ?? []).filter(a => a.statusLookupValueId === '3');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load applications'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  selectForShortlist(app: ApplicationDto) {
    this.selectedApplication = app;
    this.shortlistNotes = '';
    this.rating = 0;
  }

  moveToInterview() {
    if (!this.selectedApplication) return;
    const dto = { statusLookupValueId: '4', isShortlisted: true };
    this.service.update(this.selectedApplication.id, dto).subscribe({
      next: () => { this.loadApplications(); this.selectedApplication = null; },
      error: () => { this.error = 'Failed to update application'; this.cdr.detectChanges(); },
    });
  }

  rejectCandidate() {
    if (!this.selectedApplication) return;
    const dto = { statusLookupValueId: '7' };
    this.service.update(this.selectedApplication.id, dto).subscribe({
      next: () => { this.loadApplications(); this.selectedApplication = null; },
      error: () => { this.error = 'Failed to update application'; this.cdr.detectChanges(); },
    });
  }
}
