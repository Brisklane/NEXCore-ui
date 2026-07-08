import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobLocationService } from '../../../../services/job-location.service';
import { JobLocationDto, CreateJobLocationDto, UpdateJobLocationDto } from '../../../../models/job-location.model';

@Component({
  selector: 'lib-settings-job-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-locations.html',
  styleUrl: '../../../shared-styles.css',
})
export class SettingsJobLocationsComponent implements OnInit {
  locations: JobLocationDto[] = [];
  loading = false;
  error = '';
  saving = false;
  saveError = '';

  showForm = false;
  editingLocation: JobLocationDto | null = null;

  formCode = '';
  formName = '';
  formAddress = '';
  formCity = '';
  formState = '';
  formPostalCode = '';
  formCountry = '';
  formIsActive = true;

  constructor(private service: JobLocationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadLocations(); }

  loadLocations() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => { this.locations = res.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load job locations.'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingLocation = null; this.resetForm(); this.showForm = true; this.saveError = ''; }

  openEditForm(loc: JobLocationDto) {
    this.editingLocation = loc;
    this.formCode = loc.locationCode ?? '';
    this.formName = loc.locationName ?? '';
    this.formAddress = loc.address ?? '';
    this.formCity = loc.city ?? '';
    this.formState = loc.stateProvince ?? '';
    this.formPostalCode = loc.postalCode ?? '';
    this.formCountry = loc.country ?? '';
    this.formIsActive = loc.isActive;
    this.showForm = true;
    this.saveError = '';
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formAddress = '';
    this.formCity = '';
    this.formState = '';
    this.formPostalCode = '';
    this.formCountry = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingLocation = null; this.resetForm(); this.saveError = ''; }

  saveLocation() {
    if (!this.formName.trim()) { this.saveError = 'Location Name is required.'; return; }
    this.saving = true;
    this.saveError = '';

    if (this.editingLocation) {
      const dto: UpdateJobLocationDto = {
        locationName: this.formName,
        address: this.formAddress || undefined,
        city: this.formCity || undefined,
        stateProvince: this.formState || undefined,
        postalCode: this.formPostalCode || undefined,
        country: this.formCountry || undefined,
        isActive: this.formIsActive,
      };
      this.service.update(this.editingLocation.id, dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadLocations(); },
        error: () => { this.saving = false; this.saveError = 'Failed to update location.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateJobLocationDto = {
        locationCode: this.formCode || undefined,
        locationName: this.formName,
        address: this.formAddress || undefined,
        city: this.formCity || undefined,
        stateProvince: this.formState || undefined,
        postalCode: this.formPostalCode || undefined,
        country: this.formCountry || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.saving = false; this.cancelForm(); this.loadLocations(); },
        error: () => { this.saving = false; this.saveError = 'Failed to create location.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteLocation(loc: JobLocationDto) {
    if (!confirm(`Delete location "${loc.locationName}"?`)) return;
    this.service.delete(loc.id).subscribe({
      next: () => this.loadLocations(),
      error: () => { this.error = 'Failed to delete location.'; this.cdr.detectChanges(); },
    });
  }
}
