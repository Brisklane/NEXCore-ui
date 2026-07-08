import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.css',
})
export class NotificationSettingsComponent implements OnInit {
  settings: any = {};
  loading = false;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadSettings(); }

  loadSettings() {
    this.loading = true;
    this.error = '';
    this.settings = {};
    this.loading = false;
    this.cdr.detectChanges();
  }
}
