import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllowancesProfileService } from '../../services/allowances-profile.service';
import { AllowancesProfileDto, CreateAllowancesProfileDto, UpdateAllowancesProfileDto } from '../../models/allowances-profile.model';

@Component({
  selector: 'lib-allowances-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allowances-profile.html',
  styleUrl: './allowances-profile.css',
})
export class AllowancesProfileComponent implements OnInit {
  profiles: AllowancesProfileDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingProfile: AllowancesProfileDto | null = null;

  formName = '';
  formDescription = '';
  formIsActive = true;

  constructor(
    private service: AllowancesProfileService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => {
        this.profiles = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load allowances profiles';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingProfile = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(profile: AllowancesProfileDto) {
    this.editingProfile = profile;
    this.formName = profile.name ?? '';
    this.formDescription = profile.description ?? '';
    this.formIsActive = profile.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formDescription = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingProfile = null;
    this.resetForm();
  }

  saveProfile() {
    if (this.editingProfile) {
      const dto: UpdateAllowancesProfileDto = {
        name: this.formName,
        description: this.formDescription,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingProfile.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadProfiles(); },
        error: () => { this.error = 'Failed to update profile'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateAllowancesProfileDto = {
        name: this.formName,
        description: this.formDescription,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadProfiles(); },
        error: () => { this.error = 'Failed to create profile'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteProfile(profile: AllowancesProfileDto) {
    if (confirm(`Delete allowances profile "${profile.name}"?`)) {
      this.service.delete(profile.id).subscribe({
        next: () => this.loadProfiles(),
        error: () => { this.error = 'Failed to delete profile'; this.cdr.detectChanges(); },
      });
    }
  }
}
