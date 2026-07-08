import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobTitleService } from '../../services/job-title.service';
import { JobTitleDto, CreateJobTitleDto, UpdateJobTitleDto } from '../../models/job-title.model';

@Component({
  selector: 'lib-job-title',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-title.html',
  styleUrl: './job-title.css',
})
export class JobTitleComponent implements OnInit {
  jobTitles: JobTitleDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingJobTitle: JobTitleDto | null = null;

  formDesignationName = '';
  formDesignationCode = '';
  formIsActive = true;

  constructor(private service: JobTitleService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadJobTitles(); }

  loadJobTitles() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.jobTitles = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load job titles'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingJobTitle = null; this.resetForm(); this.showForm = true; }

  openEditForm(j: JobTitleDto) {
    this.editingJobTitle = j;
    this.formDesignationName = j.designationName ?? '';
    this.formDesignationCode = j.designationCode ?? '';
    this.formIsActive = j.isActive;
    this.showForm = true;
  }

  resetForm() { this.formDesignationName = ''; this.formDesignationCode = ''; this.formIsActive = true; }

  cancelForm() { this.showForm = false; this.editingJobTitle = null; this.resetForm(); }

  saveJobTitle() {
    if (!this.formDesignationName.trim()) {
      this.error = 'Designation Name is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingJobTitle) {
      const dto: UpdateJobTitleDto = {
        designationName: this.formDesignationName,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingJobTitle.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadJobTitles(); },
        error: () => { this.error = 'Failed to update designation'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobTitleDto = {
        designationCode: this.formDesignationCode || undefined,
        designationName: this.formDesignationName,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadJobTitles(); },
        error: () => { this.error = 'Failed to create designation'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteJobTitle(j: JobTitleDto) {
    if (confirm(`Delete designation "${j.designationName}"?`)) {
      this.service.delete(j.id).subscribe({
        next: () => this.loadJobTitles(),
        error: () => { this.error = 'Failed to delete designation'; this.cdr.detectChanges(); },
      });
    }
  }
}
