import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-settings-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class SettingsLocationsComponent implements OnInit {
  locations: any[] = [];
  loading = false;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadLocations(); }

  loadLocations() {
    this.loading = true;
    this.error = '';
    this.locations = [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}
