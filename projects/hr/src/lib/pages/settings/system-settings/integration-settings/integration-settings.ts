import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../../services/lookup.service';

@Component({
  selector: 'lib-integration-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './integration-settings.html',
  styleUrl: './integration-settings.css',
})
export class IntegrationSettingsComponent implements OnInit {
  integrations: any[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadIntegrations(); }

  loadIntegrations() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.integrations = [];
    this.loading = false;
    this.cdr.detectChanges();
  }

  seedLookupValues() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.lookupService.seedLookupValues().subscribe({
      next: () => {
        this.success = 'Lookup values seeded successfully.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to seed lookup values.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
