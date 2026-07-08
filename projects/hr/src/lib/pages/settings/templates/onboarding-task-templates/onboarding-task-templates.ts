import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-onboarding-task-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding-task-templates.html',
  styleUrl: './onboarding-task-templates.css',
})
export class OnboardingTaskTemplatesComponent implements OnInit {
  templates: any[] = [];
  loading = false;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadTemplates(); }

  loadTemplates() {
    this.loading = true;
    this.error = '';
    this.templates = [];
    this.loading = false;
    this.cdr.detectChanges();
  }
}
