import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobTitleService } from '../../../../services/job-title.service';
import { JobTitleDto, CreateJobTitleDto, UpdateJobTitleDto } from '../../../../models/job-title.model';

@Component({
  selector: 'lib-settings-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.html',
  styleUrl: './designations.css',
})
export class SettingsDesignationsComponent implements OnInit {
  designations: JobTitleDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingDesignation: JobTitleDto | null = null;

  formDesignationName = '';
  formDesignationCode = '';

  constructor(private service: JobTitleService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadDesignations(); }

  loadDesignations() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.designations = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load designations'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingDesignation = null; this.resetForm(); this.showForm = true; }

  openEditForm(d: JobTitleDto) {
    this.editingDesignation = d;
    this.formDesignationName = d.designationName ?? '';
    this.formDesignationCode = d.designationCode ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formDesignationName = '';
    this.formDesignationCode = '';
  }

  cancelForm() { this.showForm = false; this.editingDesignation = null; this.resetForm(); }

  saveDesignation() {
    if (!this.formDesignationName.trim()) {
      this.error = 'Designation Name is required';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingDesignation) {
      const dto: UpdateJobTitleDto = {
        designationName: this.formDesignationName,
        isActive: this.editingDesignation.isActive,
      };
      this.service.update(this.editingDesignation.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadDesignations(); },
        error: () => { this.error = 'Failed to update designation'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobTitleDto = {
        designationCode: this.formDesignationCode || undefined,
        designationName: this.formDesignationName,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadDesignations(); },
        error: () => { this.error = 'Failed to create designation'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteDesignation(d: JobTitleDto) {
    if (confirm(`Delete designation: ${d.designationName}?`)) {
      this.service.delete(d.id).subscribe({
        next: () => this.loadDesignations(),
        error: () => { this.error = 'Failed to delete designation'; this.cdr.detectChanges(); },
      });
    }
  }
}
